import type { ReferralDetail, QSIPhysicalDetails } from "@/lib/types";
import FrostPanel from "@/components/ui/FrostPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import DataRow from "@/components/ui/DataRow";
import AccordionItem from "@/components/ui/AccordionItem";
import AlertBox from "@/components/ui/AlertBox";

interface Props {
  detail: ReferralDetail;
}

const PHYSICAL_LABELS: Record<keyof QSIPhysicalDetails, string> = {
  injury_from_sib: "Injuries from SIB",
  injury_from_aggression: "Injuries from Aggression",
  mechanical_restraint: "Mechanical Restraint",
  chemical_restraint: "Chemical Restraint",
  psychotropic_meds: "Psychotropic Meds",
  gastrointestinal: "Gastrointestinal",
  seizures: "Seizures",
  skin_breakdown: "Skin Breakdown",
  bowel_function: "Bowel Function",
  nutrition: "Nutrition",
  chronic_health: "Chronic Health",
  injuries: "Injuries",
  falls: "Falls",
  physician_visits: "Physician Visits",
  er_visits: "ER Visits",
  hospital_admissions: "Hospital Admissions",
  missed_days: "Missed Program Days",
};

export default function ClinicalTab({ detail }: Props) {
  const { qsi_assessment } = detail;

  if (!qsi_assessment) {
    return (
      <AlertBox variant="warning" title="No QSI Data">
        QSI assessment has not been extracted yet. Upload the QSI document to
        populate this view.
      </AlertBox>
    );
  }

  const { physical_details, physical_level, life_change_stress } = qsi_assessment;

  return (
    <div className="space-y-4">
      {/* Physical level summary */}
      <FrostPanel>
        <SectionHeader title="Physical Support Level" />
        <DataRow label="Physical Level" value={physical_level} />
      </FrostPanel>

      {/* Physical details — incident counts */}
      {physical_details && (
        <AccordionItem title="Physical Detail Scores (Incident Counts)" defaultOpen>
          <div className="space-y-0">
            {(Object.keys(physical_details) as (keyof QSIPhysicalDetails)[]).map(
              (key) => (
                <DataRow
                  key={key}
                  label={PHYSICAL_LABELS[key]}
                  value={physical_details[key]}
                />
              )
            )}
          </div>
        </AccordionItem>
      )}

      {/* Life Change Stress */}
      {life_change_stress && (
        <FrostPanel>
          <SectionHeader title="Life Change Stress" />
          <DataRow label="Score" value={life_change_stress.score} />
          <DataRow label="Level" value={life_change_stress.level} />
          <DataRow
            label="Signs & Symptoms"
            value={life_change_stress.signs_and_symptoms ? "Yes" : "No"}
          />
          {life_change_stress.recent_changes.length > 0 && (
            <div className="py-2">
              <span className="text-[12px] text-[#5c5470]">Recent Changes</span>
              <ul className="mt-1.5 space-y-1">
                {life_change_stress.recent_changes.map((c, i) => (
                  <li
                    key={i}
                    className="text-[12px] text-[#2d1e6b] font-medium pl-2 border-l-2 border-[#4f35e0]/30"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </FrostPanel>
      )}
    </div>
  );
}
