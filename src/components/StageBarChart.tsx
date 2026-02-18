interface StageBarChartProps {
  data: { stage: string; count: number }[];
}

const stageColors: Record<string, string> = {
  Interested: "bg-blue-400",
  Applied: "bg-blue-500",
  "Recruiter Screen": "bg-indigo-500",
  "Tech Screen": "bg-purple-500",
  Onsite: "bg-violet-500",
  Offer: "bg-green-500",
  Rejected: "bg-red-400",
  Withdrawn: "bg-gray-400",
};

export function StageBarChart({ data }: StageBarChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Applications by Stage
      </h2>
      <div className="space-y-3">
        {data.map(({ stage, count }) => (
          <div key={stage} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 w-36 text-right shrink-0">
              {stage}
            </span>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
              {count > 0 && (
                <div
                  className={`h-full rounded-full ${stageColors[stage] || "bg-blue-500"} transition-all`}
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
