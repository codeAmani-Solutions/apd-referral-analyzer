import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import ReferralDetail from "@/pages/ReferralDetail";
import Upload from "@/pages/Upload";
import History from "@/pages/History";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/referral/:id" element={<ReferralDetail />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}
