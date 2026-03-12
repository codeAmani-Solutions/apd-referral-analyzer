interface StatBlockProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export default function StatBlock({
  label,
  value,
  icon,
  className = "",
}: StatBlockProps) {
  return (
    <div
      className={[
        "flex flex-col gap-1 p-4 bg-white/40 rounded-xl border border-black/[0.05]",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-1.5 text-[#5c5470]">
        {icon && <span className="w-3.5 h-3.5">{icon}</span>}
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <span className="text-[22px] font-bold text-[#2d1e6b] leading-tight">
        {value}
      </span>
    </div>
  );
}
