import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Footer from "@/components/Footer";
import MaterialIcon from "@/components/MaterialIcon";
import Navbar from "@/components/Navbar";
import { toast } from "@/components/ui/use-toast";
import {
  buildCanonicalPath,
  buildDefaultBadge,
  buildDefaultImageAlt,
  buildSeoDescription,
  buildSeoTitle,
  defaultCmsBadgeClass,
  defaultCmsBasePrice,
  defaultCmsCompareAtPrice,
  slugifyProductTitle,
} from "@/lib/admin/product-defaults";
import { formatMoney } from "@/lib/money";
import { usePageMetadata } from "@/lib/seo";
import { supabase } from "@/lib/supabase/client";

type AdminProductRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  collection: string;
  currency_code: "INR" | "USD";
  base_price: number;
  compare_at_price: number | null;
  availability_status: "in-stock" | "low-stock" | "made-to-order" | "sold-out";
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
  created_at: string;
  updated_at: string;
};

type AdminCollectionRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type AdminDimensionRow = {
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

type AdminImageRow = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  role: "primary" | "gallery";
  position: number;
};

type AdminCatalogEntry = {
  product: AdminProductRow;
  dimensions: AdminDimensionRow[];
  images: AdminImageRow[];
};

type AdminNotice = {
  title: string;
  description: string;
  variant: "default" | "destructive";
};

const NEW_PRODUCT_ID = "__new__";

type ProductFormDimension = {
  id: string;
  code: string;
  label: string;
  widthCm: string;
  heightCm: string;
  amount: string;
  compareAtAmount: string;
  sortOrder: string;
};

type ProductFormImage = {
  id: string;
  imageUrl: string;
  altText: string;
  role: "primary" | "gallery";
  position: string;
};

type ProductFormState = {
  slug: string;
  title: string;
  description: string;
  collection: string;
  currencyCode: "INR" | "USD";
  basePrice: string;
  compareAtPrice: string;
  availabilityStatus: "in-stock" | "low-stock" | "made-to-order" | "sold-out";
  availableForSale: boolean;
  availabilityLabel: string;
  leadTimeLabel: string;
  badge: string;
  badgeClassName: string;
  materialSummary: string;
  featuresText: string;
  seoTitle: string;
  seoDescription: string;
  seoCanonicalPath: string;
  sortOrder: string;
  isActive: boolean;
  dimensions: ProductFormDimension[];
  images: ProductFormImage[];
};

const availabilityOptions: Array<ProductFormState["availabilityStatus"]> = [
  "in-stock",
  "low-stock",
  "made-to-order",
  "sold-out",
];

const currencyOptions: Array<ProductFormState["currencyCode"]> = ["INR", "USD"];

const createDimensionDraft = (
  overrides: Partial<ProductFormDimension> = {},
): ProductFormDimension => ({
  id: overrides.id ?? crypto.randomUUID(),
  code: overrides.code ?? "",
  label: overrides.label ?? "",
  widthCm: overrides.widthCm ?? "",
  heightCm: overrides.heightCm ?? "",
  amount: overrides.amount ?? "",
  compareAtAmount: overrides.compareAtAmount ?? "",
  sortOrder: overrides.sortOrder ?? "0",
});

const createImageDraft = (
  overrides: Partial<ProductFormImage> = {},
): ProductFormImage => ({
  id: overrides.id ?? crypto.randomUUID(),
  imageUrl: overrides.imageUrl ?? "",
  altText: overrides.altText ?? "",
  role: overrides.role ?? "gallery",
  position: overrides.position ?? "0",
});

const createEmptyProductForm = (defaultCollection = ""): ProductFormState => ({
  slug: "",
  title: "",
  description: "",
  collection: defaultCollection,
  currencyCode: "INR",
  basePrice: defaultCmsBasePrice,
  compareAtPrice: defaultCmsCompareAtPrice,
  availabilityStatus: "in-stock",
  availableForSale: true,
  availabilityLabel: "In stock",
  leadTimeLabel: "Dispatches in 2 to 4 business days.",
  badge: "Featured",
  badgeClassName: defaultCmsBadgeClass,
  materialSummary: "",
  featuresText: "",
  seoTitle: "",
  seoDescription: "",
  seoCanonicalPath: "",
  sortOrder: "0",
  isActive: true,
  dimensions: [
    createDimensionDraft({
      code: "a4",
      label: "A4",
      widthCm: "21",
      heightCm: "29.7",
      amount: defaultCmsBasePrice,
      compareAtAmount: defaultCmsCompareAtPrice,
      sortOrder: "0",
    }),
  ],
  images: [
    createImageDraft({
      role: "primary",
      position: "0",
    }),
  ],
});

