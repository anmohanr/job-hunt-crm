import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  return Response.json({
    hasKey: !!settings?.openaiApiKey,
    masked: settings?.openaiApiKey
      ? `sk-...${settings.openaiApiKey.slice(-4)}`
      : null,
  });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { openaiApiKey } = await req.json();

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: { openaiApiKey },
    create: { userId: session.user.id, openaiApiKey },
  });

  return Response.json({ ok: true });
}
