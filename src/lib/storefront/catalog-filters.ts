import type { Product, ProductDimension } from "@/types/catalog";

import {
  matchesStorefrontCollection,
  type StorefrontCollectionSlug,
} from "@/lib/storefront/collection-filters";

export type StorefrontPrintSizeSlug = "a3" | "a4" | "a5";

export type StorefrontOrientation = "portrait" | "landscape";

export type StorefrontPrintSizeFilter = {
  slug: StorefrontPrintSizeSlug;
  label: string;
};

export type StorefrontOrientationFilter = {
  slug: StorefrontOrientation;
  label: string;
  icon: string;
};

export const storefrontPrintSizeFilters: StorefrontPrintSizeFilter[] = [
  { slug: "a3", label: "A3 (29.7 x 42 cm)" },
  { slug: "a4", label: "A4 (21.0 x 29.7 cm)" },
  { slug: "a5", label: "A5 (14.8 x 21.0 cm)" },
];

export const storefrontOrientationFilters: StorefrontOrientationFilter[] = [
  { slug: "portrait", label: "Portrait", icon: "crop_portrait" },
  { slug: "landscape", label: "Landscape", icon: "crop_landscape" },
];

const validPrintSizes = new Set<StorefrontPrintSizeSlug>(
  storefrontPrintSizeFilters.map((filter) => filter.slug),
);

const validOrientations = new Set<StorefrontOrientation>(
  storefrontOrientationFilters.map((filter) => filter.slug),
);

function normalizeDimensionValue(value: string | undefined) {
  return value?.trim().toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
}

function matchesPrintSize(dimension: ProductDimension, sizeSlug: StorefrontPrintSizeSlug) {
  return (
    normalizeDimensionValue(dimension.code) === sizeSlug ||
    normalizeDimensionValue(dimension.label) === sizeSlug
  );
}

function getDimensionOrientation(dimension: ProductDimension): StorefrontOrientation | null {
  if (dimension.widthCm === dimension.heightCm) {
    return null;
  }

  return dimension.widthCm > dimension.heightCm ? "landscape" : "portrait";
}

export function getStorefrontPrintSizes(input: string[] | null | undefined) {
  if (!input?.length) {
    return [];
  }

  const normalized = input
    .flatMap((value) => value.split(","))
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is StorefrontPrintSizeSlug =>
      validPrintSizes.has(value as StorefrontPrintSizeSlug),
    );

  return [...new Set(normalized)];
}

export function getStorefrontOrientationBySlug(
  slug: string | null | undefined,
): StorefrontOrientation | null {
  if (!slug) {
    return null;
  }

  const normalized = slug.trim().toLowerCase();
  return validOrientations.has(normalized as StorefrontOrientation)
    ? (normalized as StorefrontOrientation)
    : null;
}

export function matchesStorefrontCatalogFilters(
  product: Product,
  {
    collectionSlug,
    orientation,
    sizeSlugs,
  }: {
    collectionSlug: StorefrontCollectionSlug;
    orientation: StorefrontOrientation | null;
    sizeSlugs: StorefrontPrintSizeSlug[];
  },
) {
  if (!matchesStorefrontCollection(product, collectionSlug)) {
    return false;
  }

  const sizeMatchedDimensions =
    sizeSlugs.length > 0
      ? product.dimensions.filter((dimension) =>
          sizeSlugs.some((sizeSlug) => matchesPrintSize(dimension, sizeSlug)),
        )
      : product.dimensions;

  if (sizeSlugs.length > 0 && sizeMatchedDimensions.length === 0) {
    return false;
  }

  if (!orientation) {
    return true;
  }

  return sizeMatchedDimensions.some(
    (dimension) => getDimensionOrientation(dimension) === orientation,
  );
}
