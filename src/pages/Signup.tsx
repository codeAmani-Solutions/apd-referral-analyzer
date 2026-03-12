import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@/hooks/useAuth";
import FrostPanel from "@/components/ui/FrostPanel";
import AlertBox from "@/components/ui/AlertBox";

type SignupStep = "form" | "check-email";

export default function Signup() {
  const { session } = useSupabase();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [providerName, setProviderName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<SignupStep>("form");

  // Redirect if already authenticated
  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, providerName.trim());
      // If session is set, useEffect will redirect. If email confirmation is
      // required, session remains null — show the check-email state instead.
      setStep("check-email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "check-email") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f2ff] px-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <h1 className="text-[26px] font-bold text-[#2d1e6b]">APD Referral AI</h1>
          </div>
          <AlertBox variant="success" title="Check your email">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
            account, then sign in.
          </AlertBox>
          <p className="text-center text-[12px] text-[#5c5470]">
            <Link to="/login" className="text-[#4f35e0] font-semibold hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f2ff] px-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Logo / Wordmark */}
        <div className="text-center">
          <h1 className="text-[26px] font-bold text-[#2d1e6b]">APD Referral AI</h1>
          <p className="text-[13px] text-[#5c5470] mt-1">Create your provider account</p>
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
                htmlFor="provider-name"
                className="block text-[12px] font-medium text-[#2d1e6b] mb-1"
              >
                Organization / Provider Name
              </label>
              <input
                id="provider-name"
                type="text"
                autoComplete="organization"
                required
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                disabled={loading}
                className="w-full text-[13px] px-3 py-2 rounded-lg border border-black/10 bg-white/60 text-[#2d1e6b] placeholder-[#9990b8] focus:outline-none focus:ring-2 focus:ring-[#4f35e0]/40 disabled:opacity-50"
                placeholder="e.g. Sunshine Group Homes LLC"
              />
            </div>

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
                className="w-full text-[13px] px-3 py-2 rounded-lg border border-black/10 bg-white/60 text-[#2d1e6b] placeholder-[#9990b8] focus:outline-none focus:ring-2 focus:ring-[#4f35e0]/40 disabled:opacity-50"
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
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full text-[13px] px-3 py-2 rounded-lg border border-black/10 bg-white/60 text-[#2d1e6b] placeholder-[#9990b8] focus:outline-none focus:ring-2 focus:ring-[#4f35e0]/40 disabled:opacity-50"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-[12px] font-medium text-[#2d1e6b] mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full text-[13px] px-3 py-2 rounded-lg border border-black/10 bg-white/60 text-[#2d1e6b] placeholder-[#9990b8] focus:outline-none focus:ring-2 focus:ring-[#4f35e0]/40 disabled:opacity-50"
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-[13px] font-semibold text-white bg-[#4f35e0] py-2.5 rounded-full hover:bg-[#3d28b0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </FrostPanel>

        <p className="text-center text-[12px] text-[#5c5470]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#4f35e0] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
