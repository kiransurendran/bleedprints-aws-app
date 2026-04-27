import { supabase } from "@/lib/supabase/client";
import type {
  CurrencyCode,
  Product,
  ProductAvailabilityStatus,
} from "@/types/catalog";

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  collection: string;
  currency_code: CurrencyCode;
  base_price: number;
  compare_at_price: number | null;
  availability_status: ProductAvailabilityStatus;
  available_for_sale: boolean;
  availability_label: string;
  lead_time_label: string;
  badge: string | null;
  badge_class_name: string | null;
  material_summary: string | null;
  features: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_canonical_path: string | null;
  sort_order: number;
  is_active: boolean;
};

type ProductDimensionRow = {
  id: string;
  product_id: string;
  code: string;
  label: string;
  width_cm: number;
  height_cm: number;
  unit: "cm";
  amount: number;
  compare_at_amount: number | null;
  sort_order: number;
};

type ProductImageRow = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  role: "primary" | "gallery";
  position: number;
};

function mapProductRows(
  products: ProductRow[],
  dimensions: ProductDimensionRow[],
  images: ProductImageRow[],
): Product[] {
  return products
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((product) => {
      const productDimensions = dimensions
        .filter((dimension) => dimension.product_id === product.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((dimension) => ({
          id: dimension.id,
          code: dimension.code,
          label: dimension.label,
          widthCm: Number(dimension.width_cm),
          heightCm: Number(dimension.height_cm),
          unit: dimension.unit,
          price: {
            currencyCode: product.currency_code,
            amount: Number(dimension.amount),
            compareAtAmount:
              dimension.compare_at_amount === null
                ? undefined
                : Number(dimension.compare_at_amount),
          },
        }));

      const imageRecords = images
        .filter((image) => image.product_id === product.id)
        .sort((a, b) => a.position - b.position);

      const primaryImageRecord =
        imageRecords.find((image) => image.role === "primary") ?? imageRecords[0];
      const galleryImages = imageRecords
        .filter((image) => image.id !== primaryImageRecord?.id)
        .map((image) => ({
          id: image.id,
          src: image.image_url,
          alt: image.alt_text || `${product.title} gallery image`,
          role: "gallery" as const,
        }));

      const defaultPricing = productDimensions[0]?.price ?? {
        currencyCode: product.currency_code,
        amount: Number(product.base_price),
        compareAtAmount:
          product.compare_at_price === null
            ? undefined
            : Number(product.compare_at_price),
      };

      return {
        databaseId: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        pricing: defaultPricing,
        dimensions: productDimensions,
        availability: {
          status: product.availability_status,
          availableForSale: product.available_for_sale,
          statusLabel: product.availability_label,
          leadTimeLabel: product.lead_time_label,
        },
        imageSet: {
          primary: {
            id: primaryImageRecord?.id ?? `${product.slug}-primary`,
            src: primaryImageRecord?.image_url ?? "",
            alt: primaryImageRecord?.alt_text || `${product.title} primary image`,
            role: "primary",
          },
          gallery: galleryImages,
        },
        seo: {
          title: product.seo_title || `${product.title} | BleedPrints`,
          description: product.seo_description || product.description,
          canonicalPath: product.seo_canonical_path || `/poster/${product.slug}`,
          ogImage: primaryImageRecord?.image_url ?? "",
        },
        collection: product.collection,
        badge: product.badge || undefined,
        badgeClassName: product.badge_class_name || undefined,
        materialSummary: product.material_summary || "",
        features: product.features || [],
      };
    });
}

async function fetchProductsFromSupabase(): Promise<Product[]> {
  if (!supabase) {
    return [];
  }

  const { data: products, error: productError } = await supabase
    .from("products")
    .select(
      "id, slug, title, description, collection, currency_code, base_price, compare_at_price, availability_status, available_for_sale, availability_label, lead_time_label, badge, badge_class_name, material_summary, features, seo_title, seo_description, seo_canonical_path, sort_order, is_active",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (productError) {
    throw productError;
  }

  if (!products || products.length === 0) {
    return [];
  }

  const productIds = products.map((product) => product.id);

  const [{ data: dimensions, error: dimensionError }, { data: images, error: imageError }] =
    await Promise.all([
      supabase
        .from("product_dimensions")
        .select(
          "id, product_id, code, label, width_cm, height_cm, unit, amount, compare_at_amount, sort_order",
        )
        .in("product_id", productIds)
        .order("sort_order", { ascending: true }),
      supabase
        .from("product_images")
        .select("id, product_id, image_url, alt_text, role, position")
        .in("product_id", productIds)
        .order("position", { ascending: true }),
    ]);

  if (dimensionError) {
    throw dimensionError;
  }

  if (imageError) {
    throw imageError;
  }

  return mapProductRows(
    products as ProductRow[],
    (dimensions ?? []) as ProductDimensionRow[],
    (images ?? []) as ProductImageRow[],
  );
}

export async function listStorefrontProducts() {
  try {
    return await fetchProductsFromSupabase();
  } catch (error) {
    console.error("Unable to load storefront products:", error);
    return [];
  }
}

export async function getStorefrontProductBySlug(slug: string) {
  const products = await listStorefrontProducts();
  return products.find((product) => product.slug === slug);
}
