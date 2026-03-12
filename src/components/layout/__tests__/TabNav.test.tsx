import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TabNav from "../TabNav";

const ALL_TABS = [
  "overview",
  "consumer",
  "clinical",
  "behavioral",
  "functional",
  "placement",
  "documents",
] as const;

describe("TabNav", () => {
  it("renders all 7 tab buttons", () => {
    render(<TabNav activeTab="overview" onTabChange={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(7);
  });

  it("marks the active tab with aria-current='page'", () => {
    render(<TabNav activeTab="clinical" onTabChange={vi.fn()} />);
    const activeBtn = screen.getByRole("button", { name: /clinical/i });
    expect(activeBtn).toHaveAttribute("aria-current", "page");
  });

  it("other tabs do not have aria-current", () => {
    render(<TabNav activeTab="overview" onTabChange={vi.fn()} />);
    const clinicalBtn = screen.getByRole("button", { name: /clinical/i });
    expect(clinicalBtn).not.toHaveAttribute("aria-current");
  });

  it("calls onTabChange with correct tab id when a tab is clicked", () => {
    const onTabChange = vi.fn();
    render(<TabNav activeTab="overview" onTabChange={onTabChange} />);
    fireEvent.click(screen.getByRole("button", { name: /documents/i }));
    expect(onTabChange).toHaveBeenCalledWith("documents");
  });

  it("calls onTabChange once per click", () => {
    const onTabChange = vi.fn();
    render(<TabNav activeTab="overview" onTabChange={onTabChange} />);
    fireEvent.click(screen.getByRole("button", { name: /placement/i }));
    expect(onTabChange).toHaveBeenCalledTimes(1);
  });

  it.each(ALL_TABS)("renders '%s' tab", (tab) => {
    render(<TabNav activeTab="overview" onTabChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: new RegExp(tab, "i") })).toBeInTheDocument();
  });
});
