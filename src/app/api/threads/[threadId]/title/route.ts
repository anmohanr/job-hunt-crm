import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { threadId } = await params;
  const { messages } = await request.json();

  // Verify thread ownership
  const thread = await prisma.thread.findUnique({
    where: { id: threadId, userId: session.user.id },
  });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Look up user's API key
  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });
  if (!settings?.openaiApiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 400 });
  }

  const openai = createOpenAI({ apiKey: settings.openaiApiKey });

  const { text: title } = await generateText({
    model: openai("gpt-4o-mini"),
    system:
      "Generate a short, descriptive title (3-6 words) for this conversation. Return ONLY the title, no quotes or punctuation at the end.",
    prompt: messages
      .map((m: { role: string; text: string }) => `${m.role}: ${m.text}`)
      .join("\n"),
  });

  await prisma.thread.update({
    where: { id: threadId },
    data: { title: title.trim() },
  });

  return NextResponse.json({ title: title.trim() });
}
