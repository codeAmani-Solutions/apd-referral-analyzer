import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ReferralStatus } from "@/lib/types";
import { useSupabase } from "@/hooks/useSupabase";
import AppShell from "@/components/layout/AppShell";
import FrostPanel from "@/components/ui/FrostPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import AlertBox from "@/components/ui/AlertBox";

type HistoryReferral = {
  id: string;
  status: ReferralStatus;
  deadline: string | null;
  created_at: string;
  consumers: { first_name: string; last_name: string } | null;
};

const TERMINAL_STATUSES: ReferralStatus[] = ["ineligible", "placed"];

export default function History() {
  const { supabase } = useSupabase();
  const [referrals, setReferrals] = useState<HistoryReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from("referrals")
        .select("id, status, deadline, created_at, consumers(first_name, last_name)")
        .in("status", TERMINAL_STATUSES)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (err) {
        setError(err.message);
      } else {
        setReferrals((data as unknown as HistoryReferral[]) ?? []);
      }
      setLoading(false);
    }

    fetchHistory();
    return () => { cancelled = true; };
  }, [supabase]);

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-[#2d1e6b]">Referral History</h1>
        </div>

        {/* Loading */}
        {loading && (
          <FrostPanel>
            <p className="text-[13px] text-[#5c5470] text-center py-4">Loading history…</p>
          </FrostPanel>
        )}

        {/* Error */}
        {!loading && error && (
          <AlertBox variant="error" title="Failed to load history">
            {error}
          </AlertBox>
        )}

        {/* Empty */}
        {!loading && !error && referrals.length === 0 && (
          <AlertBox variant="info" title="No History">
            No placed or ineligible referrals found yet.
          </AlertBox>
        )}

        {/* Referral cards */}
        {!loading && !error && referrals.length > 0 && (
          <div className="space-y-2">
            <FrostPanel>
              <SectionHeader title={`Closed Referrals (${referrals.length})`} />
            </FrostPanel>

            {referrals.map((r) => {
              const consumerName = r.consumers
                ? `${r.consumers.first_name} ${r.consumers.last_name}`
                : "—";

              const createdLabel = new Date(r.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <Link key={r.id} to={`/referral/${r.id}`} className="block">
                  <FrostPanel className="hover:border-[#4f35e0]/40 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-[#2d1e6b] truncate">
                          {consumerName}
                        </p>
                        <p className="text-[11px] text-[#5c5470] mt-0.5">
                          #{r.id}
                          <span className="ml-2">Created {createdLabel}</span>
                        </p>
                      </div>
                      <StatusBadge status={r.status} className="shrink-0" />
                    </div>
                  </FrostPanel>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
