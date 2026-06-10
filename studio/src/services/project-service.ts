import type { ProjectStatus } from "@/types/project";

export const PROJECT_STATUS_FLOW: ProjectStatus[] = [
  "lead",
  "onboarding",
  "design",
  "development",
  "review",
  "live",
  "completed",
];

export const STATUS_COLUMNS: Record<string, { label: string; color: string }> = {
  lead: { label: "Lead", color: "border-t-amber-500" },
  onboarding: { label: "Onboarding", color: "border-t-blue-500" },
  design: { label: "Design", color: "border-t-violet-500" },
  development: { label: "Development", color: "border-t-orange-500" },
  review: { label: "Review", color: "border-t-cyan-500" },
  live: { label: "Live", color: "border-t-green-500" },
  completed: { label: "Completed", color: "border-t-emerald-500" },
};

export function canTransitionTo(
  current: ProjectStatus,
  next: ProjectStatus,
): boolean {
  const idx = PROJECT_STATUS_FLOW.indexOf(current);
  const nextIdx = PROJECT_STATUS_FLOW.indexOf(next);
  if (next === "cancelled") return true;
  return nextIdx > idx;
}

export function getStatusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    lead: "Lead",
    onboarding: "Onboarding",
    design: "Design",
    development: "Development",
    review: "Review",
    live: "Live",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status];
}
