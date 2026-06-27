import { describe, it, expect } from "vitest";
import {
  getTierLevel,
  isTierAtLeast,
  getUpgradePath,
  type FeatureName,
} from "@/services/feature-gate";
import { normalizePlanName } from "@/lib/subscriptions";

describe("getTierLevel", () => {
  it("returns 0 for Free", () => {
    expect(getTierLevel("Free")).toBe(0);
  });

  it("returns 1 for Growth", () => {
    expect(getTierLevel("Growth")).toBe(1);
  });

  it("returns 2 for Tender Starter", () => {
    expect(getTierLevel("Tender Starter")).toBe(2);
  });

  it("returns 3 for Pro", () => {
    expect(getTierLevel("Pro")).toBe(3);
  });

  it("returns 4 for Enterprise", () => {
    expect(getTierLevel("Enterprise")).toBe(4);
  });
});

describe("isTierAtLeast", () => {
  it("normalizes legacy plan values before comparison", () => {
    expect(normalizePlanName("tender_starter")).toBe("Tender Starter");
    expect(getTierLevel("tender_starter" as any)).toBe(2);
    expect(isTierAtLeast("tender_starter" as any, "Growth")).toBe(true);
  });

  it("Free is at least Free", () => {
    expect(isTierAtLeast("Free", "Free")).toBe(true);
  });

  it("Free is NOT at least Growth", () => {
    expect(isTierAtLeast("Free", "Growth")).toBe(false);
  });

  it("Growth is at least Free", () => {
    expect(isTierAtLeast("Growth", "Free")).toBe(true);
  });

  it("Growth is at least Growth", () => {
    expect(isTierAtLeast("Growth", "Growth")).toBe(true);
  });

  it("Pro is at least Growth", () => {
    expect(isTierAtLeast("Pro", "Growth")).toBe(true);
  });

  it("Enterprise is at least Growth", () => {
    expect(isTierAtLeast("Enterprise", "Growth")).toBe(true);
  });

  it("Enterprise is at least Enterprise", () => {
    expect(isTierAtLeast("Enterprise", "Enterprise")).toBe(true);
  });
});

describe("getUpgradePath", () => {
  it("Free upgrades to Growth for $5/mo", () => {
    const path = getUpgradePath("Free", "dashboardInsights");
    expect(path.upgradeTo).toBe("Growth");
    expect(path.price).toBe(5);
    expect(path.feature).toContain("Dashboard");
  });

  it("Growth upgrades to Tender Starter for $10/mo", () => {
    const path = getUpgradePath("Growth", "taxCopilot");
    expect(path.upgradeTo).toBe("Tender Starter");
    expect(path.price).toBe(10);
    expect(path.feature).toContain("Tax");
  });

  it("Pro upgrades to Enterprise", () => {
    const path = getUpgradePath("Pro", "tendersRegional");
    expect(path.upgradeTo).toBe("Enterprise");
    expect(path.price).toBe(0);
  });

  it("Enterprise has no upgrade path", () => {
    const path = getUpgradePath("Enterprise", "directMessages");
    expect(path.upgradeTo).toBeNull();
    expect(path.price).toBe(0);
  });

  it("formats feature name from camelCase", () => {
    const path = getUpgradePath("Free", "communityPostAnalytics");
    expect(path.feature).toBe("Community Post Analytics");
  });

  it("formats single-word feature name", () => {
    const path = getUpgradePath("Free", "taxCopilot");
    expect(path.feature).toBe("Tax Copilot");
  });
});

describe("upgrade path pricing", () => {
  const freeFeatures: FeatureName[] = [
    "assessmentSummary",
    "templateGeneration",
    "mentorChat",
    "logoGeneration",
    "dashboardInsights",
    "tendersCuration",
    "taxCopilot",
    "tenderProposal",
  ];

  for (const feature of freeFeatures) {
    it(`Free user gets Growth upgrade path for ${feature}`, () => {
      const path = getUpgradePath("Free", feature);
      expect(path.upgradeTo).toBe("Growth");
      expect(path.price).toBe(5);
      expect(path.message).toBeTruthy();
    });
  }

  it("Free user gets Growth upgrade path for tier-gated features", () => {
    const tierFeatures: FeatureName[] = [
      "tendersRegional",
      "directMessages",
    ];
    for (const feature of tierFeatures) {
      const path = getUpgradePath("Free", feature);
      expect(path.upgradeTo).toBe("Growth");
      expect(path.price).toBe(5);
    }
  });

  it("Growth user gets Tender Starter upgrade path for all features", () => {
    const allFeatures: FeatureName[] = [
      "dashboardInsights",
      "taxCopilot",
      "tenderProposal",
      "tendersRegional",
      "directMessages",
      "communityPostAnalytics",
    ];
    for (const feature of allFeatures) {
      const path = getUpgradePath("Growth", feature);
      expect(path.upgradeTo).toBe("Tender Starter");
      expect(path.price).toBe(10);
    }
  });
});
