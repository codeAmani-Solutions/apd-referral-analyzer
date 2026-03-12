import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { mockSignIn, mockSignUp, mockSignOut, mockFrom } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignIn,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
    from: mockFrom,
  },
}));

import { useAuth } from "@/hooks/useAuth";

/** Helpers to build a realistic Supabase query builder mock */
function makeSelectBuilder(data: unknown, error: unknown = null) {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  return builder;
}

function makeInsertBuilder(error: unknown = null) {
  return {
    insert: vi.fn().mockResolvedValue({ data: null, error }),
  };
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signIn", () => {
    it("calls signInWithPassword with credentials", async () => {
      const fakeSession = { user: { id: "user-1" }, access_token: "tok" };
      mockSignIn.mockResolvedValue({ data: { session: fakeSession }, error: null });

      const selectBuilder = makeSelectBuilder({ id: "prov-1" });
      mockFrom.mockReturnValue(selectBuilder);

      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signIn("user@test.com", "password123");
      });

      expect(mockSignIn).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "password123",
      });
    });

    it("throws when Supabase returns an error", async () => {
      const authError = new Error("Invalid credentials");
      mockSignIn.mockResolvedValue({ data: { session: null }, error: authError });

      const { result } = renderHook(() => useAuth());
      await expect(
        act(async () => {
          await result.current.signIn("bad@test.com", "wrong");
        })
      ).rejects.toThrow("Invalid credentials");
    });

    it("calls fetchOrCreateProvider when session is returned", async () => {
      const fakeSession = { user: { id: "user-1" } };
      mockSignIn.mockResolvedValue({ data: { session: fakeSession }, error: null });

      const selectBuilder = makeSelectBuilder({ id: "prov-1" });
      mockFrom.mockReturnValue(selectBuilder);

      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signIn("user@test.com", "pass");
      });

      expect(mockFrom).toHaveBeenCalledWith("providers");
    });

    it("creates provider row when none exists", async () => {
      const fakeSession = { user: { id: "new-user" } };
      mockSignIn.mockResolvedValue({ data: { session: fakeSession }, error: null });

      // First call is select (no existing row), second call is insert
      const insertBuilder = makeInsertBuilder();
      const selectBuilder = makeSelectBuilder(null); // no existing provider
      mockFrom
        .mockReturnValueOnce(selectBuilder) // for the select query
        .mockReturnValueOnce(insertBuilder); // for the insert

      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signIn("new@test.com", "pass");
      });

      expect(insertBuilder.insert).toHaveBeenCalledWith({
        user_id: "new-user",
        name: "New Provider",
      });
    });

    it("does not insert if provider row already exists", async () => {
      const fakeSession = { user: { id: "existing-user" } };
      mockSignIn.mockResolvedValue({ data: { session: fakeSession }, error: null });

      const selectBuilder = makeSelectBuilder({ id: "prov-existing" }); // existing row
      mockFrom.mockReturnValue(selectBuilder);

      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signIn("existing@test.com", "pass");
      });

      // insert should NOT have been called since row exists
      expect(mockFrom).toHaveBeenCalledTimes(1);
    });

    it("skips fetchOrCreateProvider when session is null", async () => {
      mockSignIn.mockResolvedValue({ data: { session: null }, error: null });

      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signIn("user@test.com", "pass");
      });

      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe("signUp", () => {
    it("calls supabase.auth.signUp with email and password", async () => {
      mockSignUp.mockResolvedValue({ data: { session: null }, error: null });

      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signUp("new@test.com", "password123", "My Org");
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: "new@test.com",
        password: "password123",
      });
    });

    it("throws when signUp returns an error", async () => {
      const authError = new Error("Email already registered");
      mockSignUp.mockResolvedValue({ data: { session: null }, error: authError });

      const { result } = renderHook(() => useAuth());
      await expect(
        act(async () => {
          await result.current.signUp("dup@test.com", "pass", "Org");
        })
      ).rejects.toThrow("Email already registered");
    });

    it("creates provider with given name when session returned immediately", async () => {
      const fakeSession = { user: { id: "instant-user" } };
      mockSignUp.mockResolvedValue({ data: { session: fakeSession }, error: null });

      const insertBuilder = makeInsertBuilder();
      const selectBuilder = makeSelectBuilder(null); // no existing row
      mockFrom
        .mockReturnValueOnce(selectBuilder)
        .mockReturnValueOnce(insertBuilder);

      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signUp("new@test.com", "pass", "Sunshine Group Homes");
      });

      expect(insertBuilder.insert).toHaveBeenCalledWith({
        user_id: "instant-user",
        name: "Sunshine Group Homes",
      });
    });

    it("skips provider creation when session is null (email confirmation pending)", async () => {
      mockSignUp.mockResolvedValue({ data: { session: null }, error: null });

      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signUp("pending@test.com", "pass", "Org");
      });

      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe("signOut", () => {
    it("calls supabase.auth.signOut", async () => {
      mockSignOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalledOnce();
    });
  });

  describe("hook interface", () => {
    it("returns signIn, signUp, signOut functions", () => {
      mockSignIn.mockResolvedValue({ data: { session: null }, error: null });
      const { result } = renderHook(() => useAuth());
      expect(typeof result.current.signIn).toBe("function");
      expect(typeof result.current.signUp).toBe("function");
      expect(typeof result.current.signOut).toBe("function");
    });
  });
});
