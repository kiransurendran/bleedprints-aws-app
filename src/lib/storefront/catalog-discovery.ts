import type { Product } from "@/types/catalog";

export const storefrontSortOptions = [
  { slug: "featured", label: "Curator's order" },
  { slug: "price-asc", label: "Price: Low to High" },
  { slug: "price-desc", label: "Price: High to Low" },
  { slug: "title-asc", label: "Title: A to Z" },
] as const;

export type StorefrontSortSlug = (typeof storefrontSortOptions)[number]["slug"];

export function getStorefrontSearchQuery(query: string | null) {
  return query?.trim() ?? "";
}

export function getStorefrontSortBySlug(
  sort: string | null,
): StorefrontSortSlug {
  return (
    storefrontSortOptions.find((option) => option.slug === sort)?.slug ??
    "featured"
  );
}

export function filterStorefrontProductsBySearch(
  products: Product[],
  query: string,
) {
  const normalizedQuery = getStorefrontSearchQuery(query).toLowerCase();

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) => {
    const searchableText = [
      product.title,
      product.description,
      product.collection,
      product.materialSummary,
      product.badge,
      ...product.features,
      ...product.dimensions.map((dimension) => dimension.label),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

export function sortStorefrontProducts(
  products: Product[],
  sort: StorefrontSortSlug,
) {
  const nextProducts = [...products];

  switch (sort) {
    case "price-asc":
      return nextProducts.sort(
        (left, right) => left.pricing.amount - right.pricing.amount,
      );
    case "price-desc":
      return nextProducts.sort(
        (left, right) => right.pricing.amount - left.pricing.amount,
      );
    case "title-asc":
      return nextProducts.sort((left, right) =>
        left.title.localeCompare(right.title),
      );
    case "featured":
    default:
      return nextProducts;
  }
}
