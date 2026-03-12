import { Navigate, Outlet } from "react-router-dom";
import { useSupabase } from "@/hooks/useSupabase";

/**
 * Wraps protected routes. Reads session from useSupabase (which already
 * manages the onAuthStateChange subscription) to avoid duplicating it.
 *
 * Usage in App.tsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/" element={<Dashboard />} />
 *     ...
 *   </Route>
 */
export default function ProtectedRoute() {
  const { session, loading } = useSupabase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f2ff]">
        <div className="w-8 h-8 rounded-full border-4 border-[#4f35e0]/30 border-t-[#4f35e0] animate-spin" />
      </div>
    );
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />;
}
