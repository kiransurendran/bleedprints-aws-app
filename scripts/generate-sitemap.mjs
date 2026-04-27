import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const ENV_FILE_ORDER = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
];
const STATIC_ROUTES = ["/", "/shop", "/series/summer-solstice"];
const OUTPUT_PATH = path.join(ROOT_DIR, "public", "sitemap.xml");

function readEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return readFileSync(filePath, "utf8")
    .split("\n")
    .reduce((accumulator, line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        return accumulator;
      }

      const separatorIndex = trimmedLine.indexOf("=");

      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine.slice(separatorIndex + 1).trim();

      accumulator[key] = value.replace(/^['"]|['"]$/g, "");
      return accumulator;
    }, {});
}

function readRuntimeEnv() {
  const fileEnv = ENV_FILE_ORDER.reduce((accumulator, fileName) => {
    const filePath = path.join(ROOT_DIR, fileName);
    return { ...accumulator, ...readEnvFile(filePath) };
  }, {});

  return {
    ...fileEnv,
    ...process.env,
  };
}

function extractStaticPageRoutes() {
  const staticPagesPath = path.join(ROOT_DIR, "src", "content", "staticPages.ts");

  if (!existsSync(staticPagesPath)) {
    return [];
  }

  const source = readFileSync(staticPagesPath, "utf8");

  return Array.from(source.matchAll(/slug:\s*"([^"]+)"/g)).map(
    (match) => `/${match[1]}`,
  );
}

async function fetchLiveProductRoutes(env) {
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const supabaseKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "[sitemap] Supabase URL or public key missing. Generating sitemap without dynamic product routes.",
    );
    return [];
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/products?select=slug&is_active=eq.true&order=sort_order.asc`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Supabase product fetch failed with status ${response.status}.`,
    );
  }

  const products = await response.json();

  return Array.isArray(products)
    ? products
        .map((product) => product?.slug)
        .filter((slug) => typeof slug === "string" && slug.length > 0)
        .map((slug) => `/poster/${slug}`)
    : [];
}

function buildSitemapXml(siteUrl, routes) {
  const normalizedSiteUrl = siteUrl.endsWith("/")
    ? siteUrl
    : `${siteUrl}/`;
  const urls = routes.map((route) => {
    const absoluteUrl = new URL(route, normalizedSiteUrl).toString();
    return `  <url>\n    <loc>${absoluteUrl}</loc>\n  </url>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

async function main() {
  const env = readRuntimeEnv();
  const siteUrl = env.VITE_PUBLIC_SITE_URL || "https://bleedprints.com";
  const staticPageRoutes = extractStaticPageRoutes();

  let productRoutes = [];

  try {
    productRoutes = await fetchLiveProductRoutes(env);
  } catch (error) {
    console.warn(
      `[sitemap] Unable to fetch live product routes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }

  const routes = Array.from(
    new Set([...STATIC_ROUTES, ...staticPageRoutes, ...productRoutes]),
  );
  const sitemapXml = buildSitemapXml(siteUrl, routes);

  writeFileSync(OUTPUT_PATH, sitemapXml, "utf8");
  console.info(`[sitemap] Wrote ${routes.length} routes to ${OUTPUT_PATH}`);
}

await main();
