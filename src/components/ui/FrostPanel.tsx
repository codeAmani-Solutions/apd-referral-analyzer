interface FrostPanelProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function FrostPanel({
  children,
  className = "",
  hover = false,
}: FrostPanelProps) {
  return (
    <div
      className={[
        "bg-white/55 border border-black/[0.06] rounded-2xl backdrop-blur-[24px]",
        "shadow-[0_2px_16px_rgba(0,0,0,0.06)]",
        hover &&
          "transition-shadow duration-200 hover:shadow-[0_4px_24px_rgba(79,53,224,0.12)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
