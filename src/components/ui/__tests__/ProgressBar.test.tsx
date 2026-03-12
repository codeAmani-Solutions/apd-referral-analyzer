import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProgressBar from "../ProgressBar";

describe("ProgressBar", () => {
  it("has role='progressbar'", () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("sets aria-valuenow to value", () => {
    render(<ProgressBar value={42} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "42");
  });

  it("sets aria-valuemin to 0", () => {
    render(<ProgressBar value={10} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemin", "0");
  });

  it("sets aria-valuemax to max prop (default 100)", () => {
    render(<ProgressBar value={10} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "100");
  });

  it("sets aria-valuemax to custom max", () => {
    render(<ProgressBar value={3} max={10} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "10");
  });

  it("renders label when provided", () => {
    render(<ProgressBar value={60} label="QSI Score" />);
    expect(screen.getByText("QSI Score")).toBeInTheDocument();
  });

  it("uses green color for value below 25%", () => {
    const { container } = render(<ProgressBar value={20} />);
    const bar = container.querySelector("[role='progressbar']") as HTMLElement;
    expect(bar.style.backgroundColor).toBe("rgb(13, 146, 100)");
  });

  it("uses purple color at 25%", () => {
    const { container } = render(<ProgressBar value={25} />);
    const bar = container.querySelector("[role='progressbar']") as HTMLElement;
    expect(bar.style.backgroundColor).toBe("rgb(79, 53, 224)");
  });

  it("uses amber color at 50%", () => {
    const { container } = render(<ProgressBar value={50} />);
    const bar = container.querySelector("[role='progressbar']") as HTMLElement;
    expect(bar.style.backgroundColor).toBe("rgb(217, 119, 6)");
  });

  it("uses red color at 75%", () => {
    const { container } = render(<ProgressBar value={75} />);
    const bar = container.querySelector("[role='progressbar']") as HTMLElement;
    expect(bar.style.backgroundColor).toBe("rgb(220, 38, 38)");
  });
});
