import { http, HttpResponse } from "msw";

const SUPABASE_URL = "http://localhost:54321";

export const handlers = [
  // Supabase REST: referrals list
  http.get(`${SUPABASE_URL}/rest/v1/referrals`, () => {
    return HttpResponse.json([]);
  }),

  // Supabase REST: single referral with joins
  http.get(`${SUPABASE_URL}/rest/v1/referrals*`, () => {
    return HttpResponse.json([]);
  }),

  // Supabase Auth: get session
  http.get(`${SUPABASE_URL}/auth/v1/session`, () => {
    return HttpResponse.json({ data: { session: null } });
  }),

  // Netlify function: parse referral
  http.post("/.netlify/functions/parse-referral", () => {
    return HttpResponse.json({ success: true, data: {} });
  }),
];
