import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import type { ReferralStatus } from "@/lib/types";
import { useSupabase } from "@/hooks/useSupabase";
import AppShell from "@/components/layout/AppShell";
import FrostPanel from "@/components/ui/FrostPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import AlertBox from "@/components/ui/AlertBox";

/** Shape returned by Supabase FK join on consumers */
type DashboardReferral = {
  id: string;
  status: ReferralStatus;
  deadline: string | null;
  created_at: string;
  consumers: { first_name: string; last_name: string } | null;
};

const ACTIVE_STATUSES: ReferralStatus[] = ["pending", "in_review", "eligible"];

export default function Dashboard() {
  const { supabase, session } = useSupabase();
  const [referrals, setReferrals] = useState<DashboardReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchReferrals() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from("referrals")
        .select("id, status, deadline, created_at, consumers(first_name, last_name)")
        .in("status", ACTIVE_STATUSES)
        .order("deadline", { ascending: true, nullsFirst: false });

      if (cancelled) return;

      if (err) {
        setError(err.message);
      } else {
        setReferrals((data as DashboardReferral[]) ?? []);
      }
      setLoading(false);
    }

    fetchReferrals();
    return () => { cancelled = true; };
  }, [supabase]);

  const providerName = (session?.user.user_metadata?.provider_name as string | undefined) ?? undefined;

  const statusCounts = ACTIVE_STATUSES.reduce<Record<ReferralStatus, number>>(
    (acc, s) => {
      acc[s] = referrals.filter((r) => r.status === s).length;
      return acc;
    },
    {} as Record<ReferralStatus, number>
  );

  return (
    <AppShell providerName={providerName}>
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-[#2d1e6b]">Active Referrals</h1>
          <Link
            to="/upload"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#4f35e0] px-3.5 py-1.5 rounded-full hover:bg-[#3d28b0] transition-colors"
          >
            <PlusCircle size={15} />
            New Upload
          </Link>
        </div>

        {/* Stat summary row */}
        {!loading && !error && (
          <FrostPanel>
            <div className="grid grid-cols-3 divide-x divide-[#4f35e0]/10">
              <StatCell label="Pending" count={statusCounts.pending} />
              <StatCell label="In Review" count={statusCounts.in_review} />
              <StatCell label="Eligible" count={statusCounts.eligible} />
            </div>
          </FrostPanel>
        )}

        {/* Loading */}
        {loading && (
          <FrostPanel>
            <p className="text-[13px] text-[#5c5470] text-center py-4">Loading referrals…</p>
          </FrostPanel>
        )}

        {/* Error */}
        {!loading && error && (
          <AlertBox variant="error" title="Failed to load referrals">
            {error}
          </AlertBox>
        )}

        {/* Empty */}
        {!loading && !error && referrals.length === 0 && (
          <AlertBox variant="info" title="No Active Referrals">
            No active referrals found. Upload a new referral packet to get started.
          </AlertBox>
        )}

        {/* Referral cards */}
        {!loading && !error && referrals.length > 0 && (
          <div className="space-y-2">
            <FrostPanel>
              <SectionHeader title={`Referrals (${referrals.length})`} />
            </FrostPanel>

            {referrals.map((r) => {
              const consumerName = r.consumers
                ? `${r.consumers.first_name} ${r.consumers.last_name}`
                : "—";

              const deadlineLabel = r.deadline
                ? new Date(r.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : null;

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
                          {deadlineLabel && (
                            <span className="ml-2 text-[#4f35e0]">Due {deadlineLabel}</span>
                          )}
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

function StatCell({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex flex-col items-center py-2 px-3">
      <span className="text-[22px] font-bold text-[#4f35e0]">{count}</span>
      <span className="text-[11px] text-[#5c5470]">{label}</span>
    </div>
  );
}
