import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { useReferral } from "@/hooks/useReferral";

const SUPABASE_URL = "http://localhost:54321";

/* ── Mock data matching Supabase REST API shape ── */

const mockReferral = {
  id: "71176",
  provider_id: "prov-1",
  status: "in_review",
  deadline: "2025-07-15",
  diagnoses: { primary: "Autism Spectrum Disorder", secondary: null },
  behavioral_notes: null,
  functional_notes: null,
  services_needed: ["Residential Habilitation"],
  placement_considerations: [],
  raw_extracted_json: null,
  created_at: "2025-06-01T00:00:00Z",
  updated_at: "2025-06-01T00:00:00Z",
};

const mockConsumer = {
  id: "cons-1",
  referral_id: "71176",
  first_name: "Justin",
  last_name: "Chacon",
  dob: "1990-05-12",
  age: 35,
  gender: "Male",
  medicaid_number: null,
  region: "Central",
  current_residence: null,
  address: null,
  phone: null,
  legal_status: null,
  support_coordinator: null,
  referral_coordinator: null,
  created_at: "2025-06-01T00:00:00Z",
};

const mockQsi = {
  id: "qsi-1",
  referral_id: "71176",
  overall_support_level: "Standard",
  level_rating: 1,
  functional_level: 1,
  functional_details: null,
  behavioral_level: 1,
  behavioral_details: null,
  physical_level: 1,
  physical_details: null,
  life_change_stress: null,
  created_at: "2025-06-01T00:00:00Z",
};

const mockLrc = {
  id: "lrc-1",
  referral_id: "71176",
  review_date: "2025-06-01",
  reviewer: "Reviewer A",
  status: "approved",
  notes: null,
  psych_eval_note: null,
  reshab_level: "Standard",
  reshab_designation: "STD",
  eligibility: null,
  behavior_focused: null,
  created_at: "2025-06-01T00:00:00Z",
};

const mockDocuments = [
  {
    id: "doc-1",
    referral_id: "71176",
    name: "LRC Base Form.pdf",
    type: "lrc_base",
    doc_subtype: null,
    status: "complete",
    storage_path: null,
    upload_date: "2025-06-01T00:00:00Z",
    created_at: "2025-06-01T00:00:00Z",
  },
];

/* ── Helper: Install handlers that return full mock data ── */

function installSuccessHandlers() {
  server.use(
    // Supabase REST returns single object for .single() queries
    http.get(`${SUPABASE_URL}/rest/v1/referrals`, () => {
      return HttpResponse.json(mockReferral, {
        headers: { "content-range": "0-0/1" },
      });
    }),
    http.get(`${SUPABASE_URL}/rest/v1/consumers`, () => {
      return HttpResponse.json(mockConsumer, {
        headers: { "content-range": "0-0/1" },
      });
    }),
    http.get(`${SUPABASE_URL}/rest/v1/qsi_assessments`, () => {
      return HttpResponse.json(mockQsi, {
        headers: { "content-range": "0-0/1" },
      });
    }),
    http.get(`${SUPABASE_URL}/rest/v1/lrc_reviews`, () => {
      return HttpResponse.json(mockLrc, {
        headers: { "content-range": "0-0/1" },
      });
    }),
    http.get(`${SUPABASE_URL}/rest/v1/documents`, () => {
      return HttpResponse.json(mockDocuments);
    }),
  );
}

/* ── Tests ── */

describe("useReferral", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("returns null data and loading=false when referralId is undefined", async () => {
    const { result } = renderHook(() => useReferral(undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("starts in a loading state when referralId is provided", () => {
    installSuccessHandlers();
    const { result } = renderHook(() => useReferral("71176"));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it("fetches full referral detail on success", async () => {
    installSuccessHandlers();
    const { result } = renderHook(() => useReferral("71176"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).not.toBeNull();
    expect(result.current.data!.referral.id).toBe("71176");
    expect(result.current.data!.consumer?.first_name).toBe("Justin");
    expect(result.current.data!.qsi_assessment?.overall_support_level).toBe(
      "Standard",
    );
    expect(result.current.data!.lrc_review?.reshab_designation).toBe("STD");
    expect(result.current.data!.documents).toHaveLength(1);
  });

  it("sets error when referral query fails", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/referrals`, () => {
        return HttpResponse.json(
          { message: "Referral not found", details: "", hint: "", code: "" },
          { status: 406 },
        );
      }),
    );

    const { result } = renderHook(() => useReferral("99999"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
  });

  it("handles missing child records gracefully (null consumer, qsi, lrc)", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/referrals`, () => {
        return HttpResponse.json(mockReferral, {
          headers: { "content-range": "0-0/1" },
        });
      }),
      // maybeSingle returns null when no row found (empty body with 200 + specific header)
      http.get(`${SUPABASE_URL}/rest/v1/consumers`, () => {
        return HttpResponse.json(null, {
          headers: { "content-range": "*/0" },
        });
      }),
      http.get(`${SUPABASE_URL}/rest/v1/qsi_assessments`, () => {
        return HttpResponse.json(null, {
          headers: { "content-range": "*/0" },
        });
      }),
      http.get(`${SUPABASE_URL}/rest/v1/lrc_reviews`, () => {
        return HttpResponse.json(null, {
          headers: { "content-range": "*/0" },
        });
      }),
      http.get(`${SUPABASE_URL}/rest/v1/documents`, () => {
        return HttpResponse.json([]);
      }),
    );

    const { result } = renderHook(() => useReferral("71176"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).not.toBeNull();
    expect(result.current.data!.referral.id).toBe("71176");
    expect(result.current.data!.consumer).toBeNull();
    expect(result.current.data!.qsi_assessment).toBeNull();
    expect(result.current.data!.lrc_review).toBeNull();
    expect(result.current.data!.documents).toEqual([]);
  });

  it("exposes a refetch function", () => {
    installSuccessHandlers();
    const { result } = renderHook(() => useReferral("71176"));
    expect(typeof result.current.refetch).toBe("function");
  });
});
