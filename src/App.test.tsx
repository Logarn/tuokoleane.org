import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

function installSystemTheme(initialTheme: "light" | "dark") {
  let dark = initialTheme === "dark";
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    get matches() {
      return dark;
    },
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
  } as unknown as MediaQueryList;

  vi.stubGlobal("matchMedia", vi.fn(() => mediaQuery));

  return {
    setTheme(theme: "light" | "dark") {
      dark = theme === "dark";
      act(() => {
        listeners.forEach((listener) => listener({ matches: dark } as MediaQueryListEvent));
      });
    },
  };
}

describe("Tuokoleane kindness marketplace", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-preference");
    document.documentElement.style.removeProperty("color-scheme");
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
    vi.unstubAllGlobals();
  });

  it("leads with the kindness marketplace proposition", () => {
    const { container } = render(<App />);

    expect(screen.getByRole("heading", {
      name: "What if Doing Charity was as easy as shopping online?",
      level: 1,
    })).toBeInTheDocument();
    expect(container.querySelector(".hero-lede")).toHaveTextContent("Welcome to the Amazon of Charity. A place where anyone, anywhere, can find a way to Give. Share. Care.");
    expect(container.querySelector(".hero-lede strong")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Become An Angel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Angel's Amongst Us" })).toBeInTheDocument();
    expect(container.querySelector(".home-hero-image")).toHaveAttribute("src", "/images/hero/tuokoleane-family-table-1774.jpg");
    expect(container.querySelector(".home-hero-shade")).not.toBeInTheDocument();
    expect([...container.querySelectorAll(".value-card h3")].map((heading) => heading.textContent)).toEqual(["Give", "Share", "Care", "Love & Kindness"]);
    expect(container.querySelector(".kindness-mantra")).toHaveTextContent("If you cannot Give, Share.If you cannot Share, Care.Dare to Care.");
    expect(container.querySelector(".footer-mantra")).toHaveTextContent("Dare to Care.");
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

  it("opens the Who we are page from the hero", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Angel's Amongst Us" }));

    expect(window.location.pathname).toBe("/about");
    expect(screen.getByText("Who we are")).toBeInTheDocument();
  });

  it("uses an image-led discovery header with clear navigation", () => {
    const { container } = render(<App />);
    const primaryNavigation = screen.getByRole("navigation", { name: "Primary navigation" });
    const discoveryNavigation = screen.getByRole("navigation", { name: "Explore Tuokoleane" });

    expect(within(primaryNavigation).getByRole("link", { name: "Give" })).toHaveAttribute("href", "/#marketplace");
    expect(within(primaryNavigation).getByRole("link", { name: "About TI" })).toHaveAttribute("href", "/about");
    expect(within(primaryNavigation).getByRole("link", { name: "Gallery" })).toHaveAttribute("href", "/gallery");
    expect(within(primaryNavigation).getByRole("link", { name: "How it works" })).toHaveAttribute("href", "/#how-it-works");
    expect(within(primaryNavigation).getAllByRole("link")).toHaveLength(4);
    expect(container.querySelectorAll(".nav-destination-image img")).toHaveLength(4);
    expect(within(discoveryNavigation).getByRole("link", { name: /What can I do/ })).toBeInTheDocument();
    expect(within(discoveryNavigation).getByRole("link", { name: "Browse all ways to help" })).toBeInTheDocument();
  });

  it("supports system, light and dark themes with a persistent manual override", async () => {
    const systemTheme = installSystemTheme("dark");
    const user = userEvent.setup();
    const { container, unmount } = render(<App />);
    const selector = screen.getByRole("combobox", { name: "Colour theme" });

    expect(selector).toHaveValue("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(document.documentElement).toHaveAttribute("data-theme-preference", "light");
    expect(container.querySelector(".brand-logo img")).toHaveAttribute("src", "/images/brand/tuokoleane-wordmark-blue.png");

    await user.selectOptions(selector, "system");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem("ti-theme-preference-v1")).toBe("system");
    expect(container.querySelector(".brand-logo img")).toHaveAttribute("src", "/images/brand/tuokoleane-wordmark-dark.png");

    systemTheme.setTheme("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    await user.selectOptions(selector, "light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(window.localStorage.getItem("ti-theme-preference-v1")).toBe("light");
    expect(container.querySelector(".brand-logo img")).toHaveAttribute("src", "/images/brand/tuokoleane-wordmark-blue.png");

    systemTheme.setTheme("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    await user.selectOptions(selector, "dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem("ti-theme-preference-v1")).toBe("dark");

    unmount();
    const persistedView = render(<App />);
    expect(screen.getByRole("combobox", { name: "Colour theme" })).toHaveValue("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    await user.selectOptions(screen.getByRole("combobox", { name: "Colour theme" }), "system");
    expect(window.localStorage.getItem("ti-theme-preference-v1")).toBe("system");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    systemTheme.setTheme("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    persistedView.unmount();
    render(<App />);
    expect(screen.getByRole("combobox", { name: "Colour theme" })).toHaveValue("system");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("filters the catalogue by category", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Education" }));

    expect(screen.getByRole("heading", { name: "Buy school supplies" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Support school fees" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Buy a meal" })).not.toBeInTheDocument();
  });

  it("shows a controlled not-found page for malformed route encoding", () => {
    window.history.replaceState({}, "", "/listing/%");
    render(<App />);

    expect(screen.getByRole("heading", { name: "Let’s get you back to a way you can help." })).toBeInTheDocument();
  });

  it("searches listings in a dropdown and opens the selected result", async () => {
    const user = userEvent.setup();
    render(<App />);

    const search = screen.getByRole("combobox", { name: "Search ways to help" });
    await user.click(search);
    await user.type(search, "school");

    const results = screen.getByRole("listbox", { name: "Listing search results" });
    expect(within(results).getAllByRole("option").length).toBeGreaterThan(2);
    expect(within(results).getByRole("option", { name: /Buy school supplies/ })).toBeInTheDocument();
    expect(within(results).getByRole("option", { name: /Support school fees/ })).toBeInTheDocument();
    expect(within(results).getByRole("option", { name: /Buy a pair of school shoes/ })).toBeInTheDocument();

    await user.click(within(results).getByRole("option", { name: /Support school fees/ }));

    expect(window.location.pathname).toBe("/listing/school-fees");
    expect(screen.getByRole("heading", { name: "Support school fees", level: 1 })).toBeInTheDocument();
  });

  it("supports keyboard selection in listing search", async () => {
    const user = userEvent.setup();
    render(<App />);

    const search = screen.getByRole("combobox", { name: "Search ways to help" });
    await user.click(search);
    await user.type(search, "plant a tree");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(window.location.pathname).toBe("/listing/tree");
    expect(screen.getByRole("heading", { name: "Plant a tree", level: 1 })).toBeInTheDocument();
  });

  it("keeps The TI Annual Gala out of the donation catalogue", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const marketplace = container.querySelector<HTMLElement>("#marketplace")!;

    expect(within(marketplace).queryByRole("heading", { name: "The TI Annual Gala" })).not.toBeInTheDocument();
    await user.type(screen.getByRole("combobox", { name: "Search ways to help" }), "TI Annual Gala");
    expect(screen.getByRole("heading", { name: "Nothing here yet" })).toBeInTheDocument();
    expect(screen.getByText("Try another search or choose a different category.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore The TI Annual Gala" })).toHaveAttribute("href", "/program/ti-annual-gala");
  });

  it("renders official institution and county logos in the reach strip", () => {
    const { container } = render(<App />);
    const logos = [...container.querySelectorAll<HTMLImageElement>(".reach-logo")];

    expect(logos).toHaveLength(18);
    expect(logos.every((logo) => logo.src.includes("/images/reach/"))).toBe(true);
    expect(logos.filter((logo) => logo.alt === "University of Nairobi official logo")).toHaveLength(2);
  });

  it("puts the catalogue first and closes the homepage with values and reach", () => {
    const { container } = render(<App />);
    const marketplace = container.querySelector("#marketplace");
    const howItWorks = container.querySelector("#how-it-works");
    const programsSection = container.querySelector("#programs");
    const valuesSection = container.querySelector("#values");
    const reachSection = container.querySelector(".reach-section");

    expect(marketplace).toBeInTheDocument();
    expect(howItWorks).toBeInTheDocument();
    expect(programsSection).toBeInTheDocument();
    expect(valuesSection).toBeInTheDocument();
    expect(reachSection).toBeInTheDocument();
    expect(marketplace!.compareDocumentPosition(howItWorks!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(howItWorks!.compareDocumentPosition(programsSection!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(programsSection!.compareDocumentPosition(valuesSection!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(valuesSection!.compareDocumentPosition(reachSection!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Kindness becomes real when it becomes specific." })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Tuokoleane Initiative Gallery" })).not.toBeInTheDocument();
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
    expect(container.querySelector(".footer-symbol img")).toHaveAttribute("src", "/images/brand/tuokoleane-symbol-blue.png");
    expect(container.querySelector(".footer-symbol source")).not.toBeInTheDocument();
  });

  it("shows supported donation methods with the HD M-PESA mark", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "We Support Donations Made Through" })).toBeInTheDocument();
    expect(screen.queryByText("Donation options")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "M-PESA" })).toHaveAttribute("src", "/images/payment-badges/mpesa.svg");
    expect(screen.getByRole("img", { name: "T-Kash" })).toHaveAttribute("src", "/images/payment-badges/tkash.jpg");
    expect(screen.getByRole("img", { name: "Airtel Money" })).toHaveAttribute("src", "/images/payment-badges/airtel-money.png");
    expect(screen.queryByText("Prototype marketplace", { exact: false })).not.toBeInTheDocument();
  });

  it("shows five campaign cards and opens a detailed idea", async () => {
    window.history.replaceState({}, "", "/about");
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
    window.history.replaceState({}, "", "/gallery");
    const user = userEvent.setup();
    const { container } = render(<App />);

    expect(screen.getByRole("heading", { name: "Tuokoleane Initiative Gallery" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Open gallery photo/ })).toHaveLength(5);
    expect([...container.querySelectorAll<HTMLImageElement>(".ti-gallery-card img")]
      .every((image) => image.getAttribute("loading") === "lazy")).toBe(true);
    expect(container.querySelector('img[src="/images/ti-gallery/ti-gallery-17.jpg"]')).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open gallery photo 1 of 55" }));
    const dialog = screen.getByRole("dialog", { name: "Family Experience" });
    expect(within(dialog).getByText("1 / 55")).toBeInTheDocument();
    expect(within(dialog).getAllByRole("button", { name: /View photo/ })).toHaveLength(55);

    await user.click(within(dialog).getByRole("button", { name: "Next gallery photo" }));
    expect(within(dialog).getByText("2 / 55")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close gallery photo" }));
    await user.click(screen.getByRole("button", { name: /Family Experience.*25/ }));
    expect(screen.getAllByRole("button", { name: /Open gallery photo/ })).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: "View all 25 photos" }));
    expect(screen.getAllByRole("button", { name: /Open gallery photo/ })).toHaveLength(25);
  });

  it("opens About TI on its own route with the campaign, values and reach sections", async () => {
    const user = userEvent.setup();
    render(<App />);
    const primaryNavigation = screen.getByRole("navigation", { name: "Primary navigation" });

    await user.click(within(primaryNavigation).getByRole("link", { name: "About TI" }));

    expect(window.location.pathname).toBe("/about");
    expect(screen.getByRole("heading", { name: "We belong to one another.", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kindness becomes real when it becomes specific." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Give", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Share", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Care", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Love & Kindness", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Touching lives across campuses and counties." })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "What do you have to give?" })).not.toBeInTheDocument();
  });

  it("opens Gallery on its own route without the homepage catalogue", async () => {
    const user = userEvent.setup();
    render(<App />);
    const primaryNavigation = screen.getByRole("navigation", { name: "Primary navigation" });

    await user.click(within(primaryNavigation).getByRole("link", { name: "Gallery" }));

    expect(window.location.pathname).toBe("/gallery");
    expect(screen.getByRole("heading", { name: "Tuokoleane Initiative Gallery", level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "What do you have to give?" })).not.toBeInTheDocument();
  });

  it("opens each package on its own route", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("link", { name: "View Buy a meal" }));

    expect(window.location.pathname).toBe("/listing/meal");
    expect(screen.getByRole("heading", { name: "Buy a meal", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What you are helping with" })).toBeInTheDocument();
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

  it("opens Annual Sharing Day with archive photos and a manual attendance enquiry", () => {
    window.history.replaceState({}, "", "/program/annual-sharing-day");
    render(<App />);

    expect(screen.getByRole("heading", { name: "Annual Sharing Day", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Moments from Annual Sharing Day." })).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: /Annual Sharing Day/ }).length).toBeGreaterThanOrEqual(4);
    expect(screen.getByRole("link", { name: "Ask about attending" })).toHaveAttribute("href", "mailto:tuokoleaneinitiative@gmail.com?subject=Annual%20Sharing%20Day%20attendance%20enquiry");
    expect(screen.getByText(/An email enquiry does not reserve a place/)).toBeInTheDocument();
  });

  it("offers a suggested amount and allows donations from KSh 20", () => {
    window.history.replaceState({}, "", "/listing/donate-any-amount");
    render(<App />);

    expect(screen.getByRole("heading", { name: "Donate any amount", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Contribution amount in Kenyan shillings" })).toHaveValue("500");
    expect(screen.getByText("The minimum contribution is KSh 20.")).toBeInTheDocument();
  });

  it("renders a new cause listing on a direct route", () => {
    window.history.replaceState({}, "", "/listing/food-shelf");
    render(<App />);

    expect(screen.getByRole("heading", { name: "Stock a Family Unit food shelf", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Open photo/ })).toHaveLength(4);
    expect(screen.getAllByText("Ksh 1,800")).toHaveLength(2);
  });

  it("renders approved product listings without visible image metadata", () => {
    window.history.replaceState({}, "", "/listing/school-shoes");
    render(<App />);

    expect(screen.getByRole("heading", { name: "Buy a pair of school shoes", level: 1 })).toBeInTheDocument();
    expect(screen.queryByText(/official Bata Kenya product photos/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Open photo/ })).toHaveLength(4);
    expect(screen.getAllByText("Ksh 2,000")).toHaveLength(2);
  });

  it("opens The TI Annual Gala as an initiative with no purchase flow", () => {
    window.history.replaceState({}, "", "/program/ti-annual-gala");
    render(<App />);

    expect(screen.getByRole("heading", { name: "The TI Annual Gala", level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reserve a seat" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add to basket" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Payment details" })).not.toBeInTheDocument();
    expect(screen.getByText("1 December 2027")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Practical ways in." })).not.toBeInTheDocument();
  });

  it("adds a fixed-price package from its detail page", async () => {
    window.history.replaceState({}, "", "/listing/meal");
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add to basket" }));

    const basketDialog = screen.getByRole("dialog", { name: "Your basket" });
    expect(within(basketDialog).getByText("Buy a meal")).toBeInTheDocument();
    expect(within(basketDialog).getAllByText(/500/).length).toBeGreaterThan(0);
  });

  it("merges repeated fixed-price additions and updates quantity, totals and storage", async () => {
    window.history.replaceState({}, "", "/listing/meal");
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole("button", { name: "Add to basket" }));
    await user.click(within(screen.getByRole("dialog", { name: "Your basket" }))
      .getByRole("button", { name: "Close basket" }));
    await user.click(screen.getByRole("button", { name: "Add to basket" }));

    const basketDialog = screen.getByRole("dialog", { name: "Your basket" });
    expect(container.querySelectorAll(".basket-item")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Open your basket with 2 items" })).toBeInTheDocument();
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
    await user.click(within(screen.getByRole("dialog", { name: "Your basket" }))
      .getByRole("button", { name: "Close basket" }));
    await user.clear(amount);
    await user.type(amount, "900");
    await user.click(screen.getByRole("button", { name: "Add to basket" }));

    const basketDialog = screen.getByRole("dialog", { name: "Your basket" });
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

    const basketDialog = screen.getByRole("dialog", { name: "Your basket" });
    expect(within(basketDialog).getByText("Listen to someone")).toBeInTheDocument();
    expect(within(basketDialog).getByText("One guided session")).toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: "Open your basket with 2 items" }));

    const basketDialog = screen.getByRole("dialog", { name: "Your basket" });
    expect(within(basketDialog).getByText("Buy a meal")).toBeInTheDocument();
    expect(within(basketDialog).getByText(/1,000/)).toBeInTheDocument();
  });

  it("shows verified payment instructions on each listing", () => {
    window.history.replaceState({}, "", "/listing/meal");
    render(<App />);

    const paymentDetails = screen.getByRole("region", { name: "Payment details" });
    expect(within(paymentDetails).getByText("9911113")).toBeInTheDocument();
    expect(within(paymentDetails).getByText("TUOKOLEANE INITIATIVE CBO")).toBeInTheDocument();
    expect(within(paymentDetails).getByRole("link", { name: "0740 603 626" })).toHaveAttribute("href", "sms:+254740603626");
    expect(within(paymentDetails).getByRole("img", { name: "M-PESA" })).toBeInTheDocument();
    expect(within(paymentDetails).getByRole("img", { name: "T-Kash" })).toBeInTheDocument();
    expect(within(paymentDetails).getByRole("img", { name: "Airtel Money" })).toBeInTheDocument();
  });

  it("sends donation, cause and note details to the TI notification API", async () => {
    window.history.replaceState({}, "", "/listing/meal");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ reference: "TI-ABC12345" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add to basket" }));
    await user.click(within(screen.getByRole("dialog", { name: "Your basket" }))
      .getByRole("button", { name: "Continue to payment" }));

    const checkout = screen.getByRole("dialog", { name: "Tell TI about your payment." });
    expect(within(checkout).getByText("9911113")).toBeInTheDocument();
    expect(within(checkout).getByText("TUOKOLEANE INITIATIVE CBO")).toBeInTheDocument();
    await user.type(within(checkout).getByRole("textbox", { name: "Name *" }), "Amina Donor");
    await user.type(within(checkout).getByRole("textbox", { name: "Email *" }), "amina@example.com");
    await user.type(within(checkout).getByRole("textbox", { name: "Phone used for M-PESA *" }), "0740123456");
    await user.type(within(checkout).getByRole("textbox", { name: "M-PESA confirmation code *" }), "TAA1B2C3D4");
    await user.type(within(checkout).getByRole("textbox", { name: "A note for the team Optional" }), "Please use this for the next family meal.");
    await user.click(within(checkout).getByRole("button", { name: "Send payment details" }));

    const confirmation = await screen.findByRole("dialog", { name: "Thank you for choosing to help." });
    expect(within(confirmation).getByText("Your details reached TI")).toBeInTheDocument();
    expect(within(confirmation).getByText(/TI will match M-PESA code TAA1B2C3D4/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(request.body));
    expect(body).toMatchObject({
      donor: {
        name: "Amina Donor",
        email: "amina@example.com",
        phone: "0740123456",
        anonymous: false,
      },
      note: "Please use this for the next family meal.",
      mpesaReference: "TAA1B2C3D4",
      items: [{ packageId: "meal", title: "Buy a meal", quantity: 1, unitAmount: 500 }],
    });
    expect(JSON.parse(window.localStorage.getItem("ti-kindness-basket") ?? "[]")).toEqual([]);
  });

  it("keeps the basket when the TI notification cannot be sent", async () => {
    window.history.replaceState({}, "", "/listing/meal");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: "We could not notify the TI team. Please try again.",
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add to basket" }));
    await user.click(within(screen.getByRole("dialog", { name: "Your basket" }))
      .getByRole("button", { name: "Continue to payment" }));
    const checkout = screen.getByRole("dialog", { name: "Tell TI about your payment." });
    await user.type(within(checkout).getByRole("textbox", { name: "Name *" }), "Amina Donor");
    await user.type(within(checkout).getByRole("textbox", { name: "Email *" }), "amina@example.com");
    await user.type(within(checkout).getByRole("textbox", { name: "Phone used for M-PESA *" }), "0740123456");
    await user.type(within(checkout).getByRole("textbox", { name: "M-PESA confirmation code *" }), "TAA1B2C3D4");
    await user.click(within(checkout).getByRole("button", { name: "Send payment details" }));

    expect(await within(checkout).findByRole("alert")).toHaveTextContent("We could not notify the TI team. Please try again.");
    expect(screen.queryByRole("dialog", { name: "Thank you for choosing to help." })).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("ti-kindness-basket") ?? "[]")).toEqual([
      { packageId: "meal", quantity: 1, amount: 500 },
    ]);
  });

  it("submits a time offer without asking for M-PESA details", async () => {
    window.history.replaceState({}, "", "/listing/listen");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ reference: "TI-TIME1234" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add to my plan" }));
    await user.click(within(screen.getByRole("dialog", { name: "Your basket" }))
      .getByRole("button", { name: "Share my interest" }));
    const checkout = screen.getByRole("dialog", { name: "Tell TI how to reach you." });
    expect(within(checkout).queryByRole("textbox", { name: /M-PESA confirmation code/ })).not.toBeInTheDocument();
    await user.type(within(checkout).getByRole("textbox", { name: "Name *" }), "David Volunteer");
    await user.type(within(checkout).getByRole("textbox", { name: "Email *" }), "david@example.com");
    await user.click(within(checkout).getByRole("button", { name: "Send my interest" }));

    const confirmation = await screen.findByRole("dialog", { name: "Thank you for choosing to help." });
    expect(within(confirmation).getByText("Your interest reached TI")).toBeInTheDocument();
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(request.body));
    expect(body.mpesaReference).toBe("");
    expect(body.items).toEqual([
      expect.objectContaining({ packageId: "listen", title: "Listen to someone", kind: "time", unitAmount: 0 }),
    ]);
  });

  it("prevents a custom contribution below KSh 20", async () => {
    window.history.replaceState({}, "", "/listing/school-fees");
    const user = userEvent.setup();
    render(<App />);

    const amount = screen.getByRole("textbox", { name: "Contribution amount in Kenyan shillings" });
    await user.clear(amount);
    await user.type(amount, "19");

    expect(screen.getByText("Enter at least Ksh 20.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to basket" })).toBeDisabled();
  });

  it("accepts a smaller contribution towards a fixed-price item without calling it a full purchase", async () => {
    window.history.replaceState({}, "", "/listing/grocery-basket");
    const user = userEvent.setup();
    render(<App />);

    const amount = screen.getByRole("textbox", { name: "Contribution amount in Kenyan shillings" });
    expect(amount).toHaveValue("2500");
    await user.clear(amount);
    await user.type(amount, "20");

    expect(screen.getByText(/TI may combine it with other contributions/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add to basket" }));
    expect(JSON.parse(window.localStorage.getItem("ti-kindness-basket") ?? "[]")).toEqual([
      { packageId: "grocery-basket", quantity: 1, amount: 20 },
    ]);
  });
});
