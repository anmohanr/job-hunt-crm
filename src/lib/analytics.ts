import { PIPELINE_STAGES, PRIORITIES } from "@/lib/types";

type Application = {
  id: string;
  stage: string;
  priority: string;
  nextFollowUpDate: Date | null;
  createdAt: Date;
};

export function computeDashboardStats(applications: Application[]) {
  const now = new Date();

  const total = applications.length;

  const active = applications.filter(
    (a) => a.stage !== "Rejected" && a.stage !== "Withdrawn"
  ).length;

  // Response rate: % of apps that reached Recruiter Screen or beyond
  const advancedStages = ["Recruiter Screen", "Tech Screen", "Onsite", "Offer"];
  const appliedOrBeyond = applications.filter(
    (a) => a.stage !== "Interested"
  ).length;
  const responded = applications.filter((a) =>
    advancedStages.includes(a.stage)
  ).length;
  const responseRate =
    appliedOrBeyond > 0 ? Math.round((responded / appliedOrBeyond) * 100) : 0;

  const overdueCount = applications.filter(
    (a) => a.nextFollowUpDate && new Date(a.nextFollowUpDate) < now
  ).length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCount = applications.filter(
    (a) => new Date(a.createdAt) >= sevenDaysAgo
  ).length;

  const activeApps = applications.filter(
    (a) => a.stage !== "Rejected" && a.stage !== "Withdrawn"
  );
  const avgDaysInPipeline =
    activeApps.length > 0
      ? Math.round(
          activeApps.reduce((sum, a) => {
            const days = Math.floor(
              (now.getTime() - new Date(a.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0) / activeApps.length
        )
      : 0;

  const byStage = PIPELINE_STAGES.map((stage) => ({
    stage,
    count: applications.filter((a) => a.stage === stage).length,
  }));

  const byPriority = PRIORITIES.map((priority) => ({
    priority,
    count: applications.filter((a) => a.priority === priority).length,
  }));

  // Weekly activity for the last 8 weeks
  const weeklyActivity: { week: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = applications.filter((a) => {
      const d = new Date(a.createdAt);
      return d >= weekStart && d < weekEnd;
    }).length;

    weeklyActivity.push({
      week: weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count,
    });
  }

  return {
    total,
    active,
    responseRate,
    overdueCount,
    recentCount,
    avgDaysInPipeline,
    byStage,
    byPriority,
    weeklyActivity,
  };
}
