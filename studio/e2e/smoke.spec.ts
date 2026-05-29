import { test, expect, devices } from "@playwright/test";

const iPhone13 = devices["iPhone 13"];
const Pixel5 = devices["Pixel 5"];

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

test.describe("Mobile smoke tests", () => {
  test("landing page loads on mobile and mobile menu is accessible", async ({ browser }) => {
    const context = await browser.newContext({ ...iPhone13 });
    const page = await context.newPage();
    await page.goto("/");

    await expect(page.locator("text=Radbit SME Hub")).toBeVisible();
    await expect(page.locator("text=Get Started")).toBeVisible();

    const mobileMenuTrigger = page.locator('[aria-label="Open menu"]');
    if (await mobileMenuTrigger.isVisible()) {
      await mobileMenuTrigger.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    }

    await context.close();
  });

  test("sign-in page is usable on mobile viewport", async ({ browser }) => {
    const context = await browser.newContext({ ...Pixel5 });
    const page = await context.newPage();
    await page.goto("/sign-in");

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    const signInButton = page.locator('button:has-text("Sign In")');
    await expect(signInButton).toBeVisible();

    const box = await signInButton.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }

    await context.close();
  });

  test("sign-up page form inputs meet minimum tap target on mobile", async ({ browser }) => {
    const context = await browser.newContext({ ...Pixel5 });
    const page = await context.newPage();
    await page.goto("/sign-up");

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    const box = await emailInput.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    await context.close();
  });

  test("dashboard redirects to sign-in on mobile without breaking layout", async ({ browser }) => {
    const context = await browser.newContext({ ...iPhone13 });
    const page = await context.newPage();
    await page.goto("/dashboard");
    await page.waitForURL("**/sign-in");

    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(390);

    await expect(page.locator('input[type="email"]')).toBeVisible();

    const overflowX = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(overflowX).toBeLessThanOrEqual(clientWidth + 1);

    await context.close();
  });
});
