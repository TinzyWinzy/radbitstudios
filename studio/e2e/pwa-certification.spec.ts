import { expect, test } from "@playwright/test";

test.setTimeout(90_000);

test.describe("PWA certification contract", () => {
  test("manifest exposes cross-platform installation metadata", async ({ request }) => {
    const response = await request.get("/manifest.json");
    expect(response.ok()).toBeTruthy();
    const manifest = await response.json();
    expect(manifest).toMatchObject({ id: "/", start_url: "/", scope: "/", display: "standalone" });
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ sizes: "192x192" }),
      expect.objectContaining({ sizes: "512x512", purpose: expect.stringContaining("maskable") }),
    ]));
  });

  test("service worker installs without an error overlay", async ({ page, context, browserName }) => {
    test.skip(browserName === "webkit", "WebKit automation does not expose installed iOS Home Screen lifecycle");
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 60_000 });
    const registration = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return null;
      const registered = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const worker = registered.installing || registered.waiting || registered.active;
      if (worker && worker.state !== "activated") {
        await new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error("Service worker activation timed out")), 20_000);
          worker.addEventListener("statechange", () => {
            if (worker.state === "activated") {
              window.clearTimeout(timeout);
              resolve();
            }
          });
        });
      }
      const ready = await navigator.serviceWorker.ready;
      return { scope: ready.scope, active: ready.active?.state };
    });
    expect(registration?.scope).toContain("/");
    expect(registration?.active).toBe("activated");
    expect(await page.locator("[data-nextjs-dialog]").count()).toBe(0);
    await page.reload({ waitUntil: "domcontentloaded" });
    expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    await page.goto("/offline-certification-route", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Your work is still here.")).toBeVisible();
    await context.setOffline(false);
  });

  test("mobile viewport has no horizontal overflow and supports safe-area installation UI", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 60_000 });
    const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute("content", /width=device-width/);
  });
});
