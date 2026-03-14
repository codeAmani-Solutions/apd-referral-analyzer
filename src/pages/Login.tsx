import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@/hooks/useAuth";
import FrostPanel from "@/components/ui/FrostPanel";
import AlertBox from "@/components/ui/AlertBox";

export default function Login() {
  const { session } = useSupabase();
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f2ff] px-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Logo / Wordmark */}
        <div className="text-center">
          <h1 className="text-[26px] font-bold text-[#2d1e6b]">APD Referral AI</h1>
          <p className="text-[13px] text-[#5c5470] mt-1">Sign in to your account</p>
        </div>

        <FrostPanel>
          {error && (
            <AlertBox variant="error" className="mb-4">
              {error}
            </AlertBox>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-[12px] font-medium text-[#2d1e6b] mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full text-[13px] px-3 py-3 sm:py-2 rounded-lg border border-black/10 bg-white/60 text-[#2d1e6b] placeholder-[#9990b8] focus:outline-none focus:ring-2 focus:ring-[#4f35e0]/40 disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[12px] font-medium text-[#2d1e6b] mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full text-[13px] px-3 py-3 sm:py-2 rounded-lg border border-black/10 bg-white/60 text-[#2d1e6b] placeholder-[#9990b8] focus:outline-none focus:ring-2 focus:ring-[#4f35e0]/40 disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-[13px] font-semibold text-white bg-[#4f35e0] py-3 sm:py-2.5 rounded-full hover:bg-[#3d28b0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </FrostPanel>

        <p className="text-center text-[12px] text-[#5c5470]">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-[#4f35e0] font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
