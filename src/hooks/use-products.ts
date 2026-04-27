import { useQuery } from "@tanstack/react-query";

import {
  getStorefrontProductBySlug,
  listStorefrontProducts,
} from "@/lib/storefront/products";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: listStorefrontProducts,
  });
}

export function useProduct(slug?: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getStorefrontProductBySlug(slug || ""),
    enabled: Boolean(slug),
  });
}
