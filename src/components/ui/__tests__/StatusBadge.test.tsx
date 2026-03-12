import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatusBadge from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders 'Pending' for pending status", () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders 'In Review' for in_review status", () => {
    render(<StatusBadge status="in_review" />);
    expect(screen.getByText("In Review")).toBeInTheDocument();
  });

  it("renders 'Eligible' for eligible status", () => {
    render(<StatusBadge status="eligible" />);
    expect(screen.getByText("Eligible")).toBeInTheDocument();
  });

  it("renders 'Ineligible' for ineligible status", () => {
    render(<StatusBadge status="ineligible" />);
    expect(screen.getByText("Ineligible")).toBeInTheDocument();
  });

  it("renders 'Placed' for placed status", () => {
    render(<StatusBadge status="placed" />);
    expect(screen.getByText("Placed")).toBeInTheDocument();
  });

  it("applies additional className", () => {
    const { container } = render(<StatusBadge status="pending" className="shrink-0" />);
    expect(container.firstChild).toHaveClass("shrink-0");
  });
});
