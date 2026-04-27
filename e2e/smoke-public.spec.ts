import { test, expect } from "@playwright/test";

test.describe("Public smoke", () => {
  test("login page responds and shows email field", async ({ page }) => {
    const res = await page.goto("/en/login");
    expect(res?.ok()).toBeTruthy();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });
});
