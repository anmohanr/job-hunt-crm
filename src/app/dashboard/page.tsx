import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { StageBarChart } from "@/components/StageBarChart";
import { TimelineChart } from "@/components/TimelineChart";
import { getApplications } from "@/lib/actions/applications";
import { computeDashboardStats } from "@/lib/analytics";
import { FileText, CheckCircle2, TrendingUp, AlertCircle, BarChart2, Clock } from "lucide-react";

export default async function DashboardPage() {
  const applications = await getApplications();
  const stats = computeDashboardStats(applications);

  const priorityLabel = stats.byPriority
    .map((p) => `${p.count} ${p.priority}`)
    .join(", ");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h1>

        {/* Key stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Applications" value={stats.total} color="blue" icon={FileText} />
          <StatCard
            title="Active"
            value={stats.active}
            subtitle="Excluding rejected & withdrawn"
            color="green"
            icon={CheckCircle2}
          />
          <StatCard
            title="Response Rate"
            value={`${stats.responseRate}%`}
            subtitle="Advanced past Applied"
            color="blue"
            icon={TrendingUp}
          />
          <StatCard
            title="Overdue Follow-ups"
            value={stats.overdueCount}
            color={stats.overdueCount > 0 ? "red" : "gray"}
            icon={AlertCircle}
          />
        </div>

        {/* Stage breakdown */}
        <div className="mb-6">
          <StageBarChart data={stats.byStage} />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Priority Breakdown"
            value={priorityLabel}
            color="yellow"
            icon={BarChart2}
            variant="breakdown"
          />
          <StatCard
            title="Added This Week"
            value={stats.recentCount}
            color="blue"
            icon={FileText}
          />
          <StatCard
            title="Avg. Days in Pipeline"
            value={stats.avgDaysInPipeline}
            subtitle="For active applications"
            color="gray"
            icon={Clock}
          />
        </div>

        {/* Weekly timeline */}
        <TimelineChart data={stats.weeklyActivity} />
      </main>
    </div>
  );
}
