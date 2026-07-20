import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const publicDir = resolve(process.cwd(), "public");
const manifest = JSON.parse(readFileSync(resolve(publicDir, "manifest.json"), "utf8"));
const serviceWorker = readFileSync(resolve(publicDir, "sw.js"), "utf8");

describe("PWA platform contract", () => {
  it("defines an installable standalone app with scope and stable identity", () => {
    expect(manifest.id).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
  });

  it("ships every declared icon and a maskable Android icon", () => {
    for (const icon of manifest.icons) {
      expect(existsSync(resolve(publicDir, icon.src.replace(/^\//, "")))).toBe(true);
    }
    expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose?.includes("maskable"))).toBe(true);
  });

  it("ships an offline fallback and avoids caching private API responses", () => {
    expect(existsSync(resolve(publicDir, "offline.html"))).toBe(true);
    expect(serviceWorker).toContain("networkOnly(request)");
    expect(serviceWorker).toContain("caches.match('/offline.html')");
    expect(serviceWorker).not.toContain("badge-72x72.png");
  });
});
