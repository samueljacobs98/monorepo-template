"use client";
import type { ReactNode } from "react";
import { QueryClientProvider as ReactQueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/utils/get-query-client";

export function QueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <ReactQueryClientProvider client={getQueryClient()}>
      {children}
      <ReactQueryDevtools />
    </ReactQueryClientProvider>
  );
}
