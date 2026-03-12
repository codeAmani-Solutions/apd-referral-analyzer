import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AlertBox from "../AlertBox";

describe("AlertBox", () => {
  it("renders children text", () => {
    render(<AlertBox>Something happened</AlertBox>);
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  it("has role='alert'", () => {
    render(<AlertBox>Message</AlertBox>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<AlertBox title="Upload Failed">Details here</AlertBox>);
    expect(screen.getByText("Upload Failed")).toBeInTheDocument();
  });

  it("does not render a title element when omitted", () => {
    render(<AlertBox>No title here</AlertBox>);
    // The text content comes through, but no separate title span
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("renders with info variant by default", () => {
    const { container } = render(<AlertBox>Info box</AlertBox>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders error variant without throwing", () => {
    render(<AlertBox variant="error" title="Error">Bad thing</AlertBox>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("renders success variant", () => {
    render(<AlertBox variant="success" title="Done">All good</AlertBox>);
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("renders warning variant", () => {
    render(<AlertBox variant="warning">Watch out</AlertBox>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
