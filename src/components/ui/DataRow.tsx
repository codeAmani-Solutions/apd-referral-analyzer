interface DataRowProps {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}

export default function DataRow({ label, value, className = "" }: DataRowProps) {
  const displayValue =
    value !== null && value !== undefined && value !== "" ? value : "—";

  return (
    <div
      className={[
        "flex justify-between items-start gap-4 py-2 border-b border-black/[0.04] last:border-0",
        className,
      ].join(" ")}
    >
      <span className="text-[12px] text-[#5c5470] shrink-0 min-w-[120px]">
        {label}
      </span>
      <span className="text-[12px] text-[#2d1e6b] font-medium text-right">
        {displayValue}
      </span>
    </div>
  );
}
