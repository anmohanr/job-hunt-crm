"use client";

import { useMemo } from "react";
import { useAuiState } from "@assistant-ui/react";
import { Bot, Plus } from "lucide-react";
import {
  AssistantRuntimeProvider,
  unstable_useRemoteThreadListRuntime as useRemoteThreadListRuntime,
} from "@assistant-ui/react";
import { Thread, ThreadList, makeMarkdownText } from "@assistant-ui/react-ui";

const MarkdownText = makeMarkdownText();
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { DbThreadListAdapter, getCachedMessages } from "@/lib/chatAdapter";
import { ToolCallDisplay } from "./ToolCallDisplay";
import "@assistant-ui/react-ui/styles/index.css";
import "@assistant-ui/react-ui/styles/markdown.css";

function useChatRuntimeHook() {
  const threadId = useAuiState(({ threadListItem }) => threadListItem.id);
  const messages = useMemo(() => getCachedMessages(threadId), [threadId]);
  return useChatRuntime({ messages });
}

export function Chat() {
  const adapter = useMemo(() => new DbThreadListAdapter(), []);

  const runtime = useRemoteThreadListRuntime({
    runtimeHook: useChatRuntimeHook,
    adapter,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="aui-root flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-blue-600" />
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                Igor
              </span>
            </div>
            <ThreadList.New className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
              <Plus size={14} />
              New Chat
            </ThreadList.New>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ThreadList.Items />
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1">
          <Thread
            assistantMessage={{
              components: {
                Text: MarkdownText,
                ToolFallback: ToolCallDisplay,
              },
            }}
          />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
