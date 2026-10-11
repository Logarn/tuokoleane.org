import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Heart } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { KindnessPackage } from "./data";
import MobileCatalogue from "./MobileCatalogue";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

function makeItem(index: number): KindnessPackage {
  return {
    id: `item-${index}`,
    title: `Kindness item ${index}`,
    shortDescription: `A practical way to help number ${index}.`,
    description: `Full description for item ${index}.`,
    category: "Community",
    program: "TI Family Experience",
    kind: "fixed",
    price: index * 500,
    duration: "About 10 min",
    label: "Practical help",
    icon: Heart,
    includes: ["One contribution"],
    images: [{ src: `/item-${index}.jpg`, alt: `Item ${index}` }],
    suitableFor: "Anyone",
    coordination: "Coordinated by TI",
    goodToKnow: ["TI confirms the details"],
  };
}

describe("MobileCatalogue", () => {
  it("renders one three-row catalogue rail without compact-card descriptions", () => {
    const { container } = render(<MobileCatalogue items={Array.from({ length: 7 }, (_, index) => makeItem(index + 1))} onNavigate={vi.fn()} />);
    const rail = screen.getByRole("list", { name: "Swipe through kindness listings" });

    expect(within(rail).getAllByRole("listitem")).toHaveLength(7);
    expect(container.querySelector(".mobile-catalogue-page")).not.toBeInTheDocument();
    expect(screen.queryByText("A practical way to help number 1.")).not.toBeInTheDocument();
  });

  it("moves two columns at a time and disables controls at the boundaries", async () => {
    const user = userEvent.setup();
    render(<MobileCatalogue items={Array.from({ length: 13 }, (_, index) => makeItem(index + 1))} onNavigate={vi.fn()} />);

    const previous = screen.getByRole("button", { name: "Previous listings" });
    const next = screen.getByRole("button", { name: "Next listings" });

    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();
    expect(screen.getByText("Showing listings 1 to 6 of 13.")).toBeInTheDocument();

    await user.click(next);
    expect(previous).toBeEnabled();
    expect(screen.getByText("Showing listings 7 to 12 of 13.")).toBeInTheDocument();

    await user.click(next);
    expect(next).toBeDisabled();
    expect(screen.getByText("Showing listings 10 to 13 of 13.")).toBeInTheDocument();

    await user.click(previous);
    expect(screen.getByText("Showing listings 4 to 9 of 13.")).toBeInTheDocument();
  });

  it("resets to the first columns when the item set changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<MobileCatalogue items={Array.from({ length: 13 }, (_, index) => makeItem(index + 1))} onNavigate={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Next listings" }));
    expect(screen.getByText("Showing listings 7 to 12 of 13.")).toBeInTheDocument();

    rerender(<MobileCatalogue items={[makeItem(4), makeItem(5)]} onNavigate={vi.fn()} />);

    expect(screen.getByText("Showing listings 1 to 2 of 2.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous listings" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next listings" })).toBeDisabled();
  });

  it("provides labelled controls, rail announcements and navigable listing links", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<MobileCatalogue items={Array.from({ length: 10 }, (_, index) => makeItem(index + 1))} onNavigate={onNavigate} />);

    expect(screen.getByRole("region", { name: "Kindness listings" })).toHaveAttribute("aria-roledescription", "carousel");
    expect(screen.getByText("Showing listings 1 to 6 of 10.")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("button", { name: "Previous listings" })).toHaveAttribute("aria-controls");
    expect(screen.getByRole("button", { name: "Next listings" })).toHaveAttribute("aria-controls");

    const viewport = screen.getByRole("list", { name: "Swipe through kindness listings" });
    viewport.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Showing listings 7 to 10 of 10.")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "View Kindness item 1, Ksh 500" }));
    expect(onNavigate).toHaveBeenCalledWith("/listing/item-1");
  });

  it("persists a listing favourite and keeps it separate from card navigation", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const { unmount } = render(<MobileCatalogue items={[makeItem(1)]} onNavigate={onNavigate} />);

    await user.click(screen.getByRole("button", { name: "Add Kindness item 1 to favourites" }));
    expect(screen.getByRole("button", { name: "Remove Kindness item 1 from favourites" })).toHaveAttribute("aria-pressed", "true");
    expect(onNavigate).not.toHaveBeenCalled();

    unmount();
    render(<MobileCatalogue items={[makeItem(1)]} onNavigate={onNavigate} />);
    expect(screen.getByRole("button", { name: "Remove Kindness item 1 from favourites" })).toBeInTheDocument();
  });
});
