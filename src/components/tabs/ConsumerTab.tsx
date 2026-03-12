import { ReferralDetail, ContactPerson } from "@/lib/types";
import FrostPanel from "@/components/ui/FrostPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import DataRow from "@/components/ui/DataRow";
import AlertBox from "@/components/ui/AlertBox";

interface Props {
  detail: ReferralDetail;
}

function ContactBlock({
  label,
  contact,
}: {
  label: string;
  contact: ContactPerson;
}) {
  return (
    <FrostPanel>
      <SectionHeader title={label} />
      <DataRow label="Name" value={contact.name} />
      {contact.title && <DataRow label="Title" value={contact.title} />}
      {contact.id && <DataRow label="ID" value={contact.id} />}
      {contact.region && <DataRow label="Region" value={contact.region} />}
      {contact.phone && <DataRow label="Phone" value={contact.phone} />}
      {contact.email && <DataRow label="Email" value={contact.email} />}
    </FrostPanel>
  );
}

export default function ConsumerTab({ detail }: Props) {
  const { consumer } = detail;

  if (!consumer) {
    return (
      <AlertBox variant="warning" title="No Consumer Data">
        Consumer demographics have not been extracted yet. Upload the referral
        packet to populate this view.
      </AlertBox>
    );
  }

  const { legal_status } = consumer;

  return (
    <div className="space-y-4">
      {/* Demographics */}
      <FrostPanel>
        <SectionHeader title="Demographics" />
        <DataRow label="Name" value={`${consumer.first_name} ${consumer.last_name}`} />
        <DataRow label="Date of Birth" value={consumer.dob} />
        <DataRow label="Age" value={consumer.age} />
        <DataRow label="Gender" value={consumer.gender} />
        <DataRow label="Medicaid #" value={consumer.medicaid_number} />
        <DataRow label="Region" value={consumer.region} />
      </FrostPanel>

      {/* Contact & Residence */}
      <FrostPanel>
        <SectionHeader title="Contact & Residence" />
        <DataRow label="Phone" value={consumer.phone} />
        <DataRow label="Address" value={consumer.address} />
        <DataRow label="Current Residence" value={consumer.current_residence} />
      </FrostPanel>

      {/* Legal Status */}
      {legal_status && (
        <FrostPanel>
          <SectionHeader title="Legal Status" />
          <DataRow label="Type" value={legal_status.type} />
          {legal_status.guardianship_types.length > 0 && (
            <div className="py-2 border-b border-black/[0.04]">
              <span className="text-[12px] text-[#5c5470]">Guardianship Types</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {legal_status.guardianship_types.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#4f35e0]/10 text-[#4f35e0] font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {legal_status.guardian && (
            <>
              <DataRow label="Guardian" value={legal_status.guardian.name} />
              <DataRow label="Guardian Phone" value={legal_status.guardian.phone} />
              <DataRow label="Guardian Address" value={legal_status.guardian.address} />
            </>
          )}
        </FrostPanel>
      )}

      {/* Coordinators */}
      {consumer.support_coordinator && (
        <ContactBlock label="Support Coordinator" contact={consumer.support_coordinator} />
      )}
      {consumer.referral_coordinator && (
        <ContactBlock label="Referral Coordinator" contact={consumer.referral_coordinator} />
      )}
    </div>
  );
}
