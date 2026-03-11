import { BrowserRouter, Routes, Route } from "react-router-dom";

function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-deep">
      <h1 className="text-h2 font-semibold text-text-primary">{name}</h1>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Placeholder name="Dashboard" />} />
        <Route path="/referral/:id" element={<Placeholder name="Referral Detail" />} />
        <Route path="/upload" element={<Placeholder name="Upload" />} />
        <Route path="/history" element={<Placeholder name="History" />} />
      </Routes>
    </BrowserRouter>
  );
}
