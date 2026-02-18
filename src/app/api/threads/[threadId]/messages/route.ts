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
  const { role, content } = await request.json();

  // Verify thread ownership
  const thread = await prisma.thread.findUnique({
    where: { id: threadId, userId: session.user.id },
  });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const message = await prisma.message.create({
    data: {
      threadId,
      role,
      content: typeof content === "string" ? content : JSON.stringify(content),
    },
  });

  await prisma.thread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ message });
}
