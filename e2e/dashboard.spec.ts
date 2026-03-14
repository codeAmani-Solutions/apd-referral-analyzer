import { test, expect } from "@playwright/test";
import { injectSession, mockSupabaseRoutes, SEED_PROVIDER_ID, SEED_USER_ID } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseRoutes(page);
    await injectSession(page);
  });

  // ─── Layout / navigation ────────────────────────────────────────────────────

  test("renders 'Active Referrals' heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Active Referrals" })).toBeVisible();
  });

  test("renders 'New Upload' link pointing to /upload", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /new upload/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/upload");
  });

  // ─── With data ──────────────────────────────────────────────────────────────

  test("displays consumer name and referral ID from mock data", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Marcus Ellison")).toBeVisible();
    await expect(page.getByText("#71176")).toBeVisible();
  });

  test("clicking a referral card navigates to /referral/:id", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Marcus Ellison").click();
    await expect(page).toHaveURL("/referral/71176");
  });

  test("shows pending status badge on the referral card", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/pending/i).first()).toBeVisible();
  });

  test("shows stat counts for Pending, In Review, Eligible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Pending").first()).toBeVisible();
    await expect(page.getByText("In Review")).toBeVisible();
    await expect(page.getByText("Eligible")).toBeVisible();
  });

  // ─── Empty state ─────────────────────────────────────────────────────────────

  test("shows 'No Active Referrals' when list is empty", async ({ page }) => {
    // Override the referrals route to return an empty array
    await page.route(/\/rest\/v1\/referrals/, (route) =>
      route.fulfill({
        status: 200,
        json: [],
        headers: { "Content-Range": "*/0" },
      })
    );

    await page.goto("/");
    await expect(page.getByText(/no active referrals/i)).toBeVisible();
  });

  // ─── Error state ─────────────────────────────────────────────────────────────

  test("shows error message when referrals query fails", async ({ page }) => {
    await page.route(/\/rest\/v1\/referrals/, (route) =>
      route.fulfill({ status: 500, json: { message: "Internal Server Error" } })
    );

    await page.goto("/");
    await expect(page.getByText(/failed to load referrals/i)).toBeVisible();
  });
});

// ─── Unauthenticated ─────────────────────────────────────────────────────────

test.describe("Dashboard — unauthenticated", () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseRoutes(page);
    // No injectSession — localStorage is empty
  });

  test("redirects to /login when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });
});
