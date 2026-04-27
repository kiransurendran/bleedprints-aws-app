export type CurrencyCode = "INR" | "USD";

export type ProductAvailabilityStatus =
  | "in-stock"
  | "low-stock"
  | "made-to-order"
  | "sold-out";

export interface ProductPricing {
  currencyCode: CurrencyCode;
  amount: number;
  compareAtAmount?: number;
}

export interface ProductDimension {
  id: string;
  code?: string;
  label: string;
  widthCm: number;
  heightCm: number;
  unit: "cm";
  price: ProductPricing;
}

export interface ProductAvailability {
  status: ProductAvailabilityStatus;
  availableForSale: boolean;
  statusLabel: string;
  leadTimeLabel: string;
}

export interface ProductImage {
  id: string;
  src: string;
  alt: string;
  role: "primary" | "gallery";
}

export interface ProductImageSet {
  primary: ProductImage;
  gallery: ProductImage[];
}

export interface ProductSeoFields {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage: string;
}

export interface Product {
  databaseId?: string;
  slug: string;
  title: string;
  description: string;
  pricing: ProductPricing;
  dimensions: ProductDimension[];
  availability: ProductAvailability;
  imageSet: ProductImageSet;
  seo: ProductSeoFields;
  collection: string;
  badge?: string;
  badgeClassName?: string;
  materialSummary: string;
  features: string[];
}
