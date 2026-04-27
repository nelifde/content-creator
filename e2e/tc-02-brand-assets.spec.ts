import { test, expect } from "@playwright/test";

/**
 * Automates docs/qa/test-cases.md — TC-02 (client + brand → assets).
 * Requires a real Supabase user. Set E2E_EMAIL / E2E_PASSWORD (e.g. in shell or .env.local loaded by your shell).
 */

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const workspaceId = process.env.E2E_WORKSPACE_ID;
const clientId = process.env.E2E_CLIENT_ID;

test.describe("TC-02 — client + brand → /assets", () => {
  test("creates client and brand; lands on assets (not 404)", async ({ page }) => {
    test.skip(
      !email || !password,
      "Set E2E_EMAIL and E2E_PASSWORD (see e2e/README.md). Skipping authenticated flow.",
    );

    await page.goto("/en/login");
    await page.locator("#email").fill(email!);
    await page.locator("#password").fill(password!);
    await page.getByRole("button", { name: "Log in" }).click();

    await page.waitForURL(/\/(en|tr)?\/?app(\/|$)/, { timeout: 45_000 });

    if (workspaceId) {
      await page.goto(`/en/app/${workspaceId}`);
    } else {
      const ws = page
        .locator(
          'a[href*="/app/"]:not([href*="/clients/"]):not([href*="/admin"])',
        )
        .first();
      await expect(ws).toBeVisible({ timeout: 15_000 });
      await ws.click();
    }

    await page.waitForURL(/\/(en\/)?app\/[0-9a-f-]+$/i, { timeout: 20_000 });

    if (clientId && workspaceId) {
      await page.goto(`/en/app/${workspaceId}/clients/${clientId}`);
    } else {
      const clientName = `E2E Client ${Date.now()}`;
      await page.locator("#cl").fill(clientName);
      await page.locator('form:has(#cl) button[type="submit"]').click();
      await page.waitForURL(/\/clients\/[0-9a-f-]+$/i, { timeout: 30_000 });
    }

    const brandName = `E2E Brand ${Date.now()}`;
    await page.locator("#br").fill(brandName);
    await page.locator('form:has(#br) button[type="submit"]').click();

    await expect(page).toHaveURL(/\/brands\/[0-9a-f-]+\/assets(?:\?|$)/i, {
      timeout: 30_000,
    });

    const title = page.getByRole("heading", { name: brandName });
    await expect(title).toBeVisible({ timeout: 15_000 });
  });

  test("brand root URL redirects to /assets", async ({ page }) => {
    test.skip(
      !email || !password,
      "Set E2E_EMAIL and E2E_PASSWORD (see e2e/README.md).",
    );
    test.skip(
      !workspaceId || !clientId,
      "Set E2E_WORKSPACE_ID and E2E_CLIENT_ID to an existing client, and E2E_BRAND_ID for the brand root redirect check.",
    );
    const brandId = process.env.E2E_BRAND_ID;
    test.skip(!brandId, "Set E2E_BRAND_ID to an existing brand UUID.");

    await page.goto("/en/login");
    await page.locator("#email").fill(email!);
    await page.locator("#password").fill(password!);
    await page.getByRole("button", { name: "Log in" }).click();
    await page.waitForURL(/\/(en|tr)?\/?app(\/|$)/, { timeout: 45_000 });

    const root = `/en/app/${workspaceId}/clients/${clientId}/brands/${brandId}`;
    await page.goto(root);
    await expect(page).toHaveURL(/\/brands\/[0-9a-f-]+\/assets/i, {
      timeout: 15_000,
    });
  });
});
