import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import DataRow from "../DataRow";

describe("DataRow", () => {
  it("renders label and value", () => {
    render(<DataRow label="Age" value="42" />);
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders numeric value", () => {
    render(<DataRow label="Score" value={95} />);
    expect(screen.getByText("95")).toBeInTheDocument();
  });

  it("shows '—' for null value", () => {
    render(<DataRow label="Diagnosis" value={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows '—' for undefined value", () => {
    render(<DataRow label="Notes" value={undefined} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows '—' for empty string value", () => {
    render(<DataRow label="Provider" value="" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows '0' for zero (falsy but valid number)", () => {
    render(<DataRow label="Count" value={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryByText("—")).not.toBeInTheDocument();
  });
});
