import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type {
  Referral,
  Consumer,
  QSIAssessment,
  LRCReview,
  ReferralDocument,
  ReferralDetail,
} from "@/lib/types";

interface UseReferralReturn {
  data: ReferralDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches a full referral detail — referral row + consumer + QSI + LRC + documents.
 * Child tables are queried in parallel after the referral row is confirmed.
 */
export function useReferral(referralId: string | undefined): UseReferralReturn {
  const [data, setData] = useState<ReferralDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = () => setTrigger((t) => t + 1);

  useEffect(() => {
    if (!referralId) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchReferralDetail() {
      // 1. Fetch the referral row first
      const { data: referral, error: refErr } = await supabase
        .from("referrals")
        .select("*")
        .eq("id", referralId!)
        .single();

      if (refErr) {
        if (!cancelled) {
          setError(refErr.message);
          setLoading(false);
        }
        return;
      }

      // 2. Fetch all child records in parallel
      const [consumerRes, qsiRes, lrcRes, docsRes] = await Promise.all([
        supabase
          .from("consumers")
          .select("*")
          .eq("referral_id", referralId!)
          .maybeSingle(),
        supabase
          .from("qsi_assessments")
          .select("*")
          .eq("referral_id", referralId!)
          .maybeSingle(),
        supabase
          .from("lrc_reviews")
          .select("*")
          .eq("referral_id", referralId!)
          .maybeSingle(),
        supabase
          .from("documents")
          .select("*")
          .eq("referral_id", referralId!)
          .order("created_at", { ascending: false }),
      ]);

      // Check for child query errors (non-fatal — missing records are okay)
      const childError =
        consumerRes.error?.message ||
        qsiRes.error?.message ||
        lrcRes.error?.message ||
        docsRes.error?.message;

      if (childError && !cancelled) {
        setError(childError);
        setLoading(false);
        return;
      }

      if (!cancelled) {
        setData({
          referral: referral as Referral,
          consumer: (consumerRes.data as Consumer) ?? null,
          qsi_assessment: (qsiRes.data as QSIAssessment) ?? null,
          lrc_review: (lrcRes.data as LRCReview) ?? null,
          documents: (docsRes.data as ReferralDocument[]) ?? [],
        });
        setLoading(false);
      }
    }

    fetchReferralDetail();

    return () => {
      cancelled = true;
    };
  }, [referralId, trigger]);

  return { data, loading, error, refetch };
}
