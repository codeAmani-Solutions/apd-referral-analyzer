import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className = "",
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={[
        "border border-black/[0.06] rounded-xl overflow-hidden",
        className,
      ].join(" ")}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/40 hover:bg-white/60 transition-colors duration-150 text-left"
      >
        <span className="text-[13px] font-semibold text-[#2d1e6b]">{title}</span>
        <ChevronDown
          className={[
            "w-4 h-4 text-[#5c5470] transition-transform duration-200 shrink-0",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>
      {open && (
        <div className="px-4 py-3 bg-white/20 border-t border-black/[0.04]">
          {children}
        </div>
      )}
    </div>
  );
}
