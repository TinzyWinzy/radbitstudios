import { describe, it, expect, beforeEach } from "vitest";
import { CacheService } from "@/services/cache-service";

describe("CacheService", () => {
  let cache: CacheService<string>;

  beforeEach(() => {
    cache = new CacheService(10);
  });

  it("stores and retrieves a value", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("returns null for a missing key", () => {
    expect(cache.get("nonexistent")).toBeNull();
  });

  it("returns null for an expired entry", async () => {
    const shortCache = new CacheService<string>(0.001);
    shortCache.set("key", "value");
    await new Promise((r) => setTimeout(r, 10));
    expect(shortCache.get("key")).toBeNull();
  });

  it("deletes a specific key", () => {
    cache.set("key1", "value1");
    cache.delete("key1");
    expect(cache.get("key1")).toBeNull();
  });

  it("clears all entries", () => {
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.clear();
    expect(cache.get("key1")).toBeNull();
    expect(cache.get("key2")).toBeNull();
  });

  it("overwrites an existing key", () => {
    cache.set("key1", "value1");
    cache.set("key1", "value2");
    expect(cache.get("key1")).toBe("value2");
  });
});
