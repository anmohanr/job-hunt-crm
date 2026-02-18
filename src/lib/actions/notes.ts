"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createNote(applicationId: string, body: string) {
  const note = await prisma.note.create({
    data: {
      body,
      applicationId,
    },
  });
  revalidatePath(`/applications/${applicationId}`);
  return note;
}

export async function deleteNote(noteId: string, applicationId: string) {
  await prisma.note.delete({
    where: { id: noteId },
  });
  revalidatePath(`/applications/${applicationId}`);
}
