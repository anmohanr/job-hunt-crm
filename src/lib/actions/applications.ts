"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getApplications() {
  const userId = await getUserId();
  return prisma.application.findMany({
    where: { userId },
    include: { notes: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getApplication(id: string) {
  const userId = await getUserId();
  return prisma.application.findUnique({
    where: { id, userId },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  });
}

export async function createApplication(data: {
  company: string;
  roleTitle: string;
  location?: string;
  jobUrl?: string;
  stage?: string;
  priority?: string;
  appliedDate?: Date;
  nextFollowUpDate?: Date;
}) {
  const userId = await getUserId();
  const application = await prisma.application.create({
    data: {
      userId,
      company: data.company,
      roleTitle: data.roleTitle,
      location: data.location || null,
      jobUrl: data.jobUrl || null,
      stage: data.stage || "Interested",
      priority: data.priority || "Med",
      appliedDate: data.appliedDate || null,
      nextFollowUpDate: data.nextFollowUpDate || null,
    },
  });
  revalidatePath("/");
  revalidatePath("/applications");
  return application;
}

export async function updateApplication(
  id: string,
  data: {
    company?: string;
    roleTitle?: string;
    location?: string | null;
    jobUrl?: string | null;
    stage?: string;
    priority?: string;
    appliedDate?: Date | null;
    nextFollowUpDate?: Date | null;
  }
) {
  const userId = await getUserId();
  const application = await prisma.application.update({
    where: { id, userId },
    data,
  });
  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  return application;
}

export async function deleteApplication(id: string) {
  const userId = await getUserId();
  await prisma.application.delete({
    where: { id, userId },
  });
  revalidatePath("/");
  revalidatePath("/applications");
}

export async function updateApplicationStage(id: string, stage: string) {
  const userId = await getUserId();
  const application = await prisma.application.update({
    where: { id, userId },
    data: { stage },
  });
  revalidatePath("/");
  revalidatePath("/applications");
  return application;
}
