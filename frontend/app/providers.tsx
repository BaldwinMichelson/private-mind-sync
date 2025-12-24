"use client";

import type { ReactNode } from "react";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { config } from "@/config/wagmi";
import { InMemoryStorageProvider } from "@/hooks/useInMemoryStorage";

// Optimize React Query configuration: add caching strategy, retry mechanism, etc.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes, avoiding unnecessary refetches
      gcTime: 10 * 60 * 1000, // Clear cache after 10 minutes (new property name in React Query v5, replaces cacheTime)
      refetchOnWindowFocus: false, // Avoid unnecessary refetches when window gains focus
      refetchOnReconnect: true, // Automatically refresh data on network reconnect
      retry: 2, // Retry 2 times on failure
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30 seconds
    },
    mutations: {
      retry: 1, // Retry mutation once on failure
    },
  },
});

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale="en">
          <InMemoryStorageProvider>{children}</InMemoryStorageProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
