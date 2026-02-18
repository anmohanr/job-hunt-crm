"use client";

import { useState } from "react";
import { createNote, deleteNote } from "@/lib/actions/notes";

interface Note {
  id: string;
  body: string;
  createdAt: Date;
}

interface NotesSectionProps {
  applicationId: string;
  notes: Note[];
}

export function NotesSection({ applicationId, notes }: NotesSectionProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setIsSubmitting(true);
    try {
      await createNote(applicationId, body.trim());
      setBody("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(noteId: string) {
    await deleteNote(noteId, applicationId);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notes</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <button
          type="submit"
          disabled={isSubmitting || !body.trim()}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adding..." : "Add Note"}
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">
          No notes yet
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group border border-gray-200 dark:border-gray-700 rounded-md p-3"
            >
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {note.body}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
