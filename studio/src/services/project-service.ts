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
