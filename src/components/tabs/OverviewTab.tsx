import { Calendar, Hash } from "lucide-react";
import type { ReferralDetail } from "@/lib/types";
import FrostPanel from "@/components/ui/FrostPanel";
import StatusBadge from "@/components/ui/StatusBadge";
import StatBlock from "@/components/ui/StatBlock";
import SectionHeader from "@/components/ui/SectionHeader";
import DataRow from "@/components/ui/DataRow";
import AlertBox from "@/components/ui/AlertBox";

interface Props {
  detail: ReferralDetail;
}

export default function OverviewTab({ detail }: Props) {
  const { referral, consumer, qsi_assessment, lrc_review } = detail;

  const consumerName = consumer
    ? `${consumer.first_name} ${consumer.last_name}`
    : null;

  const deadline = referral.deadline
    ? new Date(referral.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-4">
      {/* Header card — ID + status */}
      <FrostPanel className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] text-[#5c5470] mb-0.5">Referral ID</p>
          <p className="text-[20px] font-bold text-[#2d1e6b] font-mono leading-tight">
            {referral.id}
          </p>
          {consumerName && (
            <p className="text-[12px] text-[#5c5470] mt-1">{consumerName}</p>
          )}
        </div>
        <StatusBadge status={referral.status} />
      </FrostPanel>

      {/* Key stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FrostPanel>
          <StatBlock
            label="Support Level"
            value={qsi_assessment?.overall_support_level ?? "—"}
            icon={<Hash className="w-3.5 h-3.5" />}
          />
        </FrostPanel>
        <FrostPanel>
          <StatBlock
            label="QSI Rating"
            value={qsi_assessment?.level_rating ?? "—"}
          />
        </FrostPanel>
        <FrostPanel>
          <StatBlock
            label="Deadline"
            value={deadline ?? "—"}
            icon={<Calendar className="w-3.5 h-3.5" />}
          />
        </FrostPanel>
      </div>

      {/* Diagnoses */}
      {referral.diagnoses && (
        <FrostPanel>
          <SectionHeader title="Diagnoses" />
          <DataRow label="Primary" value={referral.diagnoses.primary} />
          {referral.diagnoses.secondary && (
            <DataRow label="Secondary" value={referral.diagnoses.secondary} />
          )}
        </FrostPanel>
      )}

      {/* Services needed */}
      {referral.services_needed.length > 0 && (
        <FrostPanel>
          <SectionHeader title="Services Needed" />
          <div className="flex flex-wrap gap-1.5">
            {referral.services_needed.map((s) => (
              <span
                key={s}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#4f35e0]/10 text-[#4f35e0] font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </FrostPanel>
      )}

      {/* LRC snapshot */}
      {lrc_review && (
        <FrostPanel>
          <SectionHeader title="LRC Review" />
          <DataRow label="Status" value={lrc_review.status} />
          <DataRow label="Reviewer" value={lrc_review.reviewer} />
          <DataRow label="Review Date" value={lrc_review.review_date} />
          <DataRow label="ResHab Level" value={lrc_review.reshab_level} />
        </FrostPanel>
      )}

      {!consumer && !qsi_assessment && !lrc_review && (
        <AlertBox variant="warning" title="Incomplete Data">
          No consumer, QSI, or LRC data has been extracted yet. Upload the
          referral packet documents to populate this view.
        </AlertBox>
      )}
    </div>
  );
}
