import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "blue" | "green" | "red" | "yellow" | "gray";
  icon?: LucideIcon;
  variant?: "default" | "breakdown";
}

const colorMap = {
  blue: "border-blue-500",
  green: "border-green-500",
  red: "border-red-500",
  yellow: "border-yellow-500",
  gray: "border-gray-300 dark:border-gray-600",
};

export function StatCard({
  title,
  value,
  subtitle,
  color = "blue",
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-t-4 ${colorMap[color]}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        {Icon && <Icon size={20} className="text-gray-400 dark:text-gray-500 shrink-0" />}
      </div>
      {variant === "breakdown" ? (
        <div className="mt-2 space-y-1">
          {String(value).split(", ").map((part) => (
            <p key={part} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {part}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
      )}
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
