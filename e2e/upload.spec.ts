import { test, expect } from "@playwright/test";
import { injectSession, mockSupabaseRoutes } from "./helpers";
import path from "path";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Mock all three legs of the upload pipeline (storage, documents, parse fn). */
async function mockUploadSuccess(page: Parameters<typeof mockSupabaseRoutes>[0]) {
  // Supabase Storage upload
  await page.route(/\/storage\/v1\/object\/documents/, (route) =>
    route.fulfill({ status: 200, json: { Key: "referrals/71176/test.pdf" } })
  );

  // documents table insert + .select("id").single()
  await page.route(/\/rest\/v1\/documents/, (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 201,
        json: { id: "doc-seed-001" },
        headers: { "Content-Range": "0-0/1" },
      });
    } else {
      route.fulfill({ status: 200, json: [], headers: { "Content-Range": "*/0" } });
    }
  });

  // Netlify parse-referral function
  await page.route(/\/.netlify\/functions\/parse-referral/, (route) =>
    route.fulfill({ status: 200, json: { ok: true } })
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe("Upload page", () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseRoutes(page);
    await injectSession(page);
  });

  // ─── Layout ────────────────────────────────────────────────────────────────

  test("renders heading, referral ID input, doc-type select and submit button", async ({
    page,
  }) => {
    await page.goto("/upload");
    await expect(page.getByRole("heading", { name: /upload document/i })).toBeVisible();
    await expect(page.locator("#referral-id")).toBeVisible();
    await expect(page.locator("#doc-type")).toBeVisible();
    await expect(page.getByRole("button", { name: /upload & extract/i })).toBeVisible();
  });

  test("doc-type select has all four options", async ({ page }) => {
    await page.goto("/upload");
    const select = page.locator("#doc-type");
    for (const label of ["LRC Base", "QSI Assessment", "Support Plan", "Other"]) {
      await expect(select.locator(`option:has-text("${label}")`)).toHaveCount(1);
    }
  });

  test("submit button is disabled until both referral ID and file are provided", async ({
    page,
  }) => {
    await page.goto("/upload");
    const btn = page.getByRole("button", { name: /upload & extract/i });

    // Initially disabled — no referral ID or file
    await expect(btn).toBeDisabled();

    // Fill referral ID — still disabled (no file)
    await page.locator("#referral-id").fill("71176");
    await expect(btn).toBeDisabled();
  });

  test("submit button enables after referral ID and file are both provided", async ({
    page,
  }) => {
    await page.goto("/upload");

    await page.locator("#referral-id").fill("71176");
    await page.locator("#file-input").setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });

    await expect(page.getByRole("button", { name: /upload & extract/i })).toBeEnabled();
  });

  test("shows selected file name after choosing a file", async ({ page }) => {
    await page.goto("/upload");

    await page.locator("#file-input").setInputFiles({
      name: "referral-packet.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });

    await expect(page.getByText("referral-packet.pdf")).toBeVisible();
  });

  // ─── Success flow ──────────────────────────────────────────────────────────

  test("shows Upload Complete alert and two action buttons on success", async ({
    page,
  }) => {
    await mockUploadSuccess(page);

    await page.goto("/upload");
    await page.locator("#referral-id").fill("71176");
    await page.locator("#file-input").setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });
    await page.getByRole("button", { name: /upload & extract/i }).click();

    await expect(page.getByText(/upload complete/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: /view referral/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /upload another/i })).toBeVisible();
  });

  test("'View Referral' button navigates to /referral/:id after success", async ({
    page,
  }) => {
    await mockUploadSuccess(page);

    await page.goto("/upload");
    await page.locator("#referral-id").fill("71176");
    await page.locator("#file-input").setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });
    await page.getByRole("button", { name: /upload & extract/i }).click();

    await page.getByRole("button", { name: /view referral/i }).click({ timeout: 5000 });
    await expect(page).toHaveURL("/referral/71176");
  });

  test("'Upload Another' button resets form after success", async ({ page }) => {
    await mockUploadSuccess(page);

    await page.goto("/upload");
    await page.locator("#referral-id").fill("71176");
    await page.locator("#file-input").setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });
    await page.getByRole("button", { name: /upload & extract/i }).click();
    await page.getByRole("button", { name: /upload another/i }).click({ timeout: 5000 });

    // Form should be back; submit button should be disabled again
    await expect(page.locator("#referral-id")).toBeVisible();
    await expect(page.getByRole("button", { name: /upload & extract/i })).toBeDisabled();
  });

  // ─── Loading / uploading state ─────────────────────────────────────────────

  test("shows Processing button text and status message during upload", async ({
    page,
  }) => {
    // Delay storage response to observe uploading state
    await page.route(/\/storage\/v1\/object\/documents/, async (route) => {
      await new Promise<void>((r) => setTimeout(r, 2000));
      route.fulfill({ status: 200, json: { Key: "referrals/71176/test.pdf" } });
    });

    await page.goto("/upload");
    await page.locator("#referral-id").fill("71176");
    await page.locator("#file-input").setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });
    await page.getByRole("button", { name: /upload & extract/i }).click();

    await expect(page.getByRole("button", { name: /processing/i })).toBeDisabled();
    await expect(page.getByText(/uploading file/i)).toBeVisible();
  });

  // ─── Error states ──────────────────────────────────────────────────────────

  test("shows Upload Failed alert when storage upload fails", async ({ page }) => {
    await page.route(/\/storage\/v1\/object\/documents/, (route) =>
      route.fulfill({ status: 400, json: { message: "Bucket not found" } })
    );

    await page.goto("/upload");
    await page.locator("#referral-id").fill("71176");
    await page.locator("#file-input").setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });
    await page.getByRole("button", { name: /upload & extract/i }).click();

    await expect(page.getByText(/upload failed/i)).toBeVisible({ timeout: 5000 });
  });

  test("shows Upload Failed alert when Netlify function returns error", async ({
    page,
  }) => {
    // Storage and DB succeed; parse function fails
    await page.route(/\/storage\/v1\/object\/documents/, (route) =>
      route.fulfill({ status: 200, json: { Key: "referrals/71176/test.pdf" } })
    );
    await page.route(/\/rest\/v1\/documents/, (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 201,
          json: { id: "doc-seed-001" },
          headers: { "Content-Range": "0-0/1" },
        });
      }
    });
    await page.route(/\/.netlify\/functions\/parse-referral/, (route) =>
      route.fulfill({ status: 500, body: "Internal Server Error" })
    );

    await page.goto("/upload");
    await page.locator("#referral-id").fill("71176");
    await page.locator("#file-input").setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });
    await page.getByRole("button", { name: /upload & extract/i }).click();

    await expect(page.getByText(/upload failed/i)).toBeVisible({ timeout: 5000 });
  });

  test("'Try again' button returns to form after error", async ({ page }) => {
    await page.route(/\/storage\/v1\/object\/documents/, (route) =>
      route.fulfill({ status: 400, json: { message: "Bucket not found" } })
    );

    await page.goto("/upload");
    await page.locator("#referral-id").fill("71176");
    await page.locator("#file-input").setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });
    await page.getByRole("button", { name: /upload & extract/i }).click();

    await page.getByRole("button", { name: /try again/i }).click({ timeout: 5000 });
    await expect(page.locator("#referral-id")).toBeVisible();
  });
});

// ─── Unauthenticated ──────────────────────────────────────────────────────────

test.describe("Upload — unauthenticated", () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseRoutes(page);
    // No injectSession — localStorage is empty
  });

  test("redirects to /login when not authenticated", async ({ page }) => {
    await page.goto("/upload");
    await expect(page).toHaveURL("/login");
  });
});
