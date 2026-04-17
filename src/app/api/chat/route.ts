import { streamText, tool, stepCountIs, convertToModelMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { PIPELINE_STAGES, PRIORITIES } from "@/lib/types";

function revalidateAppPaths(id?: string) {
  revalidatePath("/");
  revalidatePath("/applications");
  if (id) revalidatePath(`/applications/${id}`);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Look up the user's OpenAI API key
  const settings = await prisma.userSettings.findUnique({ where: { userId } });
  if (!settings?.openaiApiKey) {
    return Response.json(
      {
        error:
          "OpenAI API key not configured. Go to Settings to add your key.",
      },
      { status: 400 }
    );
  }

  const openai = createOpenAI({ apiKey: settings.openaiApiKey });
  const { messages, id: threadId } = await request.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are Igor, a friendly and helpful job hunt assistant. You have access to the user's job application tracker where they save and manage their job applications through a pipeline (${PIPELINE_STAGES.join(", ")}). Priority levels are: ${PRIORITIES.join(", ")}.

You can:
- Search the web to find new job postings for the user
- Save jobs you find by creating new applications on their board
- Update existing applications (change stage, priority, dates, etc.)
- Delete applications
- Add and delete notes on applications
- Look up their existing application data

When searching for jobs:
- Search on job boards like LinkedIn, Indeed, Greenhouse, and Lever
- Look for specific job titles and include the location if the user mentions one
- Extract the company name, job title, location, and application URL from results
- Prioritize recent postings from reputable companies
- Show around 5-6 results at a time. If there are more, ask if the user wants to see additional results.

Formatting rules (follow these strictly):
- Be conversational and concise. No walls of text.
- NEVER use markdown tables. Use simple bullet lists instead.
- Use bold sparingly — only for company names in job listings.
- Each job listing should be one bullet line: **Company** — Role, location, salary → [link](url)
- Don't repeat information. Never show a summary table after already listing the same jobs.
- Don't add filler like "Let me know if you'd like to explore any of these further!" unless the user asks.
- Keep responses short. A brief intro sentence, the list, and one short follow-up question is enough.`,
    messages: await convertToModelMessages(messages),
    tools: {
      // Web search
      web_search: openai.tools.webSearch({
        searchContextSize: "medium",
        filters: {
          allowedDomains: [
            "linkedin.com",
            "indeed.com",
            "greenhouse.io",
            "lever.co",
            "workable.com",
            "wellfound.com",
            "glassdoor.com",
          ],
        },
      }),

      // Read tools
      getApplications: tool({
        description:
          "Get all job applications, optionally filtered by stage or priority",
        inputSchema: z.object({
          stage: z
            .string()
            .optional()
            .describe("Filter by pipeline stage, e.g. 'Applied', 'Offer'"),
          priority: z
            .string()
            .optional()
            .describe("Filter by priority: 'Low', 'Med', or 'High'"),
        }),
        execute: async ({ stage, priority }) => {
          const where: Record<string, unknown> = { userId };
          if (stage) where.stage = stage;
          if (priority) where.priority = priority;

          const applications = await prisma.application.findMany({
            where,
            select: {
              id: true,
              company: true,
              roleTitle: true,
              stage: true,
              priority: true,
              location: true,
              appliedDate: true,
              nextFollowUpDate: true,
            },
            orderBy: { createdAt: "desc" },
          });

          return { applications, count: applications.length };
        },
      }),

      getApplication: tool({
        description:
          "Get full details of a specific job application including notes",
        inputSchema: z.object({
          id: z.string().describe("The application ID"),
        }),
        execute: async ({ id }) => {
          const application = await prisma.application.findUnique({
            where: { id, userId },
            include: { notes: { orderBy: { createdAt: "desc" } } },
          });

          if (!application) return { error: "Application not found" };
          return { application };
        },
      }),

      searchApplications: tool({
        description: "Search applications by company name or role title",
        inputSchema: z.object({
          query: z.string().describe("Search query for company or role"),
        }),
        execute: async ({ query }) => {
          const applications = await prisma.application.findMany({
            where: {
              userId,
              OR: [
                { company: { contains: query, mode: "insensitive" } },
                { roleTitle: { contains: query, mode: "insensitive" } },
              ],
            },
            include: { notes: { orderBy: { createdAt: "desc" } } },
            orderBy: { createdAt: "desc" },
          });

          return { applications, count: applications.length };
        },
      }),

      // Application write tools
      createApplication: tool({
        description:
          "Create a new job application on the board. Use this when saving a job the user found or wants to track.",
        inputSchema: z.object({
          company: z.string().describe("Company name"),
          roleTitle: z.string().describe("Job title / role name"),
          location: z.string().optional().describe("Job location"),
          jobUrl: z.string().optional().describe("URL to the job posting"),
          stage: z
            .string()
            .optional()
            .describe("Pipeline stage (defaults to 'Interested')"),
          priority: z
            .string()
            .optional()
            .describe("Priority: 'Low', 'Med', or 'High' (defaults to 'Med')"),
        }),
        execute: async ({ company, roleTitle, location, jobUrl, stage, priority }) => {
          const application = await prisma.application.create({
            data: {
              userId,
              company,
              roleTitle,
              location: location || null,
              jobUrl: jobUrl || null,
              stage: stage || "Interested",
              priority: priority || "Med",
            },
          });
          revalidateAppPaths();
          return { application, message: "Application created successfully" };
        },
      }),

      updateApplication: tool({
        description:
          "Update an existing job application. Can change any field including stage, priority, dates, etc.",
        inputSchema: z.object({
          id: z.string().describe("The application ID to update"),
          company: z.string().optional().describe("New company name"),
          roleTitle: z.string().optional().describe("New role title"),
          location: z.string().optional().describe("New location"),
          jobUrl: z.string().optional().describe("New job URL"),
          stage: z
            .string()
            .optional()
            .describe(`New pipeline stage: ${PIPELINE_STAGES.join(", ")}`),
          priority: z
            .string()
            .optional()
            .describe("New priority: 'Low', 'Med', or 'High'"),
          appliedDate: z
            .string()
            .optional()
            .describe("Date applied (ISO format, e.g. '2025-01-15')"),
          nextFollowUpDate: z
            .string()
            .optional()
            .describe("Next follow-up date (ISO format)"),
        }),
        execute: async ({ id, appliedDate, nextFollowUpDate, ...rest }) => {
          const data: Record<string, unknown> = { ...rest };
          if (appliedDate) data.appliedDate = new Date(appliedDate);
          if (nextFollowUpDate)
            data.nextFollowUpDate = new Date(nextFollowUpDate);

          const application = await prisma.application.update({
            where: { id, userId },
            data,
          });
          revalidateAppPaths(id);
          return { application, message: "Application updated successfully" };
        },
      }),

      deleteApplication: tool({
        description: "Delete a job application from the board",
        inputSchema: z.object({
          id: z.string().describe("The application ID to delete"),
        }),
        execute: async ({ id }) => {
          await prisma.application.delete({ where: { id, userId } });
          revalidateAppPaths();
          return { message: "Application deleted successfully" };
        },
      }),

      // Note tools
      addNote: tool({
        description: "Add a note to a job application",
        inputSchema: z.object({
          applicationId: z
            .string()
            .describe("The application ID to add a note to"),
          body: z.string().describe("The note text"),
        }),
        execute: async ({ applicationId, body }) => {
          // Verify application belongs to user
          const app = await prisma.application.findUnique({
            where: { id: applicationId, userId },
          });
          if (!app) return { error: "Application not found" };

          const note = await prisma.note.create({
            data: { body, applicationId },
          });
          revalidatePath(`/applications/${applicationId}`);
          return { note, message: "Note added successfully" };
        },
      }),

      deleteNote: tool({
        description: "Delete a note from a job application",
        inputSchema: z.object({
          noteId: z.string().describe("The note ID to delete"),
          applicationId: z
            .string()
            .describe("The application ID the note belongs to"),
        }),
        execute: async ({ noteId, applicationId }) => {
          // Verify application belongs to user before deleting note
          const app = await prisma.application.findUnique({
            where: { id: applicationId, userId },
          });
          if (!app) return { error: "Application not found" };

          await prisma.note.delete({ where: { id: noteId } });
          revalidatePath(`/applications/${applicationId}`);
          return { message: "Note deleted successfully" };
        },
      }),
    },
    stopWhen: stepCountIs(10),
    onFinish: async ({ text }) => {
      if (!threadId) return;
      const thread = await prisma.thread.findUnique({
        where: { id: threadId, userId },
      });
      if (!thread) return;

      const userMsg = messages[messages.length - 1];
      if (userMsg?.role === "user") {
        await prisma.message.create({
          data: { threadId, role: "user", content: JSON.stringify(userMsg) },
        });
      }

      await prisma.message.create({
        data: {
          threadId,
          role: "assistant",
          content: JSON.stringify({
            id: crypto.randomUUID(),
            role: "assistant",
            parts: [{ type: "text", text }],
          }),
        },
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
