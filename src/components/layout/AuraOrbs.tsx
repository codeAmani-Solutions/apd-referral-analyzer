export default function AuraOrbs() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Violet — top-left */}
      <div
        className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full opacity-[0.14] animate-[orb-float_15s_ease-in-out_infinite]"
        style={{
          background: "radial-gradient(circle at 40% 40%, #7c3aed, transparent 68%)",
        }}
      />
      {/* Rose — bottom-right */}
      <div
        className="absolute -bottom-48 -right-24 w-[520px] h-[520px] rounded-full opacity-[0.11] animate-[orb-float_18s_ease-in-out_infinite_3s]"
        style={{
          background: "radial-gradient(circle at 60% 60%, #e11d6a, transparent 68%)",
        }}
      />
      {/* Indigo — center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full opacity-[0.07] animate-[orb-float_22s_ease-in-out_infinite_6s]"
        style={{
          background: "radial-gradient(circle at 50% 50%, #4f35e0, transparent 68%)",
        }}
      />
    </div>
  );
}
