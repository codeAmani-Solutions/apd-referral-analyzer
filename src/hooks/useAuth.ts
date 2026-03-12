import { useCallback } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Ensures a providers row exists for the authenticated user.
 * On first login, creates the row. On subsequent logins, no-ops.
 */
async function fetchOrCreateProvider(userId: string, name?: string): Promise<void> {
  const { data: existing } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return;

  await supabase
    .from("providers")
    .insert({ user_id: userId, name: name ?? "New Provider" });
}

/**
 * Provides auth action functions (signIn, signUp, signOut).
 * Session state lives in useSupabase — this hook exposes actions only
 * to avoid duplicating onAuthStateChange subscriptions.
 */
export function useAuth() {
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      await fetchOrCreateProvider(data.session.user.id);
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, providerName: string): Promise<void> => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // Session may be null if email confirmation is required
      if (data.session) {
        await fetchOrCreateProvider(data.session.user.id, providerName);
      }
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
  }, []);

  return { signIn, signUp, signOut };
}
