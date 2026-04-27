import type { Product } from '@/types/catalog';

export type StorefrontCollectionSlug =
  | 'all'
  | 'abstract'
  | 'minimalist'
  | 'photography'
  | 'vintage'
  | 'pop-art';

export type StorefrontCollectionFilter = {
  slug: StorefrontCollectionSlug;
  label: string;
  heading: string;
  icon: string;
};

export const storefrontCollectionFilters: StorefrontCollectionFilter[] = [
  { slug: 'all', label: 'All Prints', heading: 'Curated Prints', icon: 'grid_view' },
  { slug: 'abstract', label: 'Abstract', heading: 'Abstract Prints', icon: 'brush' },
  { slug: 'minimalist', label: 'Minimalist', heading: 'Minimalist Prints', icon: 'filter_hdr' },
  { slug: 'photography', label: 'Photography', heading: 'Photography Prints', icon: 'photo_camera' },
  { slug: 'vintage', label: 'Vintage', heading: 'Vintage Prints', icon: 'history' },
  { slug: 'pop-art', label: 'Pop Art', heading: 'Pop Art Prints', icon: 'palette' },
];

const collectionKeywords: Record<Exclude<StorefrontCollectionSlug, 'all'>, string[]> = {
  abstract: [
    'abstract',
    'archival ink',
    'fine art',
    'brutalist',
    'chromatic',
    'fluid',
    'graphic',
    'lightfall',
    'concrete',
    'nocturne',
  ],
  minimalist: ['minimalist', 'soft minimalism', 'zen'],
  photography: ['photography', 'photographic', 'photo', 'landscape', 'architectural'],
  vintage: ['vintage', 'retro', 'nostalg', 'aged', 'classic'],
  'pop-art': ['pop art', 'pop-art', 'neon'],
};

const collectionAliases: Record<Exclude<StorefrontCollectionSlug, 'all'>, string[]> = {
  abstract: ['abstract'],
  minimalist: ['minimalist'],
  photography: ['photography'],
  vintage: ['vintage'],
  'pop-art': ['pop art', 'pop-art'],
};

export const defaultStorefrontCollection = storefrontCollectionFilters[0];

export function getStorefrontCollectionBySlug(slug: string | null | undefined) {
  return (
    storefrontCollectionFilters.find((collection) => collection.slug === slug) ??
    defaultStorefrontCollection
  );
}

export function matchesStorefrontCollection(
  product: Product,
  collectionSlug: StorefrontCollectionSlug,
) {
  if (collectionSlug === 'all') return true;

  const normalizedCollection = product.collection.trim().toLowerCase();
  const searchableText =
    `${product.collection} ${product.title} ${product.description}`.toLowerCase();

  if (collectionAliases[collectionSlug].includes(normalizedCollection)) {
    return true;
  }

  return collectionKeywords[collectionSlug].some((keyword) => searchableText.includes(keyword));
}
