import { describe, expect, it } from "vitest";
import { ARTICLE_CATEGORIES, CONTENT_CLUSTERS } from "@/data/content-clusters";
import { estimateReadingMinutes, resolveEditorialStatus } from "@/lib/editorial";

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
});
