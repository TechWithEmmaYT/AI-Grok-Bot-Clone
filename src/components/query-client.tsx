import {
  setupExpoFocusManager,
  setupExpoOnlineManager,
} from "@better-auth/expo/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * React Query's defaults assume a browser. These two adapters teach it about
 * React Native's AppState and NetInfo, so refetch-on-focus and offline pausing
 * behave the way they do on the web.
 */
setupExpoFocusManager();
setupExpoOnlineManager();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Mobile sessions are short and the data is cheap; a brief window stops
      // tab switches from refetching constantly.
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
