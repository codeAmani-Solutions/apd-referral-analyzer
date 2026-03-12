interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  icon,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={["flex items-center gap-2 mb-3", className].join(" ")}
    >
      {icon && (
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#4f35e0]/10 text-[#4f35e0]">
          {icon}
        </span>
      )}
      <h3 className="text-[13px] font-semibold text-[#2d1e6b] uppercase tracking-wide">
        {title}
      </h3>
      <div className="flex-1 h-px bg-black/[0.06]" />
    </div>
  );
}
