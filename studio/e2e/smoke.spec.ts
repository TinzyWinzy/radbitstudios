import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("landing page loads and shows key elements", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Radbit SME Hub")).toBeVisible();
    await expect(page.locator("text=Get Started")).toBeVisible();
    await expect(page.locator("text=Sign In")).toBeVisible();
  });

  test("sign-in page renders and has form fields", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test("sign-up page renders and has form fields", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator("text=Create Account")).toBeVisible();
  });

  test("unauthenticated user is redirected from dashboard to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/sign-in");
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
