import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const { mockUseSupabase, mockSignUp, mockNavigate } = vi.hoisted(() => ({
  mockUseSupabase: vi.fn(),
  mockSignUp: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock("@/hooks/useSupabase", () => ({
  useSupabase: mockUseSupabase,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ signUp: mockSignUp }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

import Signup from "../Signup";

function renderSignup() {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );
}

/** Fill and submit the signup form with the given values */
async function fillAndSubmit({
  providerName = "My Org",
  email = "new@test.com",
  password = "password123",
  confirmPassword = "password123",
}: {
  providerName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
} = {}) {
  fireEvent.change(screen.getByLabelText(/organization/i), {
    target: { value: providerName },
  });
  fireEvent.change(screen.getByLabelText(/^email$/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/^password$/i), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText(/confirm password/i), {
    target: { value: confirmPassword },
  });
  fireEvent.click(screen.getByRole("button", { name: /create account/i }));
}

describe("Signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSupabase.mockReturnValue({ session: null, loading: false });
    mockSignUp.mockResolvedValue(undefined);
  });

  it("renders all form fields", () => {
    renderSignup();
    expect(screen.getByLabelText(/organization/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("renders Create Account button", () => {
    renderSignup();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("renders link to /login", () => {
    renderSignup();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("redirects to / when already authenticated", () => {
    mockUseSupabase.mockReturnValue({ session: { user: { id: "u1" } }, loading: false });
    renderSignup();
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("shows error when passwords do not match", async () => {
    renderSignup();
    await fillAndSubmit({ password: "password123", confirmPassword: "different!" });
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("shows error when password is too short", async () => {
    renderSignup();
    await fillAndSubmit({ password: "short", confirmPassword: "short" });
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("calls signUp with email, password, and provider name", async () => {
    renderSignup();
    await fillAndSubmit({ providerName: "Sunshine Homes", email: "new@test.com", password: "secure123", confirmPassword: "secure123" });

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith("new@test.com", "secure123", "Sunshine Homes");
    });
  });

  it("shows check-email state after successful signup (email confirmation flow)", async () => {
    // session remains null — email confirmation required
    renderSignup();
    await fillAndSubmit({ email: "pending@test.com" });

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/pending@test\.com/)).toBeInTheDocument();
  });

  it("shows error when signUp throws", async () => {
    mockSignUp.mockRejectedValue(new Error("Email already registered"));
    renderSignup();
    await fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText("Email already registered")).toBeInTheDocument();
    });
  });

  it("shows fallback error when signUp throws non-Error", async () => {
    mockSignUp.mockRejectedValue("unexpected");
    renderSignup();
    await fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
  });

  it("disables button while loading", async () => {
    mockSignUp.mockReturnValue(new Promise(() => {}));
    renderSignup();
    await fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();
    });
  });
});
