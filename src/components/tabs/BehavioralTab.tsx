import type { ReferralDetail, QSIBehavioralDetails } from "@/lib/types";
import FrostPanel from "@/components/ui/FrostPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import DataRow from "@/components/ui/DataRow";
import ProgressBar from "@/components/ui/ProgressBar";
import AccordionItem from "@/components/ui/AccordionItem";
import AlertBox from "@/components/ui/AlertBox";

interface Props {
  detail: ReferralDetail;
}

const BEHAVIORAL_LABELS: Record<keyof QSIBehavioralDetails, string> = {
  self_injury: "Self-Injury",
  aggression: "Aggression",
  property_destruction: "Property Destruction",
  sexual_behavior: "Sexual Behavior",
  running_away: "Running Away",
  other_behaviors: "Other Behaviors",
};

export default function BehavioralTab({ detail }: Props) {
  const { qsi_assessment, referral } = detail;

  if (!qsi_assessment) {
    return (
      <AlertBox variant="warning" title="No QSI Data">
        QSI assessment has not been extracted yet. Upload the QSI document to
        populate this view.
      </AlertBox>
    );
  }

  const { behavioral_level, behavioral_details } = qsi_assessment;
  const { behavioral_notes } = referral;

  return (
    <div className="space-y-4">
      {/* Behavioral level summary */}
      <FrostPanel>
        <SectionHeader title="Behavioral Support Level" />
        <DataRow label="Behavioral Level" value={behavioral_level} />
      </FrostPanel>

      {/* QSI behavioral scores */}
      {behavioral_details && (
        <AccordionItem title="Behavioral Scores (0 – 5 Scale)" defaultOpen>
          <div className="space-y-3 pt-1">
            {(
              Object.keys(behavioral_details) as (keyof QSIBehavioralDetails)[]
            ).map((key) => (
              <ProgressBar
                key={key}
                label={BEHAVIORAL_LABELS[key]}
                value={behavioral_details[key]}
                max={5}
              />
            ))}
          </div>
        </AccordionItem>
      )}

      {/* Behavioral notes from referral */}
      {behavioral_notes && (
        <FrostPanel>
          <SectionHeader title="Behavioral Notes" />
          <DataRow label="Self-Injury" value={behavioral_notes.self_injury} />
          <DataRow
            label="Other Behaviors"
            value={behavioral_notes.other_behaviors}
          />
          <DataRow label="Triggers" value={behavioral_notes.triggers} />
          <DataRow
            label="Interventions"
            value={behavioral_notes.interventions}
          />
        </FrostPanel>
      )}
    </div>
  );
}
