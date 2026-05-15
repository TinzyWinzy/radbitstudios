import { describe, it, expect } from "vitest";
import { subscriptionPlans, type SubscriptionPlan } from "@/lib/subscriptions";

describe("subscriptionPlans", () => {
  it("has three plans: Free, Growth, Pro", () => {
    const names = subscriptionPlans.map((p) => p.name);
    expect(names).toEqual(["Free", "Growth", "Pro"]);
  });

  it("has correct prices", () => {
    const prices: Record<string, number> = {};
    subscriptionPlans.forEach((p) => {
      prices[p.name] = p.price;
    });
    expect(prices["Free"]).toBe(0);
    expect(prices["Growth"]).toBe(15);
    expect(prices["Pro"]).toBe(40);
  });

  it("Free plan has the fewest credits", () => {
    const freePlan = subscriptionPlans.find((p) => p.name === "Free")!;
    const growthPlan = subscriptionPlans.find((p) => p.name === "Growth")!;
    for (const key of Object.keys(freePlan.credits) as (keyof typeof freePlan.credits)[]) {
      expect(freePlan.credits[key].total).toBeLessThanOrEqual(growthPlan.credits[key].total);
    }
  });

  it("Pro plan has the most credits", () => {
    const proPlan = subscriptionPlans.find((p) => p.name === "Pro")!;
    const growthPlan = subscriptionPlans.find((p) => p.name === "Growth")!;
    for (const key of Object.keys(growthPlan.credits) as (keyof typeof growthPlan.credits)[]) {
      expect(proPlan.credits[key].total).toBeGreaterThanOrEqual(growthPlan.credits[key].total);
    }
  });

  it("every plan has all required feature credit fields", () => {
    const requiredKeys: (keyof SubscriptionPlan["credits"])[] = [
      "logoGeneration",
      "assessmentSummary",
      "dashboardInsights",
      "tendersCuration",
      "mentorChat",
      "templateGeneration",
    ];
    for (const plan of subscriptionPlans) {
      for (const key of requiredKeys) {
        expect(plan.credits[key]).toBeDefined();
        expect(plan.credits[key].remaining).toBeGreaterThanOrEqual(0);
        expect(plan.credits[key].total).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
