"use client";

import { useState } from "react";
import { Key, CheckCircle2, Eye, EyeOff } from "lucide-react";

interface ApiKeyFormProps {
  hasKey: boolean;
  maskedKey: string | null;
}

export function ApiKeyForm({ hasKey, maskedKey }: ApiKeyFormProps) {
  const [value, setValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setStatus("saving");
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openaiApiKey: value.trim() }),
    });
    if (res.ok) {
      setStatus("saved");
      setValue("");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Key size={18} className="text-blue-600" />
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          OpenAI API Key
        </h2>
      </div>

      {hasKey && maskedKey && (
        <div className="mb-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 size={15} />
          <span>Key saved: {maskedKey}</span>
        </div>
      )}

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {hasKey
          ? "Enter a new key below to replace the existing one."
          : "Paste your OpenAI API key to enable Igor chat. Your key is stored securely in your account."}
      </p>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="sk-proj-..."
            className="w-full pr-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!value.trim() || status === "saving"}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
          >
            {status === "saving" ? "Saving…" : "Save key"}
          </button>
          {status === "saved" && (
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle2 size={14} /> Saved!
            </span>
          )}
          {status === "error" && (
            <span className="text-sm text-red-600 dark:text-red-400">
              Failed to save. Please try again.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
