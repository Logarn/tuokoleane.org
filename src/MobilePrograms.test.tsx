import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Program } from "./data";
import MobilePrograms from "./MobilePrograms";

afterEach(cleanup);

function makeProgram(index: number): Program {
  return {
    id: `program-${index}`,
    number: String(index).padStart(2, "0"),
    name: `Program ${index}`,
    kicker: "Community connection",
    summary: `A practical program number ${index}.`,
    overview: "A clear program overview.",
    image: `/program-${index}.jpg`,
    imageAlt: `Program ${index}`,
    imageSource: "representative",
    accent: "#293278",
    activities: ["One activity"],
    intendedOutcomes: ["One intended outcome"],
    measurements: ["One measurement"],
    relatedPackageIds: [],
  };
}

describe("MobilePrograms", () => {
  it("supports buttons, keyboard navigation and direct program links", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<MobilePrograms programs={[makeProgram(1), makeProgram(2), makeProgram(3)]} onNavigate={onNavigate} />);

    expect(screen.getByRole("region", { name: "Tuokoleane programs and events" })).toHaveAttribute("aria-roledescription", "carousel");
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous program" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next program" }));
    expect(screen.getByText("2 of 3")).toBeInTheDocument();

    const viewport = screen.getByRole("group", { name: "Programs and events" });
    viewport.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next program" })).toBeDisabled();

    await user.click(screen.getByRole("link", { name: /Program 1/ }));
    expect(onNavigate).toHaveBeenCalledWith("/program/program-1");
  });
});
