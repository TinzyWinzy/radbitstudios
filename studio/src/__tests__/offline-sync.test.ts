import { describe, expect, it } from "vitest";
import { getMutationRetryDelay } from "@/services/offline";

describe("offline mutation retry policy", () => {
  it("backs off exponentially", () => {
    expect(getMutationRetryDelay(1)).toBe(10_000);
    expect(getMutationRetryDelay(2)).toBe(20_000);
    expect(getMutationRetryDelay(3)).toBe(40_000);
  });

  it("caps retry delay at thirty minutes", () => {
    expect(getMutationRetryDelay(20)).toBe(30 * 60_000);
  });
});
