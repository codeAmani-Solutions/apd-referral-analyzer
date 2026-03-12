import { ReferralDetail, ResHabEligibility } from "@/lib/types";
import FrostPanel from "@/components/ui/FrostPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import DataRow from "@/components/ui/DataRow";
import AlertBox from "@/components/ui/AlertBox";

interface Props {
  detail: ReferralDetail;
}

const ELIGIBILITY_LABELS: Record<keyof ResHabEligibility, string> = {
  behavior_analysis: "Behavior Analysis",
  behavior_assistant: "Behavior Assistant",
  life_skills_3: "Life Skills (Level 3)",
  life_skills_4: "Life Skills (Level 4)",
  residential_hab: "Residential Habilitation",
};

const yn = (val: boolean) => (val ? "Yes" : "No");

export default function PlacementTab({ detail }: Props) {
  const { lrc_review, referral } = detail;

  if (!lrc_review) {
    return (
      <AlertBox variant="warning" title="No LRC Data">
        LRC review has not been extracted yet. Upload the LRC Base document to
        populate this view.
      </AlertBox>
    );
  }

  const { eligibility, behavior_focused } = lrc_review;
  const { placement_considerations } = referral;

  return (
    <div className="space-y-4">
      {/* LRC Review summary */}
      <FrostPanel>
        <SectionHeader title="LRC Review" />
        <DataRow label="Status" value={lrc_review.status} />
        <DataRow label="Reviewer" value={lrc_review.reviewer} />
        <DataRow label="Review Date" value={lrc_review.review_date} />
        <DataRow label="ResHab Level" value={lrc_review.reshab_level} />
        <DataRow
          label="ResHab Designation"
          value={lrc_review.reshab_designation}
        />
        {lrc_review.psych_eval_note && (
          <DataRow label="Psych Eval Note" value={lrc_review.psych_eval_note} />
        )}
        {lrc_review.notes && (
          <DataRow label="Notes" value={lrc_review.notes} />
        )}
      </FrostPanel>

      {/* ResHab Eligibility */}
      {eligibility && (
        <FrostPanel>
          <SectionHeader title="ResHab Eligibility" />
          {(Object.keys(eligibility) as (keyof ResHabEligibility)[]).map(
            (key) => (
              <DataRow
                key={key}
                label={ELIGIBILITY_LABELS[key]}
                value={yn(eligibility[key])}
              />
            )
          )}
        </FrostPanel>
      )}

      {/* Behavior Focused */}
      {behavior_focused && (
        <FrostPanel>
          <SectionHeader title="Behavior Focused" />
          <DataRow label="Eligible" value={yn(behavior_focused.eligible)} />
          {behavior_focused.reason && (
            <DataRow label="Reason" value={behavior_focused.reason} />
          )}
          {behavior_focused.next_review_date && (
            <DataRow
              label="Next Review Date"
              value={behavior_focused.next_review_date}
            />
          )}
        </FrostPanel>
      )}

      {/* Placement Considerations */}
      {placement_considerations.length > 0 && (
        <FrostPanel>
          <SectionHeader title="Placement Considerations" />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {placement_considerations.map((c) => (
              <span
                key={c}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#4f35e0]/10 text-[#4f35e0] font-medium"
              >
                {c}
              </span>
            ))}
          </div>
        </FrostPanel>
      )}
    </div>
  );
}
