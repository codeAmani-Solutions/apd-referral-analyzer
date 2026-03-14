import type { ReferralDetail, QSIFunctionalDetails } from "@/lib/types";
import FrostPanel from "@/components/ui/FrostPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import DataRow from "@/components/ui/DataRow";
import ProgressBar from "@/components/ui/ProgressBar";
import AccordionItem from "@/components/ui/AccordionItem";
import AlertBox from "@/components/ui/AlertBox";

interface Props {
  detail: ReferralDetail;
}

const FUNCTIONAL_LABELS: Record<keyof QSIFunctionalDetails, string> = {
  vision: "Vision",
  hearing: "Hearing",
  eating: "Eating",
  ambulation: "Ambulation",
  transfers: "Transfers",
  toileting: "Toileting",
  hygiene: "Hygiene",
  dressing: "Dressing",
  communications: "Communications",
  self_protection: "Self-Protection",
  evacuation: "Evacuation",
};

export default function FunctionalTab({ detail }: Props) {
  const { qsi_assessment, referral } = detail;

  if (!qsi_assessment) {
    return (
      <AlertBox variant="warning" title="No QSI Data">
        QSI assessment has not been extracted yet. Upload the QSI document to
        populate this view.
      </AlertBox>
    );
  }

  const { functional_level, functional_details } = qsi_assessment;
  const { functional_notes } = referral;

  return (
    <div className="space-y-4">
      {/* Functional level summary */}
      <FrostPanel>
        <SectionHeader title="Functional Support Level" />
        <DataRow label="Functional Level" value={functional_level} />
      </FrostPanel>

      {/* QSI functional scores */}
      {functional_details && (
        <AccordionItem title="Functional Scores (0 – 5 Scale)" defaultOpen>
          <div className="space-y-3 pt-1">
            {(
              Object.keys(functional_details) as (keyof QSIFunctionalDetails)[]
            ).map((key) => (
              <ProgressBar
                key={key}
                label={FUNCTIONAL_LABELS[key]}
                value={functional_details[key]}
                max={5}
              />
            ))}
          </div>
        </AccordionItem>
      )}

      {/* Functional notes from referral */}
      {functional_notes && (
        <FrostPanel>
          <SectionHeader title="Functional Notes" />
          <DataRow label="Community" value={functional_notes.community} />
          <DataRow
            label="Independence"
            value={functional_notes.independence}
          />
          <DataRow label="Hygiene" value={functional_notes.hygiene} />
          <DataRow label="Dressing" value={functional_notes.dressing} />
          <DataRow
            label="Self-Protection"
            value={functional_notes.self_protection}
          />
          <DataRow label="Evacuation" value={functional_notes.evacuation} />
        </FrostPanel>
      )}
    </div>
  );
}
