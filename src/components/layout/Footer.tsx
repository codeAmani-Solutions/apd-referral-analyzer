export default function Footer() {
  return (
    <footer className="mt-auto py-4 px-3 sm:px-5 text-center border-t border-black/[0.05] pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
      <p className="text-[12px] sm:text-[11px] text-[#8a8198]">
        APD Referral Analyzer &mdash; codeAmani Solutions &copy;{" "}
        {new Date().getFullYear()}
      </p>
    </footer>
  );
}
