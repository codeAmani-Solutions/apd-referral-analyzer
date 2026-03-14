import { test, expect } from "@playwright/test";
import { injectSession, mockSupabaseRoutes } from "./helpers";

// ─── Login page ──────────────────────────────────────────────────────────────

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseRoutes(page);
  });

  test("renders email, password inputs and Sign In button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("renders link to /signup", async ({ page }) => {
    await page.goto("/login");
    const link = page.getByRole("link", { name: /create one/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/signup");
  });

  test("redirects already-authenticated user to /", async ({ page }) => {
    await injectSession(page);
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });

  test("shows error message on bad credentials", async ({ page }) => {
    // Override auth route to simulate failed login
    await page.route(/\/auth\/v1\/token/, (route) =>
      route.fulfill({
        status: 400,
        json: { error: "invalid_grant", error_description: "Invalid login credentials" },
      })
    );

    await page.goto("/login");
    await page.locator("#email").fill("bad@test.com");
    await page.locator("#password").fill("wrongpass");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/invalid login credentials/i)).toBeVisible();
  });

  test("disables button and shows loading text while submitting", async ({ page }) => {
    // Delay the auth response so we can observe the loading state
    await page.route(/\/auth\/v1\/token/, async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      route.fulfill({ status: 200, json: {} });
    });

    await page.goto("/login");
    await page.locator("#email").fill("user@test.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();

    const btn = page.getByRole("button", { name: /signing in/i });
    await expect(btn).toBeDisabled();
  });

  test("navigates to /signup when 'Create one' link is clicked", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /create one/i }).click();
    await expect(page).toHaveURL("/signup");
  });

  test("successful login redirects to /", async ({ page }) => {
    // Mock /auth/v1/token to return a valid session object
    await page.route(/\/auth\/v1\/token/, (route) =>
      route.fulfill({
        status: 200,
        json: {
          access_token: "fake-access-token",
          refresh_token: "fake-refresh-token",
          token_type: "bearer",
          expires_in: 3600,
          expires_at: 9_999_999_999,
          user: {
            id: "user-seed-001",
            aud: "authenticated",
            role: "authenticated",
            email: "user@test.com",
          },
        },
      })
    );

    await page.goto("/login");
    await page.locator("#email").fill("user@test.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL("/", { timeout: 5000 });
  });
});

// ─── Signup page ─────────────────────────────────────────────────────────────

test.describe("Signup page", () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseRoutes(page);
  });

  test("renders all four form fields and Create Account button", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("#provider-name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirm-password")).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("renders link to /login", async ({ page }) => {
    await page.goto("/signup");
    const link = page.getByRole("link", { name: /sign in/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/login");
  });

  test("redirects already-authenticated user to /", async ({ page }) => {
    await injectSession(page);
    await page.goto("/signup");
    await expect(page).toHaveURL("/");
  });

  test("shows password mismatch error (client-side, no network call)", async ({ page }) => {
    await page.goto("/signup");
    await page.locator("#provider-name").fill("My Org");
    await page.locator("#email").fill("new@test.com");
    await page.locator("#password").fill("password123");
    await page.locator("#confirm-password").fill("different!");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test("shows too-short password error (client-side, no network call)", async ({ page }) => {
    await page.goto("/signup");
    await page.locator("#provider-name").fill("My Org");
    await page.locator("#email").fill("new@test.com");
    await page.locator("#password").fill("short");
    await page.locator("#confirm-password").fill("short");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });

  test("shows Check your email state after successful signup", async ({ page }) => {
    // Email-confirmation flow: /signup returns user but session is null
    await page.route(/\/auth\/v1\/signup/, (route) =>
      route.fulfill({
        status: 200,
        json: {
          user: {
            id: "new-user-001",
            email: "pending@test.com",
            confirmation_sent_at: "2024-01-15T10:00:00Z",
          },
          session: null,
        },
      })
    );

    await page.goto("/signup");
    await page.locator("#provider-name").fill("Sunshine Homes");
    await page.locator("#email").fill("pending@test.com");
    await page.locator("#password").fill("secure123");
    await page.locator("#confirm-password").fill("secure123");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/pending@test\.com/)).toBeVisible();
  });

  test("shows error when signup API returns error", async ({ page }) => {
    await page.route(/\/auth\/v1\/signup/, (route) =>
      route.fulfill({
        status: 422,
        json: { error: "User already registered", message: "Email already registered" },
      })
    );

    await page.goto("/signup");
    await page.locator("#provider-name").fill("My Org");
    await page.locator("#email").fill("existing@test.com");
    await page.locator("#password").fill("password123");
    await page.locator("#confirm-password").fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/email already registered/i)).toBeVisible({ timeout: 5000 });
  });

  test("disables button and shows loading text while submitting", async ({ page }) => {
    await page.route(/\/auth\/v1\/signup/, async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      route.fulfill({ status: 200, json: { user: null, session: null } });
    });

    await page.goto("/signup");
    await page.locator("#provider-name").fill("My Org");
    await page.locator("#email").fill("new@test.com");
    await page.locator("#password").fill("password123");
    await page.locator("#confirm-password").fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();

    const btn = page.getByRole("button", { name: /creating account/i });
    await expect(btn).toBeDisabled();
  });
});
