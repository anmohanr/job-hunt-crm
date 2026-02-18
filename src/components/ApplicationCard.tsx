"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Application } from "@prisma/client";
import { PIPELINE_STAGES } from "@/lib/types";
import { STAGE_BORDER_COLORS } from "@/lib/stageColors";
import { updateApplicationStage } from "@/lib/actions/applications";

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const isOverdue =
    application.nextFollowUpDate &&
    new Date(application.nextFollowUpDate) < new Date();

  const priorityColors = {
    High: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    Med: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    Low: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  };

  const currentStageIndex = PIPELINE_STAGES.indexOf(
    application.stage as (typeof PIPELINE_STAGES)[number]
  );

  const borderColor = isOverdue
    ? "border-red-500"
    : (STAGE_BORDER_COLORS[application.stage] ?? "border-gray-300");

  const handleStageChange = async (newStage: string) => {
    await updateApplicationStage(application.id, newStage);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-700 rounded-lg shadow p-4 border-l-4 hover:shadow-md transition-shadow ${borderColor}`}
    >
      <Link href={`/applications/${application.id}`} className="block">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {application.company}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{application.roleTitle}</p>
      </Link>

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            priorityColors[application.priority as keyof typeof priorityColors]
          }`}
        >
          {application.priority}
        </span>
        {application.location && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{application.location}</span>
        )}
      </div>

      {application.nextFollowUpDate && (
        <p
          className={`text-xs mt-2 ${
            isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {isOverdue ? "Overdue: " : "Follow up: "}
          {new Date(application.nextFollowUpDate).toLocaleDateString()}
        </p>
      )}

      <div className="mt-3 flex gap-1">
        <button
          onClick={() =>
            currentStageIndex > 0 &&
            handleStageChange(PIPELINE_STAGES[currentStageIndex - 1])
          }
          disabled={currentStageIndex <= 0}
          className="flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>
        <select
          value={application.stage}
          onChange={(e) => handleStageChange(e.target.value)}
          className="text-xs flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
        >
          {PIPELINE_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
        <button
          onClick={() =>
            currentStageIndex < PIPELINE_STAGES.length - 1 &&
            handleStageChange(PIPELINE_STAGES[currentStageIndex + 1])
          }
          disabled={currentStageIndex >= PIPELINE_STAGES.length - 1}
          className="flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
