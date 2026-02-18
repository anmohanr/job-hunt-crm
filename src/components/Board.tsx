import Link from "next/link";
import { Application } from "@prisma/client";
import { PIPELINE_STAGES } from "@/lib/types";
import { STAGE_TEXT_COLORS } from "@/lib/stageColors";
import { ApplicationCard } from "./ApplicationCard";

interface BoardProps {
  applications: Application[];
}

export function Board({ applications }: BoardProps) {
  if (applications.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No applications yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start by adding your first job application, or ask Igor to find jobs
            for you.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/applications/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Application
            </Link>
            <Link
              href="/chat"
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Ask Igor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const overdueApps = applications.filter(
    (app) =>
      app.nextFollowUpDate && new Date(app.nextFollowUpDate) < new Date()
  );

  return (
    <div className="space-y-6">
      {overdueApps.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-800 dark:text-red-300 font-semibold mb-2">
            Overdue Follow-ups ({overdueApps.length})
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {overdueApps.map((app) => (
              <div key={app.id} className="min-w-[280px]">
                <ApplicationCard application={app} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Row 1: First 4 stages */}
        <div className="grid grid-cols-4 gap-4">
          {PIPELINE_STAGES.slice(0, 4).map((stage) => {
            const stageApps = applications.filter((app) => app.stage === stage);
            return (
              <div
                key={stage}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
              >
                <h2 className={`font-semibold mb-4 flex items-center gap-2 ${STAGE_TEXT_COLORS[stage] ?? "text-gray-700 dark:text-gray-300"}`}>
                  {stage}
                  <span className="text-sm font-normal bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                    {stageApps.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {stageApps.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                  {stageApps.length === 0 && (
                    <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">
                      No applications
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 2: Last 4 stages */}
        <div className="grid grid-cols-4 gap-4">
          {PIPELINE_STAGES.slice(4).map((stage) => {
            const stageApps = applications.filter((app) => app.stage === stage);
            return (
              <div
                key={stage}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
              >
                <h2 className={`font-semibold mb-4 flex items-center gap-2 ${STAGE_TEXT_COLORS[stage] ?? "text-gray-700 dark:text-gray-300"}`}>
                  {stage}
                  <span className="text-sm font-normal bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                    {stageApps.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {stageApps.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                  {stageApps.length === 0 && (
                    <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">
                      No applications
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
