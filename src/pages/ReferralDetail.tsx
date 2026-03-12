import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useReferral } from "@/hooks/useReferral";
import AppShell from "@/components/layout/AppShell";
import TabNav, { type TabId } from "@/components/layout/TabNav";
import FrostPanel from "@/components/ui/FrostPanel";
import AlertBox from "@/components/ui/AlertBox";
import OverviewTab from "@/components/tabs/OverviewTab";
import ConsumerTab from "@/components/tabs/ConsumerTab";
import ClinicalTab from "@/components/tabs/ClinicalTab";
import BehavioralTab from "@/components/tabs/BehavioralTab";
import FunctionalTab from "@/components/tabs/FunctionalTab";
import PlacementTab from "@/components/tabs/PlacementTab";
import DocumentsTab from "@/components/tabs/DocumentsTab";

export default function ReferralDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useReferral(id);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const consumerName =
    data?.consumer
      ? `${data.consumer.first_name} ${data.consumer.last_name}`
      : id ?? "Referral";

  return (
    <AppShell>
      <div className="space-y-3">
        {/* Back nav + title */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-1 text-[12px] text-[#5c5470] hover:text-[#4f35e0] transition-colors"
          >
            <ArrowLeft size={14} />
            Dashboard
          </Link>
        </div>

        {loading && (
          <FrostPanel>
            <p className="text-[13px] text-[#5c5470] text-center py-6">Loading referral…</p>
          </FrostPanel>
        )}

        {!loading && error && (
          <AlertBox variant="error" title="Failed to load referral">
            {error}
          </AlertBox>
        )}

        {!loading && !error && !data && (
          <AlertBox variant="warning" title="Not Found">
            Referral {id} could not be found.
          </AlertBox>
        )}

        {!loading && !error && data && (
          <>
            {/* Header card */}
            <FrostPanel>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-[18px] font-bold text-[#2d1e6b]">{consumerName}</h1>
                  <p className="text-[12px] text-[#5c5470] mt-0.5">Referral #{id}</p>
                </div>
              </div>
            </FrostPanel>

            {/* Tab navigation */}
            <div className="rounded-xl overflow-hidden border border-black/[0.06] shadow-sm">
              <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

              <div className="p-3 bg-white/30 backdrop-blur-[6px]">
                {activeTab === "overview" && <OverviewTab detail={data} />}
                {activeTab === "consumer" && <ConsumerTab detail={data} />}
                {activeTab === "clinical" && <ClinicalTab detail={data} />}
                {activeTab === "behavioral" && <BehavioralTab detail={data} />}
                {activeTab === "functional" && <FunctionalTab detail={data} />}
                {activeTab === "placement" && <PlacementTab detail={data} />}
                {activeTab === "documents" && <DocumentsTab detail={data} />}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
