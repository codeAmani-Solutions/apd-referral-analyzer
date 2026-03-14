import type { Page } from "@playwright/test";

// ─── Seed constants ──────────────────────────────────────────────────────────

export const SEED_PROVIDER_ID = "prov-seed-001";
export const SEED_USER_ID = "user-seed-001";
export const SUPABASE_KEY = "sb-ydgamjbhpsdzyxkzygtq-auth-token";

/**
 * Bare referral row as returned by useReferral (.single() query)
 * or the inner row in the Dashboard FK-join.
 */
export const MOCK_REFERRAL = {
  id: "71176",
  status: "pending" as const,
  deadline: null,
  diagnoses: null,
  behavioral_notes: null,
  functional_notes: null,
  services_needed: [] as string[],
  placement_considerations: [] as string[],
  raw_extracted_json: null,
  created_at: "2024-01-15T10:00:00.000Z",
  updated_at: "2024-01-15T10:00:00.000Z",
  provider_id: SEED_PROVIDER_ID,
};

/** Consumer row as returned by useReferral (.maybeSingle() query) */
export const MOCK_CONSUMER = {
  id: "cons-seed-001",
  referral_id: "71176",
  first_name: "Justin",
  last_name: "Chacon",
  dob: "2007-12-22",
  age: null,
  gender: null,
  medicaid_number: null,
  region: null,
  current_residence: null,
  address: null,
  phone: null,
  legal_status: null,
  support_coordinator: null,
  referral_coordinator: null,
  created_at: "2024-01-15T10:00:00.000Z",
};

/**
 * Dashboard FK-join shape: referral row with nested `consumers` object.
 * This is what `.select("id, status, ..., consumers(first_name, last_name)")`
 * returns in a list (array) response.
 */
export const MOCK_DASHBOARD_REFERRAL = {
  ...MOCK_REFERRAL,
  consumers: { first_name: "Justin", last_name: "Chacon" },
};

// ─── Auth injection ───────────────────────────────────────────────────────────

/**
 * Injects a fake Supabase session into localStorage before the page loads.
 * useSupabase.ts calls supabase.auth.getSession() on mount, which reads
 * from localStorage first — so this guarantees the app boots as authenticated
 * without any network calls to /auth/v1/.
 */
export async function injectSession(page: Page): Promise<void> {
  await page.addInitScript(
    ({ key, payload }) => {
      localStorage.setItem(key, JSON.stringify(payload));
    },
    {
      key: SUPABASE_KEY,
      payload: {
        access_token: "fake-access-token",
        refresh_token: "fake-refresh-token",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: 9_999_999_999,
        user: {
          id: SEED_USER_ID,
          aud: "authenticated",
          role: "authenticated",
          email: "seed@apd-dev.local",
        },
      },
    }
  );
}

// ─── Supabase REST route mocking ─────────────────────────────────────────────

/**
 * Returns true when the PostgREST client expects a single-row response
 * (i.e. when .single() or .maybeSingle() was used in the query).
 */
function isSingleRow(headers: Record<string, string>): boolean {
  return (headers["accept"] ?? "").includes(
    "application/vnd.pgrst.object+json"
  );
}

/**
 * Mock all Supabase REST API calls used by the app.
 * Individual tests may call page.route() AFTER this to override specific
 * routes (Playwright's LIFO handler ordering means the latest wins).
 */
export async function mockSupabaseRoutes(page: Page): Promise<void> {
  // Auth endpoints — blanket 200 OK so token-refresh doesn't fail
  await page.route(/\/auth\/v1\//, (route) =>
    route.fulfill({ status: 200, json: {} })
  );

  // /auth/v1/user — supabase-js calls this to validate the injected session.
  // Must return a real user object; {} causes a SIGNED_OUT event that clears
  // the injected session before the page finishes mounting.
  // Registered AFTER the blanket so Playwright's LIFO ordering makes it win.
  await page.route(/\/auth\/v1\/user/, (route) =>
    route.fulfill({
      status: 200,
      json: {
        id: SEED_USER_ID,
        aud: "authenticated",
        role: "authenticated",
        email: "seed@apd-dev.local",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
      },
    })
  );

  // providers table — useAuth.fetchOrCreateProvider
  await page.route(/\/rest\/v1\/providers/, (route) =>
    route.fulfill({
      status: 200,
      json: { id: SEED_PROVIDER_ID, user_id: SEED_USER_ID, name: "Dev Provider" },
      headers: { "Content-Range": "0-0/1" },
    })
  );

  // referrals — dual behaviour: Dashboard (list) vs ReferralDetail (.single())
  await page.route(/\/rest\/v1\/referrals/, (route) => {
    const single = isSingleRow(route.request().headers());
    if (single) {
      route.fulfill({
        status: 200,
        json: MOCK_REFERRAL,
        headers: { "Content-Range": "0-0/1" },
      });
    } else {
      route.fulfill({
        status: 200,
        json: [MOCK_DASHBOARD_REFERRAL],
        headers: { "Content-Range": "0-0/1" },
      });
    }
  });

  // consumers — maybeSingle() → object, list → array
  await page.route(/\/rest\/v1\/consumers/, (route) => {
    const single = isSingleRow(route.request().headers());
    route.fulfill({
      status: 200,
      json: single ? MOCK_CONSUMER : [MOCK_CONSUMER],
      headers: { "Content-Range": "0-0/1" },
    });
  });

  // qsi_assessments — maybeSingle() → null (no data), list → []
  await page.route(/\/rest\/v1\/qsi_assessments/, (route) => {
    const single = isSingleRow(route.request().headers());
    route.fulfill({
      status: 200,
      json: single ? null : [],
      headers: { "Content-Range": "*/0" },
    });
  });

  // lrc_reviews — same pattern as qsi
  await page.route(/\/rest\/v1\/lrc_reviews/, (route) => {
    const single = isSingleRow(route.request().headers());
    route.fulfill({
      status: 200,
      json: single ? null : [],
      headers: { "Content-Range": "*/0" },
    });
  });

  // documents — always an array (ordered query, no .maybeSingle())
  await page.route(/\/rest\/v1\/documents/, (route) =>
    route.fulfill({
      status: 200,
      json: [],
      headers: { "Content-Range": "*/0" },
    })
  );
}
