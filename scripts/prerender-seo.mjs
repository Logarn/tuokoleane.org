import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build as viteBuild } from "vite";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(repoRoot, "dist");
const templatePath = path.join(distRoot, "index.html");
const dataPath = path.join(repoRoot, "src", "data.ts");
const seoPath = path.join(repoRoot, "src", "seo.ts");
const vercelConfigPath = path.join(repoRoot, "vercel.json");
const sitemapPath = path.join(repoRoot, "public", "sitemap.xml");
const validateOnly = process.argv.includes("--validate-only");
const printCspHashes = process.argv.includes("--print-csp-hashes");
const preparePublicFiles = process.argv.includes("--prepare");

function extractRouteIds(dataSource) {
  const packagesStart = dataSource.indexOf("export const kindnessPackages");
  const programsStart = dataSource.indexOf("export const programs");
  assert(packagesStart >= 0 && programsStart > packagesStart, "Could not locate catalogue exports in src/data.ts");

  const extractIds = (source) => [...source.matchAll(/^\s+id: "([a-z0-9-]+)",$/gm)].map((match) => match[1]);
  return {
    listingIds: extractIds(dataSource.slice(packagesStart, programsStart)),
    programIds: extractIds(dataSource.slice(programsStart)),
  };
}

function outputPathForRoute(route) {
  if (route === "/") return templatePath;
  const segments = route.slice(1).split("/");
  assert(segments.every((segment) => /^[a-z0-9-]+$/.test(segment)), `Unsafe SEO route: ${route}`);
  return path.join(distRoot, ...segments.slice(0, -1), `${segments.at(-1)}.html`);
}

function publicRoutesFromData(dataSource) {
  const { listingIds, programIds } = extractRouteIds(dataSource);
  const routes = [
    "/",
    "/about",
    "/gallery",
    ...listingIds.map((id) => `/listing/${id}`),
    ...programIds.map((id) => `/program/${id}`),
  ];
  assert.equal(new Set(routes).size, routes.length, "SEO routes must be unique");
  return routes;
}

