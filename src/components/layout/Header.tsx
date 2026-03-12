import { Shield } from "lucide-react";

interface HeaderProps {
  providerName?: string;
}

export default function Header({ providerName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 px-5 py-3 bg-white/70 backdrop-blur-[20px] border-b border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Brand badge */}
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4f35e0] shrink-0">
        <span className="text-white font-bold text-[13px] tracking-tight leading-none">
          RA
        </span>
      </div>

      {/* Title */}
      <div className="flex flex-col min-w-0">
        <span
          className="font-bold text-[15px] leading-tight tracking-tight"
          style={{
            background: "linear-gradient(90deg, #4f35e0, #7c3aed)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          APD Referral Analyzer
        </span>
        {providerName && (
          <span className="text-[11px] text-[#5c5470] truncate leading-tight">
            {providerName}
          </span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0d9264]/10 border border-[#0d9264]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0d9264] animate-[pulse-soft_2s_ease-in-out_infinite]" />
          <Shield className="w-3 h-3 text-[#0d9264]" />
          <span className="text-[10px] font-medium text-[#0d9264]">Connected</span>
        </div>
      </div>
    </header>
  );
}
