import {
  BarChart3,
  FileText,
  Home,
  Handshake,
  Stethoscope,
  User,
  Zap,
} from "lucide-react";

export type TabId =
  | "overview"
  | "consumer"
  | "clinical"
  | "behavioral"
  | "functional"
  | "placement"
  | "documents";

interface Tab {
  id: TabId;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "consumer", label: "Consumer", icon: User },
  { id: "clinical", label: "Clinical", icon: Stethoscope },
  { id: "behavioral", label: "Behavioral", icon: Zap },
  { id: "functional", label: "Functional", icon: BarChart3 },
  { id: "placement", label: "Placement", icon: Handshake },
  { id: "documents", label: "Documents", icon: FileText },
];

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav
      className="flex gap-1 px-4 py-2 overflow-x-auto border-b border-black/[0.06] bg-white/50 backdrop-blur-[12px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Referral detail sections"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = id === activeTab;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all duration-150",
              isActive
                ? "bg-[#4f35e0] text-white shadow-sm"
                : "text-[#5c5470] hover:bg-black/[0.05] hover:text-[#2d1e6b]",
            ].join(" ")}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
