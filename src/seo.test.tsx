import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { kindnessPackages, programs } from "./data";
import { applyRouteSeo, getRouteSeo } from "./seo";

function structuredData(seo: ReturnType<typeof getRouteSeo>) {
  return seo.structuredData as { "@graph": Array<Record<string, unknown>> };
}

describe("route SEO", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    vi.stubGlobal("scrollTo", vi.fn());
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
  });

  afterEach(() => {
    cleanup();
    document.head.querySelectorAll("meta, link[rel='canonical'], script#tuokoleane-structured-data").forEach((element) => element.remove());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("gives every public route a unique canonical, title and description", () => {
    const paths = [
      "/",
      "/about",
      "/gallery",
      ...kindnessPackages.map((item) => `/listing/${item.id}`),
      ...programs.map((program) => `/program/${program.id}`),
    ];
    const pages = paths.map(getRouteSeo);

    expect(new Set(pages.map((page) => page.canonicalUrl)).size).toBe(paths.length);
    expect(new Set(pages.map((page) => page.title)).size).toBe(paths.length);
    expect(new Set(pages.map((page) => page.description)).size).toBe(paths.length);
    expect(pages.every((page) => page.robots.startsWith("index, follow"))).toBe(true);
  });

  it("uses listing content and truthful breadcrumb schema", () => {
    const item = kindnessPackages.find((candidate) => candidate.id === "grocery-basket")!;
    const seo = getRouteSeo("/listing/grocery-basket");
    const graph = structuredData(seo)["@graph"];
    const breadcrumbs = graph.find((entry) => entry["@type"] === "BreadcrumbList") as {
      itemListElement: Array<Record<string, unknown>>;
    };

    expect(seo.title).toBe(`${item.title} | Tuokoleane Initiative`);
    expect(seo.description).toBe(item.shortDescription);
    expect(seo.canonicalUrl).toBe("https://tuokoleane.org/listing/grocery-basket");
    expect(seo.imageUrl).toBe(`https://tuokoleane.org${item.images[0].src}`);
    expect(breadcrumbs.itemListElement.map((entry) => entry.name)).toEqual(["Home", item.title]);
    expect(breadcrumbs.itemListElement.every((entry) => !String(entry.item).includes("#"))).toBe(true);
    expect(graph.some((entry) => entry["@type"] === "Product")).toBe(false);
    expect(graph.some((entry) => entry["@type"] === "AggregateRating")).toBe(false);
  });

  it("uses focused page schemas without repeating the full organisation graph", () => {
    const homeTypes = structuredData(getRouteSeo("/"))["@graph"].map((entry) => entry["@type"]);
    const aboutTypes = structuredData(getRouteSeo("/about"))["@graph"].map((entry) => entry["@type"]);
    const galleryTypes = structuredData(getRouteSeo("/gallery"))["@graph"].map((entry) => entry["@type"]);
    const listingTypes = structuredData(getRouteSeo("/listing/meal"))["@graph"].map((entry) => entry["@type"]);
    const programTypes = structuredData(getRouteSeo("/program/sharesphere"))["@graph"].map((entry) => entry["@type"]);

    expect(homeTypes).toEqual(["Organization", "WebSite", "WebPage"]);
    expect(aboutTypes).toEqual(["Organization", "AboutPage", "BreadcrumbList"]);
    expect(galleryTypes).toEqual(["CollectionPage", "BreadcrumbList"]);
    expect(listingTypes).toEqual(["WebPage", "BreadcrumbList"]);
    expect(programTypes).toEqual(["WebPage", "BreadcrumbList"]);
  });

  it("does not turn an unconfirmed event or donation into unsupported commerce schema", () => {
    const pages = [getRouteSeo("/program/ti-annual-gala"), getRouteSeo("/listing/grocery-basket")];
    const types = pages.flatMap((seo) => structuredData(seo)["@graph"].map((entry) => entry["@type"]));

    expect(types).not.toContain("Event");
    expect(types).not.toContain("Product");
    expect(types).not.toContain("Offer");
    expect(types).not.toContain("AggregateRating");
  });

  it("keeps missing and malformed routes out of search results", () => {
    expect(getRouteSeo("/listing/not-real").robots).toBe("noindex, follow");
    expect(getRouteSeo("/listing/%").robots).toBe("noindex, follow");
    expect(getRouteSeo("/anything-else").title).toBe("Page not found | Tuokoleane Initiative");
  });

  it("updates the document head idempotently", () => {
    applyRouteSeo("/about");
    applyRouteSeo("/listing/school-shoes");
    const expected = getRouteSeo("/listing/school-shoes");

    expect(document.documentElement.lang).toBe("en-KE");
    expect(document.title).toBe(expected.title);
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute("content", expected.description);
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute("content", "index, follow, max-image-preview:large");
    expect(document.head.querySelector('meta[property="og:url"]')).toHaveAttribute("content", expected.canonicalUrl);
    expect(document.head.querySelector('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute("href", expected.canonicalUrl);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('script#tuokoleane-structured-data')).toHaveLength(1);
    expect(() => JSON.parse(document.head.querySelector('script#tuokoleane-structured-data')!.textContent ?? "")).not.toThrow();
  });

  it("renders listing and programme breadcrumbs as real links", () => {
    window.history.replaceState({}, "", "/listing/meal");
    const listingView = render(<App />);

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toContainElement(
      screen.getByRole("link", { name: "All ways to help" }),
    );
    expect(screen.getByRole("link", { name: "All ways to help" })).toHaveAttribute("href", "/#marketplace");
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://tuokoleane.org/listing/meal");

    listingView.unmount();
    window.history.replaceState({}, "", "/program/sharesphere");
    render(<App />);

    expect(screen.getByRole("link", { name: "All initiatives" })).toHaveAttribute("href", "/#programs");
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://tuokoleane.org/program/sharesphere");
  });
});
