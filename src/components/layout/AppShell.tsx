import AuraOrbs from "./AuraOrbs";
import Footer from "./Footer";
import Header from "./Header";
import MeshBackground from "./MeshBackground";

interface AppShellProps {
  children: React.ReactNode;
  providerName?: string;
}

export default function AppShell({ children, providerName }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-svh">
      <MeshBackground />
      <AuraOrbs />
      <Header providerName={providerName} />
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-[env(safe-area-inset-bottom,0px)]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
