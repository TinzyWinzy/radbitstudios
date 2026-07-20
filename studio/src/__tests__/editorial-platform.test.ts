import { describe, expect, it } from "vitest";
import { ARTICLE_CATEGORIES, CONTENT_CLUSTERS } from "@/data/content-clusters";
import { canAdvanceEditorialStatus, estimateReadingMinutes, isStalePost, resolveEditorialStatus, validateEditorialPost } from "@/lib/editorial";
import { SERVICE_PAGES, INDUSTRY_PAGES } from "@/data/commercial-content";
import { DIAGNOSTIC_TOOLS } from "@/data/diagnostic-tools";
import { Timestamp } from "firebase/firestore";
import { FOUNDER_EXPERIENCE, PROJECT_EVIDENCE } from "@/data/evidence-ledger";

describe("editorial content architecture", () => {
  it("defines four unique pillar clusters with substantial topic maps", () => {
    expect(CONTENT_CLUSTERS).toHaveLength(4);
    expect(new Set(CONTENT_CLUSTERS.map(item => item.slug)).size).toBe(4);
    expect(CONTENT_CLUSTERS.every(item => item.topics.length >= 6)).toBe(true);
  });

  it("keeps the required publication categories", () => {
    expect(ARTICLE_CATEGORIES).toContain("Business Systems");
    expect(ARTICLE_CATEGORIES).toContain("AI for Business");
    expect(ARTICLE_CATEGORIES).toContain("Case Studies");
  });
});

describe("commercial architecture", () => {
  it("covers every requested service, industry, and diagnostic", () => {
    expect(SERVICE_PAGES).toHaveLength(7);
    expect(INDUSTRY_PAGES).toHaveLength(8);
    expect(DIAGNOSTIC_TOOLS).toHaveLength(6);
    expect(new Set([...SERVICE_PAGES, ...INDUSTRY_PAGES].map(page => page.slug)).size).toBe(15);
  });

  it("keeps proof boundaries and FAQs on every commercial page", () => {
    expect([...SERVICE_PAGES, ...INDUSTRY_PAGES].every(page => page.exclusions.length >= 3 && page.faq.length >= 3)).toBe(true);
  });
});

describe("evidence ledger", () => {
  it("uses explicit proof states and avoids unsupported security validation", () => {
    expect(FOUNDER_EXPERIENCE.length).toBeGreaterThanOrEqual(5);
    const security = PROJECT_EVIDENCE.find(project => project.name === "Sentinel Zero");
    expect(security?.state).toBe("Researched");
    expect(security?.evidence).toMatch(/No claim of third-party acceptance/i);
  });

  it("keeps public project evidence addressable", () => {
    expect(PROJECT_EVIDENCE.filter(project => project.state === "Deployed").every(project => project.href.startsWith("https://"))).toBe(true);
  });
});

describe("editorial workflow compatibility", () => {
  it("maps legacy publication booleans into the new workflow", () => {
    expect(resolveEditorialStatus({ published: true })).toBe("published");
    expect(resolveEditorialStatus({ published: false })).toBe("draft");
    expect(resolveEditorialStatus({ published: false, status: "review" })).toBe("review");
  });

  it("estimates a minimum one-minute reading time", () => {
    expect(estimateReadingMinutes(null)).toBe(1);
    expect(estimateReadingMinutes("word ".repeat(440))).toBe(2);
  });

  it("blocks publication until mandatory human and link checks pass", () => {
    const checks = validateEditorialPost({ metaTitle: "Short", metaDescription: "Too short", published: false });
    expect(canAdvanceEditorialStatus("published", checks)).toBe(false);
    expect(canAdvanceEditorialStatus("review", checks)).toBe(true);
  });

  it("flags published content after 180 days", () => {
    const updatedAt = Timestamp.fromMillis(Date.now() - 181 * 24 * 60 * 60 * 1000);
    expect(isStalePost({ published: true, status: "published", updatedAt })).toBe(true);
    expect(isStalePost({ published: false, status: "draft", updatedAt })).toBe(false);
  });
});
