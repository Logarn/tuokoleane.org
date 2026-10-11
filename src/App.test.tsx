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

  it("leads with the kindness marketplace proposition", () => {
    render(<App />);

    expect(screen.getByRole("heading", {
      name: "What if touching a life was as easy as shopping online?",
      level: 1,
    })).toBeInTheDocument();
    expect(screen.getByText("Welcome to the Amazon of Charity. A place where anyone, anywhere, can find a way to Give. Share. Care.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Browse ways to help" })).toBeInTheDocument();
    expect(screen.queryByText("The catalogue of kindness", { exact: false })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "What we stand for" })).not.toBeInTheDocument();
    expect(screen.queryByText("Based in Kenya")).not.toBeInTheDocument();
    expect(screen.queryByText("Money, time or goods")).not.toBeInTheDocument();
    expect(screen.queryByText("Prototype experience. No payment is collected.")).not.toBeInTheDocument();
    expect(screen.queryByText("Names indicate places and communities reached. Inclusion does not imply institutional endorsement.")).not.toBeInTheDocument();
    expect(screen.queryByText("The values behind every listing")).not.toBeInTheDocument();
    expect(screen.queryByText("Ways to take part")).not.toBeInTheDocument();
    expect(screen.queryByText("Browse practical packages. Every one opens into its own page with the details and boundaries upfront.")).not.toBeInTheDocument();
  });

  it("uses an image-led discovery header with clear navigation", () => {
    const { container } = render(<App />);
    const primaryNavigation = screen.getByRole("navigation", { name: "Primary navigation" });
    const discoveryNavigation = screen.getByRole("navigation", { name: "Explore Tuokoleane" });

    expect(within(primaryNavigation).getByRole("link", { name: "Give" })).toHaveAttribute("href", "/#marketplace");
    expect(within(primaryNavigation).getByRole("link", { name: "About TI" })).toHaveAttribute("href", "/#values");
    expect(within(primaryNavigation).getByRole("link", { name: "Gallery" })).toHaveAttribute("href", "/#gallery");
    expect(within(primaryNavigation).getByRole("link", { name: "How it works" })).toHaveAttribute("href", "/#how-it-works");
    expect(within(primaryNavigation).getAllByRole("link")).toHaveLength(4);
    expect(container.querySelectorAll(".nav-destination-image img")).toHaveLength(4);
    expect(within(discoveryNavigation).getByRole("link", { name: /What can I do/ })).toBeInTheDocument();
    expect(within(discoveryNavigation).getByRole("link", { name: "Browse all ways to help" })).toBeInTheDocument();
  });

  it("filters the catalogue by category", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Education" }));

    expect(screen.getByRole("heading", { name: "Sponsor school supplies" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Support school fees" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Buy a meal" })).not.toBeInTheDocument();
  });

  it("features The TI Annual Gala first with its date and ticket price", () => {
    const { container } = render(<App />);
    const cards = [...container.querySelectorAll<HTMLElement>(".package-card")];

    expect(within(cards[0]).getByRole("heading", { name: "The TI Annual Gala" })).toBeInTheDocument();
    expect(within(cards[0]).getByText("Featured")).toBeInTheDocument();
    expect(within(cards[0]).getByText("1 Dec 2027")).toBeInTheDocument();
    expect(within(cards[0]).getByText("Ksh 3,000")).toBeInTheDocument();
  });

  it("renders official institution and county logos in the reach strip", () => {
    const { container } = render(<App />);
    const logos = [...container.querySelectorAll<HTMLImageElement>(".reach-logo")];

    expect(logos).toHaveLength(18);
    expect(logos.every((logo) => logo.src.includes("/images/reach/"))).toBe(true);
    expect(logos.filter((logo) => logo.alt === "University of Nairobi official logo")).toHaveLength(2);
  });

  it("shows the organisation's direct contact details", () => {
    const { container } = render(<App />);

    expect(screen.getByRole("link", { name: "tuokoleaneinitiative@gmail.com" })).toHaveAttribute("href", "mailto:tuokoleaneinitiative@gmail.com");
    expect(screen.getByRole("link", { name: "+254 740 603 626" })).toHaveAttribute("href", "tel:+254740603626");
    expect(screen.getByRole("link", { name: "Tuokoleane Initiative on Instagram" })).toHaveAttribute("href", "https://www.instagram.com/tuokoleaneinitiative/");
    expect(screen.getByRole("link", { name: "Tuokoleane Initiative on Facebook" })).toHaveAttribute("href", "https://www.facebook.com/profile.php?id=100077672700363");
    expect(screen.queryByRole("link", { name: /TikTok/i })).not.toBeInTheDocument();
    expect(container.querySelector(".footer-social-links")?.textContent).toBe("");
    expect(screen.queryByText("@Tuokoleane_Initiative")).not.toBeInTheDocument();
    expect(container.querySelector(".footer-symbol")).toHaveAttribute("src", "/icons/android-chrome-192x192.png");
  });

  it("shows five campaign cards and opens a detailed idea", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const cards = [...container.querySelectorAll<HTMLButtonElement>(".campaign-card")];

    expect(screen.getByRole("heading", { name: "Kindness becomes real when it becomes specific." })).toBeInTheDocument();
    expect(cards).toHaveLength(5);
    expect(cards.every((card) => card.querySelector("img")?.getAttribute("loading") === "lazy")).toBe(true);

    await user.click(screen.getByRole("button", { name: "Read A good heart should not need an event." }));

    const dialog = screen.getByRole("dialog", { name: "A good heart should not need an event." });
    expect(within(dialog).getByText("Human need does not keep that calendar.", { exact: false })).toBeInTheDocument();
    expect(within(dialog).getByText("Charity should not have opening hours.")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    await user.click(within(dialog).getByRole("button", { name: "Close idea" }));
    expect(screen.queryByRole("dialog", { name: "A good heart should not need an event." })).not.toBeInTheDocument();
  });

  it("shows the TI archive gallery and opens the full photo viewer", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    expect(screen.getByRole("heading", { name: "Tuokoleane Initiative Gallery" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Open gallery photo/ })).toHaveLength(18);
    expect([...container.querySelectorAll<HTMLImageElement>(".ti-gallery-card img")]
      .every((image) => image.getAttribute("loading") === "lazy")).toBe(true);

    await user.click(screen.getByRole("button", { name: "Open gallery photo 1 of 56" }));
    const dialog = screen.getByRole("dialog", { name: "Family Experience" });
    expect(within(dialog).getByText("1 / 56")).toBeInTheDocument();
    expect(within(dialog).getAllByRole("button", { name: /View photo/ })).toHaveLength(56);

    await user.click(within(dialog).getByRole("button", { name: "Next gallery photo" }));
    expect(within(dialog).getByText("2 / 56")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close gallery photo" }));
    await user.click(screen.getByRole("button", { name: /Family Experience.*25/ }));
    expect(screen.getAllByRole("button", { name: /Open gallery photo/ })).toHaveLength(18);
    await user.click(screen.getByRole("button", { name: "View all 25 photos" }));
    expect(screen.getAllByRole("button", { name: /Open gallery photo/ })).toHaveLength(25);
  });

  it("opens each package on its own route", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("link", { name: "View Buy a meal" }));

    expect(window.location.pathname).toBe("/listing/meal");
    expect(screen.getByRole("heading", { name: "Buy a meal", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "About this act of kindness" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show all photos" })).toBeInTheDocument();
    expect(screen.queryByText("No payment, placement or beneficiary match is created.")).not.toBeInTheDocument();
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

  it("opens The TI Annual Gala as a dated per-person listing", async () => {
    window.history.replaceState({}, "", "/listing/ti-annual-gala");
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { name: "The TI Annual Gala", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Open photo/ })).toHaveLength(4);
    expect(screen.getAllByText("1 December 2027")).toHaveLength(2);
    expect(screen.getAllByText("Ksh 3,000")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Reserve a seat" }));

    const basketDialog = screen.getByRole("dialog", { name: "Kindness basket" });
    expect(within(basketDialog).getByText("The TI Annual Gala")).toBeInTheDocument();
    expect(within(basketDialog).getAllByText(/3,000/).length).toBeGreaterThan(0);
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

  it("merges repeated fixed-price additions and updates quantity, totals and storage", async () => {
    window.history.replaceState({}, "", "/listing/meal");
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole("button", { name: "Add to basket" }));
    await user.click(within(screen.getByRole("dialog", { name: "Kindness basket" }))
      .getByRole("button", { name: "Close basket" }));
    await user.click(screen.getByRole("button", { name: "Add to basket" }));

    const basketDialog = screen.getByRole("dialog", { name: "Kindness basket" });
    expect(container.querySelectorAll(".basket-item")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Open kindness basket with 2 items" })).toBeInTheDocument();
    expect(within(basketDialog).getByText(/1,000/)).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("ti-kindness-basket") ?? "[]")).toEqual([
      { packageId: "meal", quantity: 2, amount: 500 },
    ]);

    await user.click(within(basketDialog).getByRole("button", { name: "Remove one Buy a meal" }));
    expect(within(basketDialog).getAllByText(/500/)).toHaveLength(2);

    await user.click(within(basketDialog).getByRole("button", { name: "Remove one Buy a meal" }));
    expect(within(basketDialog).getByRole("heading", { name: "Your basket is empty" })).toBeInTheDocument();
  });

  it("keeps different custom contribution amounts as separate basket lines", async () => {
    window.history.replaceState({}, "", "/listing/school-fees");
    const user = userEvent.setup();
    const { container } = render(<App />);
    const amount = screen.getByRole("textbox", { name: "Contribution amount in Kenyan shillings" });

    await user.clear(amount);
    await user.type(amount, "700");
    await user.click(screen.getByRole("button", { name: "Add to basket" }));
    await user.click(within(screen.getByRole("dialog", { name: "Kindness basket" }))
      .getByRole("button", { name: "Close basket" }));
    await user.clear(amount);
    await user.type(amount, "900");
    await user.click(screen.getByRole("button", { name: "Add to basket" }));

    const basketDialog = screen.getByRole("dialog", { name: "Kindness basket" });
    expect(container.querySelectorAll(".basket-item")).toHaveLength(2);
    expect(within(basketDialog).getByText(/1,600/)).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("ti-kindness-basket") ?? "[]")).toEqual([
      { packageId: "school-fees", quantity: 1, amount: 700 },
      { packageId: "school-fees", quantity: 1, amount: 900 },
    ]);
  });

  it("adds a time commitment without increasing the money total", async () => {
    window.history.replaceState({}, "", "/listing/listen");
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add to my plan" }));

    const basketDialog = screen.getByRole("dialog", { name: "Kindness basket" });
    expect(within(basketDialog).getByText("Listen to someone")).toBeInTheDocument();
    expect(within(basketDialog).getByText("Session based")).toBeInTheDocument();
    expect(within(basketDialog).getByText(/Ksh\s*0/)).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("ti-kindness-basket") ?? "[]")).toEqual([
      { packageId: "listen", quantity: 1, amount: 0 },
    ]);
  });

  it("restores a valid basket from browser storage", async () => {
    window.localStorage.setItem("ti-kindness-basket", JSON.stringify([
      { packageId: "meal", quantity: 2, amount: 500 },
    ]));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Open kindness basket with 2 items" }));

    const basketDialog = screen.getByRole("dialog", { name: "Kindness basket" });
    expect(within(basketDialog).getByText("Buy a meal")).toBeInTheDocument();
    expect(within(basketDialog).getByText(/1,000/)).toBeInTheDocument();
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
