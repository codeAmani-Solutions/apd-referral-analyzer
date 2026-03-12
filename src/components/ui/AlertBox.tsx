import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "error";

const VARIANT_CONFIG: Record<
  AlertVariant,
  { icon: React.FC<{ className?: string }>; bg: string; border: string; text: string; iconColor: string }
> = {
  info: {
    icon: Info,
    bg: "bg-blue-50/60",
    border: "border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-500",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-[#0d9264]/10",
    border: "border-[#0d9264]/25",
    text: "text-[#065f46]",
    iconColor: "text-[#0d9264]",
  },
  warning: {
    icon: TriangleAlert,
    bg: "bg-amber-50/60",
    border: "border-amber-200",
    text: "text-amber-800",
    iconColor: "text-amber-500",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-red-50/60",
    border: "border-red-200",
    text: "text-red-800",
    iconColor: "text-red-500",
  },
};

interface AlertBoxProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function AlertBox({
  variant = "info",
  title,
  children,
  className = "",
}: AlertBoxProps) {
  const { icon: Icon, bg, border, text, iconColor } = VARIANT_CONFIG[variant];

  return (
    <div
      role="alert"
      className={[
        "flex gap-3 p-4 rounded-xl border",
        bg,
        border,
        text,
        className,
      ].join(" ")}
    >
      <Icon className={["w-4 h-4 mt-0.5 shrink-0", iconColor].join(" ")} />
      <div className="text-[12px] leading-relaxed">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children}
      </div>
    </div>
  );
}
