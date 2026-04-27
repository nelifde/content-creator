import { test, expect } from "@playwright/test";

/**
 * docs/qa/test-cases.md — TC-01: Kayıt + yeni workspace.
 *
 * İki mod:
 *  - E2E_EMAIL + E2E_PASSWORD tanımlıysa → mevcut onaylı hesapla login akışı
 *    (hesap daha önce workspace oluşturmamış olmalı)
 *  - Tanımlı değilse → yeni benzersiz e-posta ile signup akışı
 *    (Supabase'de e-posta onayı kapalı olmalı)
 */

const existingEmail = process.env.E2E_EMAIL;
const existingPassword = process.env.E2E_PASSWORD;
const useLoginFlow = !!(existingEmail && existingPassword);

test.describe("TC-01 — signup + new workspace", () => {
  test("registers, creates workspace, lands on dashboard with admin role", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    const stamp = Date.now();
    const agencyName = `QA Ajans A ${stamp}`;

    if (useLoginFlow) {
      // --- Mevcut onaylı hesapla login akışı ---
      await page.goto("/en/login");
      await expect(page.locator("#email")).toBeVisible();

      await page.locator("#email").fill(existingEmail!);
      await page.locator("#password").fill(existingPassword!);
      await Promise.all([
        page.waitForURL(/\/(en|tr)?\/?app(\/|$)/, {
          timeout: 30_000,
          waitUntil: "domcontentloaded",
        }),
        page.getByRole("button", { name: /log in|giriş/i }).click(),
      ]);
    } else {
      // --- Yeni hesap ile signup akışı ---
      const email = `qa_bulk_${stamp}@example.com`;
      const password = "TestQA1!";

      await page.goto("/en/signup");
      await expect(page.locator("#email")).toBeVisible();

      await page.locator("#email").fill(email);
      await page.locator("#password").fill(password);
      await Promise.all([
        page.waitForURL(/\/(en|tr)?\/?app(\/|$)/, {
          timeout: 90_000,
          waitUntil: "domcontentloaded",
        }),
        page.getByRole("button", { name: /sign up|kayıt/i }).click(),
      ]);
    }

    // --- Workspace oluştur ---
    await page.locator("#ws").fill(agencyName);
    await page.locator('form:has(#ws) button[type="submit"]').click();

    await page.waitForURL(/\/(en\/)?app\/[0-9a-f-]+$/i, { timeout: 45_000 });

    // --- Admin rolü ve müşteri formu doğrula ---
    await expect(page.getByText(/Your role|Rolünüz/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/admin/i).first()).toBeVisible();
    await expect(page.locator("#cl")).toBeVisible({ timeout: 10_000 });
  });
});
