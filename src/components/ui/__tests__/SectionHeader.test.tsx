import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SectionHeader from "../SectionHeader";

describe("SectionHeader", () => {
  it("renders title text", () => {
    render(<SectionHeader title="Clinical Summary" />);
    expect(screen.getByText("Clinical Summary")).toBeInTheDocument();
  });

  it("renders as an h3 element", () => {
    render(<SectionHeader title="Overview" />);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<SectionHeader title="Documents" icon={<span data-testid="icon">📄</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders without icon when omitted", () => {
    render(<SectionHeader title="No Icon" />);
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
  });
});
