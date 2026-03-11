import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// vi.hoisted runs in the hoisted scope so mocks are available inside vi.mock factory
const { mockGetSession, mockOnAuthStateChange } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: vi.fn(),
    storage: {},
  },
}));

import { useSupabase } from "@/hooks/useSupabase";

describe("useSupabase", () => {
  const mockUnsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: no active session
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  it("returns supabase client, session, and loading state", () => {
    const { result } = renderHook(() => useSupabase());

    expect(result.current.supabase).toBeDefined();
    expect(result.current.loading).toBe(true);
    expect(result.current.session).toBeNull();
  });

  it("resolves loading to false after getSession completes", async () => {
    const { result } = renderHook(() => useSupabase());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session).toBeNull();
  });

  it("sets session when getSession returns an active session", async () => {
    const fakeSession = { user: { id: "user-1" }, access_token: "tok" };
    mockGetSession.mockResolvedValue({
      data: { session: fakeSession },
    });

    const { result } = renderHook(() => useSupabase());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session).toEqual(fakeSession);
  });

  it("subscribes to auth state changes on mount", () => {
    renderHook(() => useSupabase());
    expect(mockOnAuthStateChange).toHaveBeenCalledOnce();
  });

  it("updates session when auth state changes", async () => {
    // Capture the callback passed to onAuthStateChange
    let authCallback: (event: string, session: unknown) => void = () => {};
    mockOnAuthStateChange.mockImplementation((cb) => {
      authCallback = cb;
      return {
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      };
    });

    const { result } = renderHook(() => useSupabase());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate a sign-in event
    const newSession = { user: { id: "user-2" }, access_token: "new-tok" };
    authCallback("SIGNED_IN", newSession);

    await waitFor(() => {
      expect(result.current.session).toEqual(newSession);
    });
  });

  it("unsubscribes from auth changes on unmount", () => {
    const { unmount } = renderHook(() => useSupabase());
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });
});
