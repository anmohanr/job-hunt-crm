interface TimelineChartProps {
  data: { week: string; count: number }[];
}

export function TimelineChart({ data }: TimelineChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Applications Over Time
      </h2>
      {data.every((d) => d.count === 0) ? (
        <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">
          No activity yet
        </p>
      ) : (
        <div className="flex items-end justify-between gap-2 h-48">
          {data.map(({ week, count }) => (
            <div
              key={week}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">{count || ""}</span>
              <div
                className="w-full bg-blue-500 rounded-t transition-all min-w-[8px]"
                style={{
                  height: count > 0 ? `${(count / maxCount) * 80}%` : "2px",
                  backgroundColor: count > 0 ? undefined : "#374151",
                }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate w-full text-center">
                {week}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
