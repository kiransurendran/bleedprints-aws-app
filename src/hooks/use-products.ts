import { useQuery, useQueryClient } from "@tanstack/react-query";

import { queryCacheConfig } from "@/lib/query-client";
import {
  getStorefrontProductBySlug,
  listStorefrontProducts,
} from "@/lib/storefront/products";
import type { Product } from "@/types/catalog";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: listStorefrontProducts,
    staleTime: queryCacheConfig.storefrontDataStaleTime,
    gcTime: queryCacheConfig.cacheRetentionTime,
  });
}

export function useProduct(slug?: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getStorefrontProductBySlug(slug || ""),
    enabled: Boolean(slug),
    initialData: () =>
      queryClient
        .getQueryData<Product[]>(["products"])
        ?.find((product) => product.slug === slug),
    staleTime: queryCacheConfig.storefrontDataStaleTime,
    gcTime: queryCacheConfig.cacheRetentionTime,
  });
}
