"use client";

import { useState } from "react";

const toolMeta: Record<string, { label: string; icon: string; verb: string }> = {
  web_search:         { label: "Web Search",         icon: "🔍", verb: "Searching the web" },
  getApplications:    { label: "View Applications",  icon: "📋", verb: "Looking up applications" },
  getApplication:     { label: "View Application",   icon: "📄", verb: "Fetching application details" },
  searchApplications: { label: "Search",             icon: "🔎", verb: "Searching applications" },
  createApplication:  { label: "Save to Board",      icon: "💾", verb: "Saving application" },
  updateApplication:  { label: "Update Application", icon: "✏️", verb: "Updating application" },
  deleteApplication:  { label: "Delete Application", icon: "🗑️", verb: "Deleting application" },
  addNote:            { label: "Add Note",            icon: "📝", verb: "Adding note" },
  deleteNote:         { label: "Delete Note",         icon: "🗑️", verb: "Deleting note" },
};

function getSummary(toolName: string, args: any, result: any): string {
  if (!result) return "";

  switch (toolName) {
    case "createApplication":
      return `Saved ${args?.company ?? ""} — ${args?.roleTitle ?? ""}`;
    case "getApplications":
      return `Found ${result?.count ?? 0} applications`;
    case "searchApplications":
      return `Found ${result?.count ?? 0} results for "${args?.query ?? ""}"`;
    case "getApplication":
      return `Loaded ${result?.application?.company ?? "application"} details`;
    case "updateApplication":
      return `Updated application`;
    case "deleteApplication":
      return "Removed application";
    case "addNote":
      return "Added note";
    case "deleteNote":
      return "Removed note";
    case "web_search":
      return "Searched the web";
    default:
      return "Done";
  }
}

interface ToolCallDisplayProps {
  toolName: string;
  args: any;
  result?: any;
  isError?: boolean;
  status: { type: string };
}

export function ToolCallDisplay({
  toolName,
  args,
  result,
  isError,
  status,
}: ToolCallDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = toolMeta[toolName] ?? {
    label: toolName,
    icon: "🔧",
    verb: `Running ${toolName}`,
  };

  const isRunning = status.type === "running";
  const isComplete = status.type === "complete" && !isError;
  const hasError = isError || status.type === "incomplete";

  // Running state — compact pill
  if (isRunning) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm my-1">
        <svg
          className="animate-spin h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span>
          {meta.icon} {meta.verb}...
        </span>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm my-1">
        <span>❌ {meta.label} failed</span>
      </div>
    );
  }

  // Complete state — expandable card
  const summary = getSummary(toolName, args, result);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 my-2 text-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
      >
        <span>{meta.icon}</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {meta.label}
        </span>
        <span className="text-green-600 dark:text-green-400">✓</span>
        {summary && (
          <span className="text-gray-500 dark:text-gray-400 truncate">
            — {summary}
          </span>
        )}
        <svg
          className={`ml-auto h-4 w-4 text-gray-400 shrink-0 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700 pt-2 space-y-2">
          {args && Object.keys(args).length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Input
              </p>
              <pre className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 rounded p-2 overflow-x-auto">
                {JSON.stringify(args, null, 2)}
              </pre>
            </div>
          )}
          {result && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Output
              </p>
              <pre className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 rounded p-2 overflow-x-auto max-h-48 overflow-y-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
