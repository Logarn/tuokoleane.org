import { kindnessPackages, programs, type KindnessPackage, type Program } from "./data";

const SITE_ORIGIN = "https://tuokoleane.org";
const SITE_NAME = "Tuokoleane Initiative";
const DEFAULT_SHARE_IMAGE = "/images/ti-gallery/ti-gallery-51.jpg";
const SEO_SCRIPT_ID = "tuokoleane-structured-data";

type JsonLdValue = string | number | boolean | JsonLdObject | JsonLdValue[];
type JsonLdObject = { [key: string]: JsonLdValue };

export interface RouteSeo {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  imageAlt: string;
  robots: string;
  openGraphType: "website";
  structuredData: JsonLdObject;
}

const organization: JsonLdObject = {
  "@type": "Organization",
  "@id": `${SITE_ORIGIN}/#organization`,
  name: SITE_NAME,
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/images/brand/tuokoleane-logo-blue.png`,
  email: "tuokoleaneinitiative@gmail.com",
  telephone: "+254740603626",
  sameAs: [
    "https://www.instagram.com/tuokoleaneinitiative/",
    "https://www.facebook.com/profile.php?id=100077672700363",
  ],
};

const website: JsonLdObject = {
  "@type": "WebSite",
  "@id": `${SITE_ORIGIN}/#website`,
  name: SITE_NAME,
  url: SITE_ORIGIN,
  inLanguage: "en-KE",
  publisher: { "@id": `${SITE_ORIGIN}/#organization` },
};

function absoluteUrl(path: string) {
  return new URL(path, SITE_ORIGIN).toString();
}

function decodeRouteId(pathname: string, prefix: string) {
  if (!pathname.startsWith(prefix)) return null;
  const encodedId = pathname.slice(prefix.length);
  if (!encodedId || encodedId.includes("/")) return null;

  try {
    return decodeURIComponent(encodedId);
  } catch {
    return null;
  }
}

