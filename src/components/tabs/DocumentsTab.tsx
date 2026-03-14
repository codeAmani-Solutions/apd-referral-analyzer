import type { ReferralDetail, DocumentType, DocumentStatus } from "@/lib/types";
import FrostPanel from "@/components/ui/FrostPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import AlertBox from "@/components/ui/AlertBox";

interface Props {
  detail: ReferralDetail;
}

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  lrc_base: "LRC Base",
  qsi: "QSI Assessment",
  support_plan: "Support Plan",
  other: "Other",
};

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
  },
  processing: {
    label: "Processing",
    className: "bg-indigo-100 text-indigo-700",
  },
  complete: {
    label: "Complete",
    className: "bg-emerald-100 text-emerald-700",
  },
  error: {
    label: "Error",
    className: "bg-red-100 text-red-700",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DocumentsTab({ detail }: Props) {
  const { documents } = detail;

  if (documents.length === 0) {
    return (
      <AlertBox variant="warning" title="No Documents">
        No documents have been uploaded for this referral yet.
      </AlertBox>
    );
  }

  return (
    <div className="space-y-3">
      <FrostPanel>
        <SectionHeader title={`Documents (${documents.length})`} />
      </FrostPanel>

      {documents.map((doc) => {
        const statusCfg = STATUS_CONFIG[doc.status];
        return (
          <FrostPanel key={doc.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#2d1e6b] truncate">
                  {doc.name}
                </p>
                <p className="text-[11px] text-[#5c5470] mt-0.5">
                  {DOC_TYPE_LABELS[doc.type]}
                  {doc.doc_subtype && (
                    <span className="ml-1.5 text-[#4f35e0]">
                      · {doc.doc_subtype}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-[#5c5470] mt-0.5">
                  Uploaded {formatDate(doc.upload_date)}
                </p>
              </div>
              <span
                className={`shrink-0 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${statusCfg.className}`}
              >
                {statusCfg.label}
              </span>
            </div>
          </FrostPanel>
        );
      })}
    </div>
  );
}
