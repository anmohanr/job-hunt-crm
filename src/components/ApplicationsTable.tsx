"use client";

import { useState } from "react";
import Link from "next/link";
import { PIPELINE_STAGES, PRIORITIES } from "@/lib/types";

interface Application {
  id: string;
  company: string;
  roleTitle: string;
  stage: string;
  priority: string;
  nextFollowUpDate: Date | null;
}

interface ApplicationsTableProps {
  applications: Application[];
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [priority, setPriority] = useState("");

  const hasFilters = search || stage || priority;

  let filtered = applications;

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (app) =>
        app.company.toLowerCase().includes(q) ||
        app.roleTitle.toLowerCase().includes(q)
    );
  }

  if (stage) {
    filtered = filtered.filter((app) => app.stage === stage);
  }

  if (priority) {
    filtered = filtered.filter((app) => app.priority === priority);
  }

  const sorted = [...filtered].sort((a, b) => {
    if (!a.nextFollowUpDate && !b.nextFollowUpDate) return 0;
    if (!a.nextFollowUpDate) return 1;
    if (!b.nextFollowUpDate) return -1;
    return (
      new Date(a.nextFollowUpDate).getTime() -
      new Date(b.nextFollowUpDate).getTime()
    );
  });

  const priorityColors: Record<string, string> = {
    High: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    Med: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    Low: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  };

  function handleClear() {
    setSearch("");
    setStage("");
    setPriority("");
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or role..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Stages</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-2"
          >
            Clear
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          {hasFilters ? (
            <p className="text-gray-500 dark:text-gray-400">
              No applications match your filters.
            </p>
          ) : (
            <>
              <p className="text-gray-500 dark:text-gray-400">No applications yet.</p>
              <Link
                href="/applications/new"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add your first application
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Company
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Stage
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Priority
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Follow-up
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sorted.map((app) => {
                const isOverdue =
                  app.nextFollowUpDate &&
                  new Date(app.nextFollowUpDate) < new Date();
                return (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/applications/${app.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {app.company}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {app.roleTitle}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {app.stage}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          priorityColors[app.priority] || ""
                        }`}
                      >
                        {app.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {app.nextFollowUpDate ? (
                        <span
                          className={
                            isOverdue
                              ? "text-red-600 dark:text-red-400 font-medium"
                              : "text-gray-700 dark:text-gray-300"
                          }
                        >
                          {isOverdue && "OVERDUE: "}
                          {new Date(
                            app.nextFollowUpDate
                          ).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