function breadcrumbList(entries: Array<{ name: string; path: string }>): JsonLdObject {
  return {
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}

function webPageSchema({
  canonicalUrl,
  title,
  description,
  imageUrl,
  imageAlt,
  type = "WebPage",
}: Pick<RouteSeo, "canonicalUrl" | "title" | "description" | "imageUrl" | "imageAlt"> & { type?: "WebPage" | "AboutPage" | "CollectionPage" }): JsonLdObject {
  return {
    "@type": type,
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: title,
    description,
    inLanguage: "en-KE",
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
    about: { "@id": `${SITE_ORIGIN}/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      contentUrl: imageUrl,
      caption: imageAlt,
    },
  };
}

function graph(...entries: JsonLdObject[]): JsonLdObject {
  return { "@context": "https://schema.org", "@graph": entries };
}

function knownRouteSeo({
  title,
  description,
  path,
  image,
  imageAlt,
  breadcrumbs = [],
  pageType = "WebPage",
  includeOrganization = false,
  includeWebsite = false,
}: {
  title: string;
  description: string;
  path: string;
  image: string;
  imageAlt: string;
  breadcrumbs?: Array<{ name: string; path: string }>;
  pageType?: "WebPage" | "AboutPage" | "CollectionPage";
  includeOrganization?: boolean;
  includeWebsite?: boolean;
}): RouteSeo {
  const canonicalUrl = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const page = webPageSchema({ canonicalUrl, title, description, imageUrl, imageAlt, type: pageType });

  return {
    title,
    description,
    canonicalUrl,
    imageUrl,
    imageAlt,
    robots: "index, follow, max-image-preview:large",
    openGraphType: "website",
    structuredData: graph(
      ...(includeOrganization ? [organization] : []),
      ...(includeWebsite ? [website] : []),
      page,
      ...(breadcrumbs.length > 0 ? [breadcrumbList(breadcrumbs)] : []),
    ),
  };
}

function listingSeo(item: KindnessPackage): RouteSeo {
  const path = `/listing/${item.id}`;
  return knownRouteSeo({
    title: `${item.title} | Tuokoleane Initiative`,
    description: item.shortDescription,
    path,
    image: item.images[0].src,
    imageAlt: item.images[0].alt,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: item.title, path },
    ],
  });
}

function programSeo(program: Program): RouteSeo {
  const path = `/program/${program.id}`;
  return knownRouteSeo({
    title: `${program.name} | Tuokoleane Initiative`,
    description: program.summary,
    path,
    image: program.image,
    imageAlt: program.imageAlt,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: program.name, path },
    ],
  });
}

function notFoundSeo(pathname: string): RouteSeo {
  const safePath = pathname.startsWith("/") ? pathname : "/";
  const canonicalUrl = absoluteUrl(safePath);
  const title = `Page not found | ${SITE_NAME}`;
  const description = "This Tuokoleane Initiative page could not be found. Browse the current ways to help instead.";
  const imageUrl = absoluteUrl(DEFAULT_SHARE_IMAGE);
  const imageAlt = "Tuokoleane community members spending time together";

  return {
    title,
    description,
    canonicalUrl,
    imageUrl,
    imageAlt,
    robots: "noindex, follow",
    openGraphType: "website",
    structuredData: graph(webPageSchema({ canonicalUrl, title, description, imageUrl, imageAlt })),
  };
}

export function getRouteSeo(pathname: string): RouteSeo {
  if (pathname === "/") {
    return knownRouteSeo({
      title: "Tuokoleane Initiative | Practical Ways to Help",
      description: "Choose a practical way to give, share or care through Tuokoleane Initiative, from meals and school essentials to time and community support.",
      path: "/",
      image: DEFAULT_SHARE_IMAGE,
      imageAlt: "Tuokoleane community members spending time together",
      includeOrganization: true,
      includeWebsite: true,
    });
  }

  if (pathname === "/about") {
    return knownRouteSeo({
      title: "About Tuokoleane Initiative",
      description: "Meet Tuokoleane Initiative and see how giving, sharing, care, love and kindness bring people together across Kenyan communities.",
      path: "/about",
      image: "/images/ti-gallery/ti-gallery-51.jpg",
      imageAlt: "Tuokoleane community members spending time together",
      pageType: "AboutPage",
      includeOrganization: true,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "About Tuokoleane Initiative", path: "/about" },
      ],
    });
  }

  if (pathname === "/gallery") {
    return knownRouteSeo({
      title: "Tuokoleane Initiative Gallery",
      description: "See real moments from Tuokoleane gatherings, Family Experience activities and Annual Sharing Day in the TI community photo gallery.",
      path: "/gallery",
      image: "/images/ti-gallery/ti-gallery-51.jpg",
      imageAlt: "Tuokoleane community members spending time together",
      pageType: "CollectionPage",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Gallery", path: "/gallery" },
      ],
    });
  }

  const listingId = decodeRouteId(pathname, "/listing/");
  if (listingId) {
    const item = kindnessPackages.find((candidate) => candidate.id === listingId);
    if (item) return listingSeo(item);
  }

  const programId = decodeRouteId(pathname, "/program/");
  if (programId) {
    const program = programs.find((candidate) => candidate.id === programId);
    if (program) return programSeo(program);
  }

  return notFoundSeo(pathname);
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  const matches = [...document.head.querySelectorAll<HTMLMetaElement>(selector)];
  const element = matches.shift() ?? document.createElement("meta");
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  matches.forEach((duplicate) => duplicate.remove());
  if (!element.isConnected) document.head.append(element);
}

export function applyRouteSeo(pathname: string) {
  if (typeof document === "undefined") return;

  const seo = getRouteSeo(pathname);
  document.documentElement.lang = "en-KE";
  document.title = seo.title;

  upsertMeta('meta[name="description"]', { name: "description", content: seo.description });
  upsertMeta('meta[name="robots"]', { name: "robots", content: seo.robots });
  upsertMeta('meta[name="googlebot"]', { name: "googlebot", content: seo.robots });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: seo.title });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: seo.description });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: seo.canonicalUrl });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: seo.openGraphType });
  upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });
  upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: "en_KE" });
  upsertMeta('meta[property="og:image"]', { property: "og:image", content: seo.imageUrl });
  upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: seo.imageAlt });
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: seo.title });
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: seo.description });
  upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: seo.imageUrl });
  upsertMeta('meta[name="twitter:image:alt"]', { name: "twitter:image:alt", content: seo.imageAlt });

  const canonicalLinks = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')];
  const canonical = canonicalLinks.shift() ?? document.createElement("link");
  canonical.rel = "canonical";
  canonical.href = seo.canonicalUrl;
  canonicalLinks.forEach((duplicate) => duplicate.remove());
  if (!canonical.isConnected) document.head.append(canonical);

  const existingScript = document.getElementById(SEO_SCRIPT_ID);
  const script = existingScript instanceof HTMLScriptElement ? existingScript : document.createElement("script");
  script.id = SEO_SCRIPT_ID;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(seo.structuredData);
  if (!script.isConnected) document.head.append(script);
}
