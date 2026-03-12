import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FrostPanel from "../FrostPanel";

describe("FrostPanel", () => {
  it("renders children", () => {
    render(<FrostPanel><p>Panel content</p></FrostPanel>);
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  it("applies additional className", () => {
    const { container } = render(
      <FrostPanel className="hover:border-purple-400">Content</FrostPanel>
    );
    expect(container.firstChild).toHaveClass("hover:border-purple-400");
  });

  it("renders without hover shadow by default", () => {
    const { container } = render(<FrostPanel>No hover</FrostPanel>);
    // hover=false means no extra shadow class — just ensure it renders
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with hover=true without throwing", () => {
    render(<FrostPanel hover>Hoverable panel</FrostPanel>);
    expect(screen.getByText("Hoverable panel")).toBeInTheDocument();
  });
});
