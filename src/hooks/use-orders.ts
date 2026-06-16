import { useQuery } from "@tanstack/react-query";

import { queryCacheConfig } from "@/lib/query-client";
import { listCustomerOrders } from "@/lib/storefront/orders";

export function useOrders(userId?: string) {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => listCustomerOrders(userId || ""),
    enabled: Boolean(userId),
    staleTime: queryCacheConfig.customerDataStaleTime,
    gcTime: queryCacheConfig.cacheRetentionTime,
  });
}
