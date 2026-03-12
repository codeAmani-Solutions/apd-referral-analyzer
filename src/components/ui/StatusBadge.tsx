import type { ReferralStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  ReferralStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  in_review: {
    label: "In Review",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  eligible: {
    label: "Eligible",
    bg: "bg-[#0d9264]/10",
    text: "text-[#0d9264]",
    border: "border-[#0d9264]/20",
  },
  ineligible: {
    label: "Ineligible",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  placed: {
    label: "Placed",
    bg: "bg-[#7c3aed]/10",
    text: "text-[#7c3aed]",
    border: "border-[#7c3aed]/20",
  },
};

interface StatusBadgeProps {
  status: ReferralStatus;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { label, bg, text, border } = STATUS_CONFIG[status];
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
        bg,
        text,
        border,
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
