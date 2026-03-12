import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const { mockUseSupabase, mockSignIn, mockNavigate } = vi.hoisted(() => ({
  mockUseSupabase: vi.fn(),
  mockSignIn: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock("@/hooks/useSupabase", () => ({
  useSupabase: mockUseSupabase,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ signIn: mockSignIn }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

import Login from "../Login";

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: not authenticated, not loading
    mockUseSupabase.mockReturnValue({ session: null, loading: false });
    mockSignIn.mockResolvedValue(undefined);
  });

  it("renders email and password fields", () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders Sign In button", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders link to /signup", () => {
    renderLogin();
    expect(screen.getByRole("link", { name: /create one/i })).toBeInTheDocument();
  });

  it("redirects to / when already authenticated", () => {
    mockUseSupabase.mockReturnValue({ session: { user: { id: "u1" } }, loading: false });
    renderLogin();
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("does not redirect when session is null", () => {
    renderLogin();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("calls signIn with email and password on submit", async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("user@test.com", "password123");
    });
  });

  it("navigates to / on successful sign in", async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("shows error message when signIn throws", async () => {
    mockSignIn.mockRejectedValue(new Error("Invalid credentials"));
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "bad@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("shows fallback error when signIn throws non-Error", async () => {
    mockSignIn.mockRejectedValue("unexpected");
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "bad@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
  });

  it("disables the button while loading", async () => {
    // Never resolve so the button stays disabled
    mockSignIn.mockReturnValue(new Promise(() => {}));
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
    });
  });
});
