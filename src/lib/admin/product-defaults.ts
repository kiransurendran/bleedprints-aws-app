const defaultSeoSuffix = "BleedPrints";

export const defaultCmsBasePrice = "200";
export const defaultCmsCompareAtPrice = "249";
export const defaultCmsBadgeClass = "bg-inverse-surface text-inverse-on-surface";

export function slugifyProductTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildSeoTitle(title: string) {
  const trimmedTitle = title.trim();
  return trimmedTitle ? `${trimmedTitle} | ${defaultSeoSuffix}` : `New Poster | ${defaultSeoSuffix}`;
}

export function buildSeoDescription(title: string, slug: string) {
  const trimmedTitle = title.trim() || "this poster";
  const slugLabel = slug
    .split("-")
    .filter(Boolean)
    .join(" ");

  return `Shop ${trimmedTitle} from BleedPrints. Explore premium wall art, collectible poster editions, and design-led prints inspired by ${slugLabel || "our latest collection"}.`;
}

export function buildCanonicalPath(slug: string) {
  return `/poster/${slug || "new-poster"}`;
}

export function buildDefaultBadge(title: string) {
  return title.trim() ? "New Drop" : "Featured";
}

export function buildDefaultImageAlt(
  title: string,
  index: number,
  role: "primary" | "gallery",
) {
  const safeTitle = title.trim() || "BleedPrints poster";

  if (role === "primary" && index === 0) {
    return `${safeTitle} primary artwork`;
  }

  return `${safeTitle} gallery image ${index + 1}`;
}
