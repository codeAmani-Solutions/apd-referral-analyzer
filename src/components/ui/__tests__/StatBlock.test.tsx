import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatBlock from "../StatBlock";

describe("StatBlock", () => {
  it("renders label text", () => {
    render(<StatBlock label="Total Score" value={85} />);
    expect(screen.getByText("Total Score")).toBeInTheDocument();
  });

  it("renders numeric value", () => {
    render(<StatBlock label="Total Score" value={85} />);
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("renders string value", () => {
    render(<StatBlock label="Level" value="Moderate" />);
    expect(screen.getByText("Moderate")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(
      <StatBlock label="Score" value={70} icon={<span data-testid="stat-icon">★</span>} />
    );
    expect(screen.getByTestId("stat-icon")).toBeInTheDocument();
  });

  it("renders without icon when omitted", () => {
    render(<StatBlock label="Score" value={70} />);
    expect(screen.queryByTestId("stat-icon")).not.toBeInTheDocument();
  });
});
