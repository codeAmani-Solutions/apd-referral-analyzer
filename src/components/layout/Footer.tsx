export default function Footer() {
  return (
    <footer className="mt-auto py-4 px-5 text-center border-t border-black/[0.05]">
      <p className="text-[11px] text-[#8a8198]">
        APD Referral Analyzer &mdash; codeAmani Solutions &copy;{" "}
        {new Date().getFullYear()}
      </p>
    </footer>
  );
}
