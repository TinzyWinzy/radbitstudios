import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { isActionOverdue, sortBusinessActions } from "@/services/business-action.service";
import type { BusinessAction, BusinessActionPriority, BusinessActionStatus } from "@/types/business-action";

function action(id: string, priority: BusinessActionPriority, status: BusinessActionStatus, due: string | null): BusinessAction {
  return {
    id,
    userId: "user-1",
    businessId: "user-1",
    title: id,
    description: "",
    priority,
    status,
    source: "manual",
    confidence: "high",
    ownerName: "Owner",
    dueAt: due ? Timestamp.fromDate(new Date(due)) : null,
    completedAt: null,
    outcome: "",
    evidence: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

describe("business action prioritisation", () => {
  it("places active critical work ahead of completed work", () => {
    const result = sortBusinessActions([
      action("done", "critical", "done", "2026-01-01"),
      action("medium", "medium", "planned", "2026-08-01"),
      action("critical", "critical", "in_progress", "2026-09-01"),
    ]);
    expect(result.map(item => item.id)).toEqual(["critical", "medium", "done"]);
  });

  it("uses the earliest deadline when priorities match", () => {
    const result = sortBusinessActions([
      action("later", "high", "planned", "2026-09-01"),
      action("sooner", "high", "planned", "2026-08-01"),
    ]);
    expect(result[0].id).toBe("sooner");
  });

  it("does not mark completed actions overdue", () => {
    const now = new Date("2026-07-20T12:00:00Z");
    expect(isActionOverdue(action("active", "high", "planned", "2026-07-19"), now)).toBe(true);
    expect(isActionOverdue(action("done", "high", "done", "2026-07-19"), now)).toBe(false);
  });
});
