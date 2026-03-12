interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  className = "",
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const color =
    pct >= 75
      ? "#dc2626"
      : pct >= 50
        ? "#d97706"
        : pct >= 25
          ? "#4f35e0"
          : "#0d9264";

  return (
    <div className={["w-full", className].join(" ")}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-[11px] text-[#5c5470]">{label}</span>
          <span className="text-[11px] font-semibold text-[#2d1e6b]">
            {value}/{max}
          </span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-black/[0.07] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
