import { useQuery } from "@tanstack/react-query";

import { listCustomerOrders } from "@/lib/storefront/orders";

export function useOrders(userId?: string) {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => listCustomerOrders(userId || ""),
    enabled: Boolean(userId),
  });
}
