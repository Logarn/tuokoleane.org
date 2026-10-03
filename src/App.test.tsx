import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("Tuokoleane kindness marketplace", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
    vi.stubGlobal("scrollTo", vi.fn());
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("filters the catalogue by category", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Education" }));

    expect(screen.getByRole("heading", { name: "Sponsor school supplies" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Support school fees" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Buy a meal" })).not.toBeInTheDocument();
  });

  it("opens each package on its own route", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("link", { name: "View Buy a meal" }));

    expect(window.location.pathname).toBe("/listing/meal");
    expect(screen.getByRole("heading", { name: "Buy a meal", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "About this act of kindness" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show all photos" })).toBeInTheDocument();
  });

  it("opens an expanded initiative on its own route", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("link", { name: "Explore TI ShareSphere" }));

    expect(window.location.pathname).toBe("/program/sharesphere");
    expect(screen.getByRole("heading", { name: "TI ShareSphere", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What happens here" })).toBeInTheDocument();
  });

  it("renders a new cause listing on a direct route", () => {
    window.history.replaceState({}, "", "/listing/food-shelf");
    render(<App />);

    expect(screen.getByRole("heading", { name: "Stock a Family Unit food shelf", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Open photo/ })).toHaveLength(4);
    expect(screen.getAllByText("Ksh 1,800")).toHaveLength(2);
  });

  it("adds a fixed-price package from its detail page", async () => {
    window.history.replaceState({}, "", "/listing/meal");
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add to basket" }));

    const basketDialog = screen.getByRole("dialog", { name: "Kindness basket" });
    expect(within(basketDialog).getByText("Buy a meal")).toBeInTheDocument();
    expect(within(basketDialog).getAllByText(/500/).length).toBeGreaterThan(0);
  });

  it("prevents a custom contribution below the demo minimum", async () => {
    window.history.replaceState({}, "", "/listing/school-fees");
    const user = userEvent.setup();
    render(<App />);

    const amount = screen.getByRole("textbox", { name: "Contribution amount in Kenyan shillings" });
    await user.clear(amount);
    await user.type(amount, "400");

    expect(screen.getByText("Enter at least Ksh 500 for this demo.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to basket" })).toBeDisabled();
  });
});
