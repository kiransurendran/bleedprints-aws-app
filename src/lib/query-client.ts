import { QueryClient } from "@tanstack/react-query";

const minute = 60 * 1000;

export const queryCacheConfig = {
  adminDataStaleTime: 30 * 1000,
  customerDataStaleTime: minute,
  storefrontDataStaleTime: 10 * minute,
  cacheRetentionTime: 30 * minute,
};

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: queryCacheConfig.customerDataStaleTime,
        gcTime: queryCacheConfig.cacheRetentionTime,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
