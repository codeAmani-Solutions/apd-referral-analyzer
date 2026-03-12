import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const { mockUseSupabase } = vi.hoisted(() => ({
  mockUseSupabase: vi.fn(),
}));

vi.mock("@/hooks/useSupabase", () => ({
  useSupabase: mockUseSupabase,
}));

import ProtectedRoute from "../ProtectedRoute";

function renderWithRouter(initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("shows spinner while loading", () => {
    mockUseSupabase.mockReturnValue({ session: null, loading: true });
    const { container } = renderWithRouter();
    // The spinner div should be in the document
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders child route when authenticated", () => {
    mockUseSupabase.mockReturnValue({
      session: { user: { id: "user-1" } },
      loading: false,
    });
    renderWithRouter("/");
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    mockUseSupabase.mockReturnValue({ session: null, loading: false });
    renderWithRouter("/");
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("does not render protected content while loading", () => {
    mockUseSupabase.mockReturnValue({ session: null, loading: true });
    renderWithRouter("/");
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });

  it("does not redirect while still loading (avoids flicker)", () => {
    // Even with session=null, if loading=true we should NOT navigate to /login yet
    mockUseSupabase.mockReturnValue({ session: null, loading: true });
    renderWithRouter("/");
    // Login page should not appear — still loading
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });
});