function normalizeAdminError(error: unknown, fallback: string): string {
  const candidate = error as {
    code?: string;
    message?: string;
    details?: string | null;
    hint?: string | null;
  };

  const message = candidate?.message ?? fallback;
  const details = candidate?.details ? ` Details: ${candidate.details}` : "";
  const hint = candidate?.hint ? ` Hint: ${candidate.hint}` : "";
  const combined = `${message}${details}${hint}`.trim();
  const lowercase = combined.toLowerCase();

  if (
    lowercase.includes("row-level security") ||
    lowercase.includes("permission denied") ||
    candidate?.code === "42501"
  ) {
    return "Supabase is blocking writes. Run `supabase/schema.sql`, then make sure your signed-in account has role `admin` in `public.user_profiles` before opening the hidden admin studio URL.";
  }

  if (
    lowercase.includes('relation "products" does not exist') ||
    lowercase.includes('relation "public.products" does not exist') ||
    lowercase.includes('relation "collections" does not exist') ||
    lowercase.includes('relation "public.collections" does not exist') ||
    candidate?.code === "42P01"
  ) {
    return "The catalog tables do not exist yet. Run `supabase/schema.sql`, refresh the hidden admin studio route, and try again.";
  }

  if (candidate?.code === "23505" || lowercase.includes("duplicate key value")) {
    return "A product with this slug already exists. Change the slug or edit the existing product instead.";
  }

  return combined || fallback;
}

function productToForm(entry: AdminCatalogEntry): ProductFormState {
  return {
    slug: entry.product.slug,
    title: entry.product.title,
    description: entry.product.description,
    collection: entry.product.collection,
    currencyCode: entry.product.currency_code,
    basePrice: entry.product.base_price.toString(),
    compareAtPrice: entry.product.compare_at_price?.toString() ?? "",
    availabilityStatus: entry.product.availability_status,
    availableForSale: entry.product.available_for_sale,
    availabilityLabel: entry.product.availability_label,
    leadTimeLabel: entry.product.lead_time_label,
    badge: entry.product.badge ?? "",
    badgeClassName: entry.product.badge_class_name ?? "",
    materialSummary: entry.product.material_summary ?? "",
    featuresText: (entry.product.features ?? []).join("\n"),
    seoTitle: entry.product.seo_title ?? "",
    seoDescription: entry.product.seo_description ?? "",
    seoCanonicalPath: entry.product.seo_canonical_path ?? "",
    sortOrder: entry.product.sort_order.toString(),
    isActive: entry.product.is_active,
    dimensions: entry.dimensions.length
      ? entry.dimensions.map((dimension) =>
          createDimensionDraft({
            id: dimension.id,
            code: dimension.code,
            label: dimension.label,
            widthCm: dimension.width_cm.toString(),
            heightCm: dimension.height_cm.toString(),
            amount: dimension.amount.toString(),
            compareAtAmount: dimension.compare_at_amount?.toString() ?? "",
            sortOrder: dimension.sort_order.toString(),
          }),
        )
      : [createDimensionDraft()],
    images: entry.images.length
      ? entry.images.map((image) =>
          createImageDraft({
            id: image.id,
            imageUrl: image.image_url,
            altText: image.alt_text ?? "",
            role: image.role,
            position: image.position.toString(),
          }),
        )
      : [createImageDraft({ role: "primary" })],
  };
}

async function fetchAdminCatalog(): Promise<AdminCatalogEntry[]> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const [{ data: products, error: productError }, { data: dimensions, error: dimensionError }, { data: images, error: imageError }] =
    await Promise.all([
      supabase
        .from("products")
        .select(
          "id, slug, title, description, collection, currency_code, base_price, compare_at_price, availability_status, available_for_sale, availability_label, lead_time_label, badge, badge_class_name, material_summary, features, seo_title, seo_description, seo_canonical_path, sort_order, is_active, created_at, updated_at",
        )
        .order("sort_order", { ascending: true }),
      supabase
        .from("product_dimensions")
        .select(
          "id, product_id, code, label, width_cm, height_cm, unit, amount, compare_at_amount, sort_order",
        )
        .order("sort_order", { ascending: true }),
      supabase
        .from("product_images")
        .select("id, product_id, image_url, alt_text, role, position")
        .order("position", { ascending: true }),
    ]);

  if (productError) throw productError;
  if (dimensionError) throw dimensionError;
  if (imageError) throw imageError;

  return ((products ?? []) as AdminProductRow[]).map((product) => ({
    product,
    dimensions: ((dimensions ?? []) as AdminDimensionRow[])
      .filter((dimension) => dimension.product_id === product.id)
      .sort((a, b) => a.sort_order - b.sort_order),
    images: ((images ?? []) as AdminImageRow[])
      .filter((image) => image.product_id === product.id)
      .sort((a, b) => a.position - b.position),
  }));
}

async function fetchAdminCollections(): Promise<AdminCollectionRow[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, title, description, sort_order, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw error;

  return (data ?? []) as AdminCollectionRow[];
}

