import type { ThreadMessage } from "@assistant-ui/react";
import type { UIMessage } from "ai";
import type { AssistantStream } from "assistant-stream";
import { createAssistantStream } from "assistant-stream";

// Module-level cache: threadId (remoteId) → UIMessage[]
const messagesCache = new Map<string, UIMessage[]>();

export function getCachedMessages(threadId: string): UIMessage[] {
  return messagesCache.get(threadId) ?? [];
}

type DbMessage = { id: string; role: string; content: string };

function convertToUIMessages(dbMessages: DbMessage[]): UIMessage[] {
  return dbMessages.map((m) => {
    try {
      const parsed = JSON.parse(m.content);
      if (parsed && typeof parsed === "object" && "parts" in parsed) {
        return parsed as UIMessage;
      }
    } catch {}
    return {
      id: m.id,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: m.content }],
    };
  });
}

type RemoteThreadInitializeResponse = {
  remoteId: string;
  externalId: string | undefined;
};

type RemoteThreadMetadata = {
  readonly status: "regular" | "archived";
  readonly remoteId: string;
  readonly externalId?: string | undefined;
  readonly title?: string | undefined;
};

type RemoteThreadListResponse = {
  threads: RemoteThreadMetadata[];
};

export type RemoteThreadListAdapter = {
  list(): Promise<RemoteThreadListResponse>;
  rename(remoteId: string, newTitle: string): Promise<void>;
  archive(remoteId: string): Promise<void>;
  unarchive(remoteId: string): Promise<void>;
  delete(remoteId: string): Promise<void>;
  initialize(threadId: string): Promise<RemoteThreadInitializeResponse>;
  generateTitle(
    remoteId: string,
    unstable_messages: readonly ThreadMessage[]
  ): Promise<AssistantStream>;
  fetch(threadId: string): Promise<RemoteThreadMetadata>;
};

export class DbThreadListAdapter implements RemoteThreadListAdapter {
  async list(): Promise<RemoteThreadListResponse> {
    const res = await fetch("/api/threads");
    const data = await res.json();
    return {
      threads: data.threads.map(
        (t: { id: string; title: string | null; status: string }) => ({
          remoteId: t.id,
          title: t.title ?? undefined,
          status: t.status as "regular" | "archived",
        })
      ),
    };
  }

  async initialize(threadId: string): Promise<RemoteThreadInitializeResponse> {
    const res = await fetch("/api/threads", { method: "POST" });
    const data = await res.json();
    return { remoteId: data.remoteId, externalId: undefined };
  }

  async fetch(threadId: string): Promise<RemoteThreadMetadata> {
    const res = await fetch(`/api/threads/${threadId}`);
    if (!res.ok) throw new Error("Thread not found");
    const data = await res.json();

    if (data.thread.messages?.length) {
      messagesCache.set(data.thread.id, convertToUIMessages(data.thread.messages));
    }

    return {
      remoteId: data.thread.id,
      title: data.thread.title ?? undefined,
      status: data.thread.status as "regular" | "archived",
    };
  }

  async rename(remoteId: string, newTitle: string): Promise<void> {
    await fetch(`/api/threads/${remoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
  }

  async archive(remoteId: string): Promise<void> {
    await fetch(`/api/threads/${remoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
  }

  async unarchive(remoteId: string): Promise<void> {
    await fetch(`/api/threads/${remoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "regular" }),
    });
  }

  async delete(remoteId: string): Promise<void> {
    await fetch(`/api/threads/${remoteId}`, { method: "DELETE" });
  }

  async generateTitle(
    remoteId: string,
    messages: readonly ThreadMessage[]
  ): Promise<AssistantStream> {
    const simplified = messages.map((m) => {
      const textPart = m.content.find((p) => p.type === "text");
      return {
        role: m.role,
        text: textPart && "text" in textPart ? textPart.text : "",
      };
    });

    const res = await fetch(`/api/threads/${remoteId}/title`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: simplified }),
    });
    const data = await res.json();
    const title = data.title || "New chat";

    return createAssistantStream((controller) => {
      controller.appendText(title);
      controller.close();
    });
  }
}