function renderSitemap(routes) {
  const entries = routes.map((route) => {
    const url = route === "/" ? "https://tuokoleane.org/" : `https://tuokoleane.org${route}`;
    return `  <url><loc>${url}</loc></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function structuredDataCspHash(structuredData) {
  return `sha256-${createHash("sha256").update(safeJson(structuredData), "utf8").digest("base64")}`;
}

function stripTemplateSeo(html) {
  return html
    .replace(/\s*<title>[\s\S]*?<\/title>\s*/gi, "\n")
    .replace(/\s*<meta\b(?=[^>]*\bname=["'](?:description|robots|googlebot|twitter:[^"']+)["'])[^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\b(?=[^>]*\bproperty=["']og:[^"']+["'])[^>]*>\s*/gi, "\n")
    .replace(/\s*<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, "\n")
    .replace(/\s*<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>\s*/gi, "\n");
}

function renderRouteHtml(template, seo) {
  const metadata = [
    `    <title>${escapeHtml(seo.title)}</title>`,
    `    <meta name="description" content="${escapeHtml(seo.description)}" />`,
    `    <meta name="robots" content="${escapeHtml(seo.robots)}" />`,
    `    <meta name="googlebot" content="${escapeHtml(seo.robots)}" />`,
    `    <link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`,
    "",
    `    <meta property="og:type" content="${escapeHtml(seo.openGraphType)}" />`,
    "    <meta property=\"og:locale\" content=\"en_KE\" />",
    "    <meta property=\"og:site_name\" content=\"Tuokoleane Initiative\" />",
    `    <meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `    <meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />`,
    `    <meta property="og:image" content="${escapeHtml(seo.imageUrl)}" />`,
    `    <meta property="og:image:alt" content="${escapeHtml(seo.imageAlt)}" />`,
    "",
    "    <meta name=\"twitter:card\" content=\"summary_large_image\" />",
    `    <meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `    <meta name="twitter:image" content="${escapeHtml(seo.imageUrl)}" />`,
    `    <meta name="twitter:image:alt" content="${escapeHtml(seo.imageAlt)}" />`,
    "",
    `    <script id="tuokoleane-structured-data" type="application/ld+json">${safeJson(seo.structuredData)}</script>`,
  ].join("\n");

  const withoutSeo = stripTemplateSeo(template).replace(/<html\b[^>]*>/i, '<html lang="en-KE">');
  assert(withoutSeo.includes("</head>"), "Built index.html does not contain a closing head element");
  return withoutSeo.replace("</head>", `${metadata}\n  </head>`);
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function assertNoIncompleteEvents(value) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach(assertNoIncompleteEvents);
    return;
  }

  if (value["@type"] === "Event") {
    assert(value.location, "Event structured data must include a confirmed location");
  }
  Object.values(value).forEach(assertNoIncompleteEvents);
}

function getConfiguredScriptHashes(vercelConfig) {
  const globalHeaders = vercelConfig.headers?.find((entry) => entry.source === "/(.*)")?.headers;
  const csp = globalHeaders?.find((header) => header.key.toLowerCase() === "content-security-policy")?.value;
  assert(csp, "vercel.json must define a global Content-Security-Policy header");

  const scriptDirective = csp
    .split(";")
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith("script-src "));
  assert(scriptDirective, "Content-Security-Policy must define script-src");
  return new Set(
    scriptDirective
      .slice("script-src ".length)
      .split(/\s+/)
      .map((token) => token.replace(/^'|'$/g, ""))
      .filter((token) => token.startsWith("sha256-")),
  );
}

function validateCspHashes(routeMetadata, vercelConfig) {
  const expectedHashes = new Set(routeMetadata.map(({ seo }) => structuredDataCspHash(seo.structuredData)));
  const configuredHashes = getConfiguredScriptHashes(vercelConfig);

  assert.deepEqual(
    [...configuredHashes].sort(),
    [...expectedHashes].sort(),
    "Vercel script-src hashes must exactly match the generated route JSON-LD. Run `bun run seo:csp` and update vercel.json deliberately.",
  );

  for (const { route, seo } of routeMetadata) {
    const hash = structuredDataCspHash(seo.structuredData);
    assert(configuredHashes.has(hash), `${route} JSON-LD hash is missing from the Vercel CSP`);
  }
  return expectedHashes;
}

function validateRouteHtml(html, route, seo) {
  assert.match(html, /<html lang="en-KE">/i, `${route} must declare en-KE`);
  assert.equal(countMatches(html, /<title>[\s\S]*?<\/title>/gi), 1, `${route} must have one title`);
  assert(html.includes(`<title>${escapeHtml(seo.title)}</title>`), `${route} has the wrong title`);
  assert.equal(countMatches(html, /<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/gi), 1, `${route} must have one description`);
  assert.equal(countMatches(html, /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi), 1, `${route} must have one canonical`);
  assert(html.includes(`rel="canonical" href="${escapeHtml(seo.canonicalUrl)}"`), `${route} has the wrong canonical`);
  assert.equal(countMatches(html, /<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/gi), 1, `${route} must have one Open Graph title`);
  assert.equal(countMatches(html, /<meta\b(?=[^>]*\bname=["']twitter:title["'])[^>]*>/gi), 1, `${route} must have one Twitter title`);
  assert.equal(countMatches(html, /<script\b(?=[^>]*\bid=["']tuokoleane-structured-data["'])[^>]*>[\s\S]*?<\/script>/gi), 1, `${route} must have one structured data graph`);

  const structuredDataMatch = html.match(/<script\b(?=[^>]*\bid=["']tuokoleane-structured-data["'])[^>]*>([\s\S]*?)<\/script>/i);
  assert(structuredDataMatch, `${route} structured data is missing`);
  const structuredData = JSON.parse(structuredDataMatch[1]);
  assert.deepEqual(structuredData, seo.structuredData, `${route} structured data does not match src/seo.ts`);
  assertNoIncompleteEvents(structuredData);
}

async function loadSeoRegistry() {
  const bundleRoot = await mkdtemp(path.join(tmpdir(), "tuokoleane-seo-"));
  try {
    await viteBuild({
      configFile: false,
      logLevel: "error",
      root: repoRoot,
      ssr: { noExternal: true },
      build: {
        ssr: seoPath,
        outDir: bundleRoot,
        emptyOutDir: true,
        rollupOptions: {
          output: {
            entryFileNames: "seo.mjs",
            chunkFileNames: "chunks/[name]-[hash].mjs",
          },
        },
      },
    });
    const moduleUrl = `${pathToFileURL(path.join(bundleRoot, "seo.mjs")).href}?build=${Date.now()}`;
    const seoModule = await import(moduleUrl);
    assert.equal(typeof seoModule.getRouteSeo, "function", "src/seo.ts must export getRouteSeo");
    return { getRouteSeo: seoModule.getRouteSeo, cleanup: () => rm(bundleRoot, { recursive: true, force: true }) };
  } catch (error) {
    await rm(bundleRoot, { recursive: true, force: true });
    throw error;
  }
}

async function main() {
  const dataSource = await readFile(dataPath, "utf8");
  const routes = publicRoutesFromData(dataSource);

  if (preparePublicFiles) {
    await writeFile(sitemapPath, renderSitemap(routes), "utf8");
    console.log(`Generated sitemap.xml for ${routes.length} canonical public routes.`);
    return;
  }

  const { getRouteSeo, cleanup } = await loadSeoRegistry();
  try {
    const routeMetadata = routes.map((route) => ({ route, seo: getRouteSeo(route) }));
    assert.equal(new Set(routeMetadata.map(({ seo }) => seo.title)).size, routes.length, "Every public route must have a unique title");
    assert.equal(new Set(routeMetadata.map(({ seo }) => seo.canonicalUrl)).size, routes.length, "Every public route must have a unique canonical URL");

    const expectedHashes = new Set(routeMetadata.map(({ seo }) => structuredDataCspHash(seo.structuredData)));
    if (printCspHashes) {
      console.log([...expectedHashes].sort().map((hash) => `'${hash}'`).join(" "));
      return;
    }

    const [template, vercelConfigSource] = await Promise.all([
      readFile(templatePath, "utf8"),
      readFile(vercelConfigPath, "utf8"),
    ]);
    validateCspHashes(routeMetadata, JSON.parse(vercelConfigSource));

    for (const { route, seo } of routeMetadata) {
      const outputPath = outputPathForRoute(route);
      if (!validateOnly) {
        const html = renderRouteHtml(template, seo);
        await mkdir(path.dirname(outputPath), { recursive: true });
        await writeFile(outputPath, html, "utf8");
      }
      const generatedHtml = await readFile(outputPath, "utf8");
      validateRouteHtml(generatedHtml, route, seo);
    }
  } finally {
    await cleanup();
  }

  console.log(`${validateOnly ? "Validated" : "Generated and validated"} ${routes.length} route-specific SEO HTML files.`);
}

await main();