export default function AdminCmsPage() {
  usePageMetadata({
    title: "Admin Studio | BleedPrints",
    description: "Private BleedPrints admin studio for catalog, SEO, pricing, and image management.",
    noIndex: true,
  });

  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(createEmptyProductForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [adminNotice, setAdminNotice] = useState<AdminNotice | null>(null);

  const {
    data: catalog = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-catalog"],
    queryFn: fetchAdminCatalog,
    retry: false,
  });

  const {
    data: collections = [],
    isLoading: isCollectionsLoading,
    error: collectionsError,
  } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: fetchAdminCollections,
    enabled: Boolean(supabase),
    retry: false,
  });

  const defaultCollectionTitle = collections[0]?.title ?? "";
  const selectedEntry = useMemo(
    () => catalog.find((entry) => entry.product.id === selectedProductId) ?? null,
    [catalog, selectedProductId],
  );
  const isCreatingNew = selectedProductId === NEW_PRODUCT_ID;
  const collectionOptions = useMemo(() => {
    const options = collections.map((collection) => collection.title);
    const currentCollection = form.collection.trim();

    if (currentCollection && !options.includes(currentCollection)) {
      return [currentCollection, ...options];
    }

    return options;
  }, [collections, form.collection]);

  useEffect(() => {
    if (isCreatingNew) {
      return;
    }

    if (!catalog.length) {
      if (!selectedProductId) {
        setForm(createEmptyProductForm(defaultCollectionTitle));
      }
      return;
    }

    if (selectedProductId && selectedEntry) {
      return;
    }

    const firstEntry = catalog[0];
    setSelectedProductId(firstEntry.product.id);
    setForm(productToForm(firstEntry));
  }, [catalog, defaultCollectionTitle, isCreatingNew, selectedEntry, selectedProductId]);

  useEffect(() => {
    if (!defaultCollectionTitle) {
      return;
    }

    setForm((current) => {
      if (current.collection.trim()) {
        return current;
      }

      if (selectedEntry && !isCreatingNew) {
        return current;
      }

      return {
        ...current,
        collection: defaultCollectionTitle,
      };
    });
  }, [defaultCollectionTitle, isCreatingNew, selectedEntry]);

  const syncSelectedProduct = (productId: string | null) => {
    if (productId === NEW_PRODUCT_ID) {
      setSelectedProductId(NEW_PRODUCT_ID);
      setForm(createEmptyProductForm(defaultCollectionTitle));
      return;
    }

    setSelectedProductId(productId);

    if (!productId) {
      setForm(createEmptyProductForm(defaultCollectionTitle));
      return;
    }

    const entry = catalog.find((catalogEntry) => catalogEntry.product.id === productId);
    if (entry) {
      setForm(productToForm(entry));
    }
  };

  const updateForm = <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateDimension = (
    id: string,
    key: keyof ProductFormDimension,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      dimensions: current.dimensions.map((dimension) =>
        dimension.id === id ? { ...dimension, [key]: value } : dimension,
      ),
    }));
  };

  const updateImage = (id: string, key: keyof ProductFormImage, value: string) => {
    setForm((current) => ({
      ...current,
      images: current.images.map((image) =>
        image.id === id
          ? {
              ...image,
              [key]:
                key === "role"
                  ? (value as ProductFormImage["role"])
                  : value,
            }
          : image,
      ),
    }));
  };

  const handleTitleChange = (value: string) => {
    setForm((current) => {
      const previousGeneratedSeoTitle = buildSeoTitle(current.title);
      const previousGeneratedSeoDescription = buildSeoDescription(
        current.title,
        current.slug,
      );
      const previousGeneratedCanonical = buildCanonicalPath(current.slug);
      const previousGeneratedBadge = buildDefaultBadge(current.title);
      const nextSlug = current.slug.trim() || slugifyProductTitle(value);
      const nextGeneratedSeoTitle = buildSeoTitle(value);
      const nextGeneratedSeoDescription = buildSeoDescription(value, nextSlug);

      return {
        ...current,
        title: value,
        slug: current.slug.trim() ? current.slug : nextSlug,
        badge:
          !current.badge.trim() || current.badge === previousGeneratedBadge
            ? buildDefaultBadge(value)
            : current.badge,
        badgeClassName: current.badgeClassName.trim() || defaultCmsBadgeClass,
        seoTitle:
          !current.seoTitle.trim() || current.seoTitle === previousGeneratedSeoTitle
            ? nextGeneratedSeoTitle
            : current.seoTitle,
        seoDescription:
          !current.seoDescription.trim() ||
          current.seoDescription === previousGeneratedSeoDescription
            ? nextGeneratedSeoDescription
            : current.seoDescription,
        seoCanonicalPath:
          !current.seoCanonicalPath.trim() ||
          current.seoCanonicalPath === previousGeneratedCanonical
            ? buildCanonicalPath(nextSlug)
            : current.seoCanonicalPath,
        images: current.images.map((image, index) => {
          const previousAlt = buildDefaultImageAlt(
            current.title,
            index,
            image.role,
          );
          const nextAlt = buildDefaultImageAlt(value, index, image.role);

          return !image.altText.trim() || image.altText === previousAlt
            ? { ...image, altText: nextAlt }
            : image;
        }),
      };
    });
  };

  const handleSlugChange = (value: string) => {
    setForm((current) => {
      const normalizedSlug = slugifyProductTitle(value);
      const previousGeneratedSeoDescription = buildSeoDescription(
        current.title,
        current.slug,
      );
      const previousGeneratedCanonical = buildCanonicalPath(current.slug);
      const nextGeneratedSeoDescription = buildSeoDescription(
        current.title,
        normalizedSlug,
      );

      return {
        ...current,
        slug: normalizedSlug,
        seoDescription:
          !current.seoDescription.trim() ||
          current.seoDescription === previousGeneratedSeoDescription
            ? nextGeneratedSeoDescription
            : current.seoDescription,
        seoCanonicalPath:
          !current.seoCanonicalPath.trim() ||
          current.seoCanonicalPath === previousGeneratedCanonical
            ? buildCanonicalPath(normalizedSlug)
            : current.seoCanonicalPath,
      };
    });
  };

  const handleBasePriceChange = (value: string) => {
    setForm((current) => {
      const previousBasePrice = current.basePrice || defaultCmsBasePrice;

      return {
        ...current,
        basePrice: value,
        dimensions: current.dimensions.map((dimension) =>
          !dimension.amount.trim() || dimension.amount === previousBasePrice
            ? { ...dimension, amount: value }
            : dimension,
        ),
      };
    });
  };

  const handleCompareAtPriceChange = (value: string) => {
    setForm((current) => {
      const previousCompareAtPrice =
        current.compareAtPrice || defaultCmsCompareAtPrice;

      return {
        ...current,
        compareAtPrice: value,
        dimensions: current.dimensions.map((dimension) =>
          !dimension.compareAtAmount.trim() ||
          dimension.compareAtAmount === previousCompareAtPrice
            ? { ...dimension, compareAtAmount: value }
            : dimension,
        ),
      };
    });
  };

  const ensurePrimaryImage = (images: ProductFormImage[]) => {
    const activeImages = images.filter((image) => image.imageUrl.trim());
    if (activeImages.length === 0) {
      return activeImages;
    }

    const firstPrimary = activeImages.findIndex((image) => image.role === "primary");

    return activeImages.map((image, index) => ({
      ...image,
      role: index === (firstPrimary >= 0 ? firstPrimary : 0) ? "primary" : "gallery",
    }));
  };

  const handleSaveProduct = async () => {
    if (!supabase) {
      setAdminNotice({
        title: "Supabase is not configured",
        description:
          "Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to your `.env`, then restart the dev server.",
        variant: "destructive",
      });
      toast({
        title: "Supabase is not configured",
        description: "Add your Supabase URL and anon key before using the admin studio.",
      });
      return;
    }

    if (!form.slug.trim() || !form.title.trim() || !form.description.trim()) {
      toast({
        title: "Missing product basics",
        description: "Slug, title, and description are required.",
      });
      return;
    }

    const validDimensions = form.dimensions.filter(
      (dimension) =>
        dimension.code.trim() &&
        dimension.label.trim() &&
        dimension.amount.trim() &&
        dimension.widthCm.trim() &&
        dimension.heightCm.trim(),
    );

    if (validDimensions.length === 0) {
      toast({
        title: "Add at least one dimension",
        description: "Each product needs at least one size/price combination.",
      });
      return;
    }

    const validImages = ensurePrimaryImage(form.images);
    if (validImages.length === 0) {
      toast({
        title: "Add at least one image",
        description: "Paste an image URL or upload into Supabase Storage.",
      });
      return;
    }

    setIsSaving(true);
    setAdminNotice(null);

    try {
      const isEditingExisting = Boolean(selectedProductId && !isCreatingNew);
      const normalizedSlug = form.slug.trim() || slugifyProductTitle(form.title);
      const normalizedTitle = form.title.trim();
      const productPayload = {
        slug: normalizedSlug,
        title: normalizedTitle,
        description: form.description.trim(),
        collection: form.collection.trim() || "Uncategorized",
        currency_code: form.currencyCode,
        base_price: Number(form.basePrice || defaultCmsBasePrice),
        compare_at_price: Number(form.compareAtPrice || defaultCmsCompareAtPrice),
        availability_status: form.availabilityStatus,
        available_for_sale: form.availableForSale,
        availability_label: form.availabilityLabel.trim() || "In stock",
        lead_time_label:
          form.leadTimeLabel.trim() || "Dispatches in 2 to 4 business days.",
        badge: form.badge.trim() || buildDefaultBadge(normalizedTitle),
        badge_class_name: form.badgeClassName.trim() || defaultCmsBadgeClass,
        material_summary: form.materialSummary.trim() || null,
        features: form.featuresText
          .split("\n")
          .map((feature) => feature.trim())
          .filter(Boolean),
        seo_title: form.seoTitle.trim() || buildSeoTitle(normalizedTitle),
        seo_description:
          form.seoDescription.trim() || buildSeoDescription(normalizedTitle, normalizedSlug),
        seo_canonical_path:
          form.seoCanonicalPath.trim() || buildCanonicalPath(normalizedSlug),
        sort_order: Number(form.sortOrder || 0),
        is_active: form.isActive,
      };

      let productId = selectedProductId;

      if (isEditingExisting) {
        const { error: updateError } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", selectedProductId);

        if (updateError) throw updateError;
      } else {
        const { data: insertedProduct, error: insertError } = await supabase
          .from("products")
          .insert(productPayload)
          .select("id")
          .single();

        if (insertError || !insertedProduct) {
          throw insertError ?? new Error("Product could not be created.");
        }

        productId = insertedProduct.id;
      }

      if (!productId) {
        throw new Error("Product id is missing after save.");
      }

      await Promise.all([
        supabase.from("product_dimensions").delete().eq("product_id", productId),
        supabase.from("product_images").delete().eq("product_id", productId),
      ]);

      const { error: dimensionsError } = await supabase.from("product_dimensions").insert(
        validDimensions.map((dimension, index) => ({
          product_id: productId,
          code: dimension.code.trim(),
          label: dimension.label.trim(),
          width_cm: Number(dimension.widthCm),
          height_cm: Number(dimension.heightCm),
          unit: "cm",
          amount: Number(dimension.amount),
          compare_at_amount: dimension.compareAtAmount
            ? Number(dimension.compareAtAmount)
            : null,
          sort_order: Number(dimension.sortOrder || index),
        })),
      );

      if (dimensionsError) throw dimensionsError;

      const { error: imagesError } = await supabase.from("product_images").insert(
        validImages.map((image, index) => ({
          product_id: productId,
          image_url: image.imageUrl.trim(),
          alt_text:
            image.altText.trim() ||
            buildDefaultImageAlt(normalizedTitle, index, image.role),
          role: image.role,
          position: Number(image.position || index),
        })),
      );

      if (imagesError) throw imagesError;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-catalog"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product"] }),
      ]);
      await refetch();
      syncSelectedProduct(productId);

      toast({
        title: isEditingExisting ? "Product updated" : "Product created",
        description: `${form.title || form.slug} is now synced to Supabase.`,
      });
      setAdminNotice({
        title: isEditingExisting ? "Product updated" : "Product created",
        description: `${form.title || form.slug} was saved successfully and is now available to the storefront query layer.`,
        variant: "default",
      });
    } catch (saveError) {
      console.error(saveError);
      const message = normalizeAdminError(
        saveError,
        "Please check your admin role and Supabase schema, then try again.",
      );
      toast({
        title: "Unable to save product",
        description: message,
      });
      setAdminNotice({
        title: "Product save failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!supabase || !selectedProductId || !selectedEntry) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${selectedEntry.product.title}" from Supabase? This also removes its dimensions and image records.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setAdminNotice(null);

    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", selectedProductId);

      if (deleteError) throw deleteError;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-catalog"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product"] }),
      ]);
      await refetch();
      syncSelectedProduct(null);

      toast({
        title: "Product deleted",
        description: "The product and its linked records were removed from Supabase.",
      });
      setAdminNotice({
        title: "Product deleted",
        description: "The selected product and its linked dimensions/images were removed from Supabase.",
        variant: "default",
      });
    } catch (deleteError) {
      console.error(deleteError);
      const message = normalizeAdminError(
        deleteError,
        "Please review your admin role and write policies.",
      );
      toast({
        title: "Unable to delete product",
        description: message,
      });
      setAdminNotice({
        title: "Delete failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadImages = async (files: FileList | null) => {
    if (!supabase || !files?.length) {
      return;
    }

    const baseSlug = form.slug.trim() || "draft-product";
    setIsUploading(true);
    setAdminNotice(null);

    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file, index) => {
          const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
          const filePath = `${baseSlug}/${Date.now()}-${index}-${safeName}`;
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(filePath, file, {
              upsert: true,
            });

          if (uploadError) {
            throw uploadError;
          }

          const { data: publicUrl } = supabase.storage
            .from("product-images")
            .getPublicUrl(filePath);

          return {
            imageUrl: publicUrl.publicUrl,
            altText: buildDefaultImageAlt(form.title || baseSlug, index, "gallery"),
          };
        }),
      );

      setForm((current) => {
        const existingCount = current.images.length;
        return {
          ...current,
          images: [
            ...current.images,
            ...uploads.map((upload, index) =>
              createImageDraft({
                imageUrl: upload.imageUrl,
                altText: upload.altText,
                role: existingCount === 0 && index === 0 ? "primary" : "gallery",
                position: `${existingCount + index}`,
              }),
            ),
          ],
        };
      });

      toast({
        title: "Images uploaded",
        description: "The uploaded files were added to the current product draft.",
      });
      setAdminNotice({
        title: "Images uploaded",
        description: "The uploaded file URLs were added to the current draft. Save the product to persist them in the catalog tables.",
        variant: "default",
      });
    } catch (uploadError) {
      console.error(uploadError);
      const message = normalizeAdminError(
        uploadError,
        "Check the authenticated admin storage policies for the product-images bucket.",
      );
      toast({
        title: "Image upload failed",
        description: message,
      });
      setAdminNotice({
        title: "Image upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const collectionErrorMessage = collectionsError
    ? normalizeAdminError(
        collectionsError,
        "Collections could not be loaded. Run `supabase/schema.sql`, then `supabase/seed-sample-collections.sql`, refresh the hidden admin studio route, and try again.",
      )
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-28 pb-16 px-4 md:px-8 max-w-[1500px] mx-auto flex-1 w-full">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary mb-2">
              Secure Admin Studio
            </p>
            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">
              Supabase Admin
            </h1>
            <p className="text-sm text-on-surface-variant mt-2 max-w-3xl">
              This page writes directly to Supabase behind authenticated admin policies.
              Keep the route private, promote admins intentionally, and use it only for catalog operations.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => syncSelectedProduct(NEW_PRODUCT_ID)}
              className="px-5 py-3 rounded-xl bg-surface-container-low text-on-surface font-semibold hover:bg-surface-dim transition-colors"
            >
              New Product
            </button>
            <button
              type="button"
              onClick={handleSaveProduct}
              disabled={isSaving}
              className="px-5 py-3 rounded-xl bg-cta-gradient text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isSaving ? "Saving…" : "Save To Supabase"}
            </button>
          </div>
        </div>

        {!supabase && (
          <div className="mb-8 rounded-2xl bg-destructive/10 border border-destructive/20 p-5 text-sm text-on-surface">
            Supabase is not configured in the frontend. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to use the admin studio.
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-2xl bg-destructive/10 border border-destructive/20 p-5 text-sm text-on-surface">
            {(error as Error).message}
          </div>
        )}

        {collectionErrorMessage && (
          <div className="mb-8 rounded-2xl bg-destructive/10 border border-destructive/20 p-5 text-sm text-on-surface">
            {collectionErrorMessage}
          </div>
        )}

        {!collectionErrorMessage && supabase && !isCollectionsLoading && collections.length === 0 && (
          <div className="mb-8 rounded-2xl bg-secondary-container/20 border border-outline-variant/20 p-5 text-sm text-on-surface">
            No collections were found yet. Run `supabase/seed-sample-collections.sql` in the Supabase SQL editor, then refresh the hidden admin studio route.
          </div>
        )}

        {adminNotice && (
          <div
            className={`mb-8 rounded-2xl border p-5 text-sm ${
              adminNotice.variant === "destructive"
                ? "bg-destructive/10 border-destructive/20 text-on-surface"
                : "bg-secondary-container/20 border-outline-variant/20 text-on-surface"
            }`}
          >
            <p className="font-semibold mb-2">{adminNotice.title}</p>
            <p className="leading-6 whitespace-pre-wrap">{adminNotice.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-8 items-start">
          <aside className="rounded-[1.5rem] bg-surface-container-lowest border border-outline-variant/20 p-4 xl:sticky xl:top-28">
            <div className="flex items-center justify-between px-2 pt-2 pb-4">
              <div>
                <h2 className="font-headline font-bold text-lg text-on-surface">
                  Catalog Entries
                </h2>
                <p className="text-xs text-on-surface-variant">
                  {isLoading ? "Loading…" : `${catalog.length} products`}
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {catalog.map((entry) => {
                const isSelected = selectedProductId === entry.product.id;

                return (
                  <button
                    key={entry.product.id}
                    type="button"
                    onClick={() => syncSelectedProduct(entry.product.id)}
                    className={`w-full text-left rounded-2xl p-4 transition-colors ${
                      isSelected
                        ? "bg-inverse-surface text-inverse-on-surface"
                        : "bg-surface-container-low hover:bg-surface-dim text-on-surface"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-16 w-12 overflow-hidden rounded-lg bg-surface-container-low shrink-0">
                        {entry.images[0]?.image_url ? (
                          <img
                            src={entry.images[0].image_url}
                            alt={entry.images[0].alt_text || entry.product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-outline-variant">
                            <MaterialIcon icon="image" className="text-xl" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{entry.product.title}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isSelected
                              ? "text-inverse-on-surface/70"
                              : "text-on-surface-variant"
                          }`}
                        >
                          /{entry.product.slug}
                        </p>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {entry.product.is_active ? "Live" : "Draft"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4 text-xs">
                      <span>{entry.product.collection}</span>
                      <span>
                        {formatMoney(entry.product.base_price, entry.product.currency_code)}
                      </span>
                    </div>
                  </button>
                );
              })}

              {!isLoading && catalog.length === 0 && (
                <div className="rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
                  No products in Supabase yet. Start by creating your first entry.
                </div>
              )}
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[1.5rem] bg-surface-container-lowest border border-outline-variant/20 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-on-surface">
                    Product Details
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Edit the product schema that the storefront already knows how to render.
                  </p>
                </div>
                {selectedEntry && !isCreatingNew && (
                  <button
                    type="button"
                    onClick={handleDeleteProduct}
                    disabled={isDeleting}
                    className="px-4 py-3 rounded-xl bg-destructive text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {isDeleting ? "Deleting…" : "Delete Product"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Slug
                  </span>
                  <input
                    value={form.slug}
                    onChange={(event) => handleSlugChange(event.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                    placeholder="geometric-void"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Title
                  </span>
                  <input
                    value={form.title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                    placeholder="Geometric Void"
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Description
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(event) => updateForm("description", event.target.value)}
                    className="w-full min-h-32 bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                    placeholder="A disciplined study in sharp contrast and negative space..."
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Collection
                  </span>
                  <select
                    value={form.collection}
                    onChange={(event) => updateForm("collection", event.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                  >
                    {!form.collection && <option value="">Select a collection</option>}
                    {collectionOptions.map((collectionTitle) => (
                      <option key={collectionTitle} value={collectionTitle}>
                        {collectionTitle}
                        {collections.some((collection) => collection.title === collectionTitle)
                          ? ""
                          : " (current value)"}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-on-surface-variant">
                    {collections.length
                      ? "Collection options are loaded from the Supabase `collections` table."
                      : "Run `supabase/seed-sample-collections.sql` to add sample collection categories."}
                  </p>
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Currency
                  </span>
                  <select
                    value={form.currencyCode}
                    onChange={(event) =>
                      updateForm(
                        "currencyCode",
                        event.target.value as ProductFormState["currencyCode"],
                      )
                    }
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                  >
                    {currencyOptions.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Base Price
                  </span>
                  <input
                    value={form.basePrice}
                    onChange={(event) => handleBasePriceChange(event.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                    placeholder={defaultCmsBasePrice}
                    type="number"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Compare At Price
                  </span>
                  <input
                    value={form.compareAtPrice}
                    onChange={(event) =>
                      handleCompareAtPriceChange(event.target.value)
                    }
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                    placeholder={defaultCmsCompareAtPrice}
                    type="number"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Availability Status
                  </span>
                  <select
                    value={form.availabilityStatus}
                    onChange={(event) =>
                      updateForm(
                        "availabilityStatus",
                        event.target.value as ProductFormState["availabilityStatus"],
                      )
                    }
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                  >
                    {availabilityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Availability Label
                  </span>
                  <input
                    value={form.availabilityLabel}
                    onChange={(event) => updateForm("availabilityLabel", event.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                    placeholder="In stock"
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Lead Time Label
                  </span>
                  <input
                    value={form.leadTimeLabel}
                    onChange={(event) => updateForm("leadTimeLabel", event.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                    placeholder="Dispatches in 2 to 4 business days."
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Badge
                  </span>
                  <input
                    value={form.badge}
                    onChange={(event) => updateForm("badge", event.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                    placeholder="Bestseller"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Badge Class
                  </span>
                  <input
                    value={form.badgeClassName}
                    onChange={(event) => updateForm("badgeClassName", event.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                    placeholder="bg-red-600"
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Material Summary
                  </span>
                  <textarea
                    value={form.materialSummary}
                    onChange={(event) => updateForm("materialSummary", event.target.value)}
                    className="w-full min-h-28 bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                    placeholder="Museum-grade archival inks on heavyweight textured stock..."
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Features
                  </span>
                  <textarea
                    value={form.featuresText}
                    onChange={(event) => updateForm("featuresText", event.target.value)}
                    className="w-full min-h-28 bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                    placeholder={"Premium 250gsm paper\nMatte anti-glare finish"}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    SEO Title
                  </span>
                  <input
                    value={form.seoTitle}
                    onChange={(event) => updateForm("seoTitle", event.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Canonical Path
                  </span>
                  <input
                    value={form.seoCanonicalPath}
                    onChange={(event) => updateForm("seoCanonicalPath", event.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                    placeholder="/poster/geometric-void"
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    SEO Description
                  </span>
                  <textarea
                    value={form.seoDescription}
                    onChange={(event) => updateForm("seoDescription", event.target.value)}
                    className="w-full min-h-24 bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Sort Order
                  </span>
                  <input
                    value={form.sortOrder}
                    onChange={(event) => updateForm("sortOrder", event.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm"
                    type="number"
                  />
                </label>
                <div className="flex flex-wrap gap-6 items-center pt-8">
                  <label className="flex items-center gap-3 text-sm font-medium text-on-surface">
                    <input
                      type="checkbox"
                      checked={form.availableForSale}
                      onChange={(event) =>
                        updateForm("availableForSale", event.target.checked)
                      }
                    />
                    Available for sale
                  </label>
                  <label className="flex items-center gap-3 text-sm font-medium text-on-surface">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) => updateForm("isActive", event.target.checked)}
                    />
                    Active on storefront
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-surface-container-lowest border border-outline-variant/20 p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-on-surface">
                    Dimensions & Pricing
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Add the minimum dimension records the storefront expects.
                  </p>
                </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        dimensions: [
                          ...current.dimensions,
                          createDimensionDraft({
                            amount: current.basePrice || defaultCmsBasePrice,
                            compareAtAmount:
                              current.compareAtPrice || defaultCmsCompareAtPrice,
                          }),
                        ],
                      }))
                    }
                    className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-semibold hover:bg-surface-dim transition-colors"
                >
                  Add Dimension
                </button>
              </div>

              <div className="space-y-4">
                {form.dimensions.map((dimension, index) => (
                  <div
                    key={dimension.id}
                    className="rounded-2xl bg-surface-container-low p-4 grid grid-cols-1 md:grid-cols-7 gap-3"
                  >
                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        Code
                      </span>
                      <input
                        value={dimension.code}
                        onChange={(event) =>
                          updateDimension(dimension.id, "code", event.target.value)
                        }
                        className="w-full bg-surface-container-highest rounded-xl px-3 py-2 text-sm"
                        placeholder="a4"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        Label
                      </span>
                      <input
                        value={dimension.label}
                        onChange={(event) =>
                          updateDimension(dimension.id, "label", event.target.value)
                        }
                        className="w-full bg-surface-container-highest rounded-xl px-3 py-2 text-sm"
                        placeholder="A4"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        Width cm
                      </span>
                      <input
                        value={dimension.widthCm}
                        onChange={(event) =>
                          updateDimension(dimension.id, "widthCm", event.target.value)
                        }
                        className="w-full bg-surface-container-highest rounded-xl px-3 py-2 text-sm"
                        type="number"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        Height cm
                      </span>
                      <input
                        value={dimension.heightCm}
                        onChange={(event) =>
                          updateDimension(dimension.id, "heightCm", event.target.value)
                        }
                        className="w-full bg-surface-container-highest rounded-xl px-3 py-2 text-sm"
                        type="number"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        Amount
                      </span>
                      <input
                        value={dimension.amount}
                        onChange={(event) =>
                          updateDimension(dimension.id, "amount", event.target.value)
                        }
                        className="w-full bg-surface-container-highest rounded-xl px-3 py-2 text-sm"
                        type="number"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        Compare At
                      </span>
                      <input
                        value={dimension.compareAtAmount}
                        onChange={(event) =>
                          updateDimension(
                            dimension.id,
                            "compareAtAmount",
                            event.target.value,
                          )
                        }
                        className="w-full bg-surface-container-highest rounded-xl px-3 py-2 text-sm"
                        type="number"
                      />
                    </label>
                    <div className="flex items-end gap-3">
                      <label className="space-y-2 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                          Sort
                        </span>
                        <input
                          value={dimension.sortOrder}
                          onChange={(event) =>
                            updateDimension(dimension.id, "sortOrder", event.target.value)
                          }
                          className="w-full bg-surface-container-highest rounded-xl px-3 py-2 text-sm"
                          type="number"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            dimensions: current.dimensions.filter(
                              (currentDimension) => currentDimension.id !== dimension.id,
                            ),
                          }))
                        }
                        className="px-3 py-2 rounded-xl bg-destructive text-white"
                        aria-label={`Remove dimension ${index + 1}`}
                      >
                        <MaterialIcon icon="delete" className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-surface-container-lowest border border-outline-variant/20 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-on-surface">
                    Images
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Paste image URLs or upload files into the `product-images` bucket.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-semibold hover:bg-surface-dim transition-colors cursor-pointer">
                    {isUploading ? "Uploading…" : "Upload Images"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploading}
                      onChange={(event) => handleUploadImages(event.target.files)}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        images: [
                          ...current.images,
                          createImageDraft({
                            altText: buildDefaultImageAlt(
                              current.title,
                              current.images.length,
                              "gallery",
                            ),
                          }),
                        ],
                      }))
                    }
                    className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-semibold hover:bg-surface-dim transition-colors"
                  >
                    Add Image Row
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {form.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="rounded-2xl bg-surface-container-low p-4 grid grid-cols-1 md:grid-cols-[112px_1.25fr_1fr_160px_100px_64px] gap-3 items-end"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        Preview
                      </span>
                      <div className="h-28 w-20 overflow-hidden rounded-xl bg-surface-container-highest">
                        {image.imageUrl.trim() ? (
                          <img
                            src={image.imageUrl}
                            alt={image.altText || `${form.title || "Product"} preview`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-outline-variant">
                            <MaterialIcon icon="image" className="text-2xl" />
                          </div>
                        )}
                      </div>
                    </div>
                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        Image URL
                      </span>
                      <input
                        value={image.imageUrl}
                        onChange={(event) =>
                          updateImage(image.id, "imageUrl", event.target.value)
                        }
                        className="w-full bg-surface-container-highest rounded-xl px-3 py-2 text-sm"
                        placeholder="https://..."
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        Alt Text
                      </span>
                      <input
                        value={image.altText}
                        onChange={(event) =>
                          updateImage(image.id, "altText", event.target.value)
                        }
                        className="w-full bg-surface-container-highest rounded-xl px-3 py-2 text-sm"
                        placeholder="Poster detail image"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        Role
                      </span>
                      <select
                        value={image.role}
                        onChange={(event) =>
                          updateImage(image.id, "role", event.target.value)
                        }
                        className="w-full bg-surface-container-highest rounded-xl px-3 py-2 text-sm"
                      >
                        <option value="primary">Primary</option>
                        <option value="gallery">Gallery</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        Position
                      </span>
                      <input
                        value={image.position}
                        onChange={(event) =>
                          updateImage(image.id, "position", event.target.value)
                        }
                        className="w-full bg-surface-container-highest rounded-xl px-3 py-2 text-sm"
                        type="number"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          images: current.images.filter(
                            (currentImage) => currentImage.id !== image.id,
                          ),
                        }))
                      }
                      className="h-11 rounded-xl bg-destructive text-white"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <MaterialIcon icon="delete" className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
