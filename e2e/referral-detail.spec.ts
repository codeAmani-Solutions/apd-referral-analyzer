import { test, expect } from "@playwright/test";
import { injectSession, mockSupabaseRoutes, MOCK_REFERRAL } from "./helpers";

test.describe("ReferralDetail", () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseRoutes(page);
    await injectSession(page);
  });

  // ─── Layout / navigation ────────────────────────────────────────────────────

  test("renders consumer name and referral ID", async ({ page }) => {
    await page.goto("/referral/71176");
    await expect(page.getByRole("heading", { name: "Marcus Ellison" })).toBeVisible();
    await expect(page.getByText("Referral #71176")).toBeVisible();
  });

  test("renders back link labelled Dashboard", async ({ page }) => {
    await page.goto("/referral/71176");
    await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
  });

  test("back link navigates to /", async ({ page }) => {
    await page.goto("/referral/71176");
    await page.getByRole("link", { name: /dashboard/i }).click();
    await expect(page).toHaveURL("/");
  });

  // ─── Tab navigation ──────────────────────────────────────────────────────────

  test("renders all seven tab buttons", async ({ page }) => {
    await page.goto("/referral/71176");
    for (const label of [
      "Overview",
      "Consumer",
      "Clinical",
      "Behavioral",
      "Functional",
      "Placement",
      "Documents",
    ]) {
      await expect(page.getByRole("button", { name: label })).toBeVisible();
    }
  });

  test("Overview tab is active by default", async ({ page }) => {
    await page.goto("/referral/71176");
    await expect(page.getByRole("button", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("clicking Consumer tab marks it as active", async ({ page }) => {
    await page.goto("/referral/71176");
    await page.getByRole("button", { name: "Consumer" }).click();
    await expect(page.getByRole("button", { name: "Consumer" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  // ─── Loading state ───────────────────────────────────────────────────────────

  test("shows loading text while fetching referral", async ({ page }) => {
    // Delay the referrals response so the component stays in its loading state
    await page.route(/\/rest\/v1\/referrals/, async (route) => {
      await new Promise<void>((r) => setTimeout(r, 2000));
      route.fulfill({
        status: 200,
        json: MOCK_REFERRAL,
        headers: { "Content-Range": "0-0/1" },
      });
    });

    await page.goto("/referral/71176");
    await expect(page.getByText(/loading referral/i)).toBeVisible();
  });

  // ─── Error state ─────────────────────────────────────────────────────────────

  test("shows error message when referral query fails", async ({ page }) => {
    await page.route(/\/rest\/v1\/referrals/, (route) =>
      route.fulfill({ status: 500, json: { message: "Internal Server Error" } })
    );

    await page.goto("/referral/71176");
    await expect(page.getByText(/failed to load referral/i)).toBeVisible();
  });

  // ─── Not found state ─────────────────────────────────────────────────────────

  test("shows Not Found when referral does not exist", async ({ page }) => {
    // HTTP 200 + null body → supabase-js { data: null, error: null } → not-found branch
    await page.route(/\/rest\/v1\/referrals/, (route) =>
      route.fulfill({
        status: 200,
        json: null,
        headers: { "Content-Range": "*/0" },
      })
    );

    await page.goto("/referral/99999");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});

// ─── Unauthenticated ─────────────────────────────────────────────────────────

test.describe("ReferralDetail — unauthenticated", () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseRoutes(page);
    // No injectSession — localStorage is empty
  });

  test("redirects to /login when not authenticated", async ({ page }) => {
    await page.goto("/referral/71176");
    await expect(page).toHaveURL("/login");
  });
});
