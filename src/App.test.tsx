import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

describe("Tuokoleane kindness marketplace", () => {
  beforeEach(() => window.localStorage.clear());

  it("filters the catalogue by category", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Education" }));

    expect(screen.getByRole("heading", { name: "Sponsor school supplies" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Support school fees" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Buy a meal" })).not.toBeInTheDocument();
  });

  it("adds a fixed-price package and updates the total", async () => {
    const user = userEvent.setup();
    render(<App />);

    const mealCard = screen.getByRole("heading", { name: "Buy a meal" }).closest("article");
    expect(mealCard).not.toBeNull();
    await user.click(within(mealCard!).getByRole("button", { name: "Add to basket" }));
    const detailDialog = screen.getByRole("dialog", { name: "Buy a meal" });
    await user.click(within(detailDialog).getByRole("button", { name: /Add to basket/i }));

    expect(screen.getByRole("heading", { name: "Kindness basket" })).toBeInTheDocument();
    const basketDialog = screen.getByRole("dialog", { name: "Kindness basket" });
    expect(within(basketDialog).getAllByText(/100/).length).toBeGreaterThan(0);
  });

  it("prevents a custom contribution below the demo minimum", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Choose amount" })[0]);
    const amount = screen.getByRole("textbox", { name: "Contribution amount in Kenyan shillings" });
    await user.clear(amount);
    await user.type(amount, "50");

    expect(screen.getByText("Enter at least KSh 100 for this demo.")).toBeInTheDocument();
    const detailDialog = screen.getByRole("dialog", { name: "Support school fees" });
    expect(within(detailDialog).getByRole("button", { name: /Add to basket/i })).toBeDisabled();
  });
});
