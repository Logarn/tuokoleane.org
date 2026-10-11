import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const origin = "https://tuokoleane.org";
const [indexHtml, robotsTxt, sitemapXml, dataSource] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../public/robots.txt", import.meta.url), "utf8"),
  readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
  readFile(new URL("../src/data.ts", import.meta.url), "utf8"),
]);

const packagesStart = dataSource.indexOf("export const kindnessPackages");
const programsStart = dataSource.indexOf("export const programs");
assert(packagesStart >= 0 && programsStart > packagesStart, "Could not locate catalogue exports in src/data.ts");

const extractIds = (source) => [...source.matchAll(/^\s+id: "([^"]+)",$/gm)].map((match) => match[1]);
const listingIds = extractIds(dataSource.slice(packagesStart, programsStart));
const programIds = extractIds(dataSource.slice(programsStart));
const expectedPaths = [
  "/",
  "/about",
  "/gallery",
  ...listingIds.map((id) => `/listing/${id}`),
  ...programIds.map((id) => `/program/${id}`),
];

const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapPaths = sitemapUrls.map((url) => new URL(url).pathname);

assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, "Sitemap URLs must be unique");
assert.deepEqual(sitemapPaths, expectedPaths, "Sitemap must match every canonical public route in src/data.ts");
assert(sitemapUrls.every((url) => url === `${origin}/` || url.startsWith(`${origin}/`)), "Every sitemap URL must use the production origin");
assert(sitemapUrls.every((url) => !url.includes("?") && !url.includes("#")), "Sitemap URLs must not contain queries or fragments");
assert(sitemapPaths.every((path) => path === "/" || !path.endsWith("/")), "Only the homepage may end with a slash");

assert.match(robotsTxt, /^User-agent: \*$/m);
assert.match(robotsTxt, /^Allow: \/$/m);
assert.match(robotsTxt, /^Disallow: \/api\/$/m);
assert.match(robotsTxt, new RegExp(`^Sitemap: ${origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/sitemap\\.xml$`, "m"));

assert.match(indexHtml, /<html lang="en-KE">/);
assert.match(indexHtml, new RegExp(`<link rel="canonical" href="${origin}/"`));
assert.match(indexHtml, /<meta property="og:title"/);
assert.match(indexHtml, /<meta name="twitter:card" content="summary_large_image"/);
assert.match(indexHtml, /<script id="tuokoleane-structured-data" type="application\/ld\+json">/);

const structuredDataMatch = indexHtml.match(/<script id="tuokoleane-structured-data" type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
assert(structuredDataMatch, "Organization JSON-LD must be present");
const structuredData = JSON.parse(structuredDataMatch[1]);
assert.equal(structuredData["@type"], "Organization");
assert.equal(structuredData.url, `${origin}/`);

console.log(`SEO validation passed for ${sitemapUrls.length} canonical public routes.`);
