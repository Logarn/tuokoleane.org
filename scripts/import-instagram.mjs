import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const [postUrl, outputDirectory] = process.argv.slice(2);

if (!postUrl || !outputDirectory) {
  console.error("Usage: node scripts/import-instagram.mjs <instagram-post-url> <output-directory>");
  process.exit(1);
}

const response = await fetch("https://api.instasave.website/media", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ url: postUrl }),
});

if (!response.ok) {
  throw new Error(`InstaSave returned ${response.status} for ${postUrl}`);
}

const body = await response.text();
const downloadUrls = [...body.matchAll(/https:\/\/cdn\.instasave\.website\/\?token=[A-Za-z0-9._-]+/g)]
  .map(([url]) => url)
  .filter((url) => {
    const token = new URL(url).searchParams.get("token");
    if (!token) return false;
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return payload.force === true;
  });

if (downloadUrls.length === 0) {
  throw new Error(`No downloadable media found for ${postUrl}`);
}

await mkdir(outputDirectory, { recursive: true });

for (const [index, url] of downloadUrls.entries()) {
  const mediaResponse = await fetch(url);
  if (!mediaResponse.ok) {
    throw new Error(`Media ${index + 1} returned ${mediaResponse.status}`);
  }
  const extension = mediaResponse.headers.get("content-type")?.includes("webp") ? "webp" : "jpg";
  const filename = `${String(index + 1).padStart(2, "0")}.${extension}`;
  await writeFile(path.join(outputDirectory, filename), Buffer.from(await mediaResponse.arrayBuffer()));
  console.log(filename);
}

await writeFile(
  path.join(outputDirectory, "source.json"),
  `${JSON.stringify({ source: postUrl, importedVia: "https://instasave.website", importedAt: new Date().toISOString() }, null, 2)}\n`,
);
