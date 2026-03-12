export default function MeshBackground() {
  return (
    <div
      className="fixed inset-0 -z-20 bg-[length:400%_400%] animate-[mesh-shift_20s_ease_infinite]"
      style={{
        background:
          "linear-gradient(135deg, #f8f6f1 0%, #ede8f5 20%, #f3f0e8 40%, #f0ecf9 60%, #faf9f5 80%, #f8f6f1 100%)",
      }}
      aria-hidden="true"
    />
  );
}
