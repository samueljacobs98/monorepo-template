"use client";
import { type ReactNode, Suspense } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import {
  ErrorBoundary,
  type FallbackProps as ErrorFallbackProps,
} from "react-error-boundary";

export function FeatureBoundary({
  loadingFallback,
  errorFallback,
  children,
}: {
  loadingFallback: ReactNode;
  errorFallback: ReactNode | ((props: ErrorFallbackProps) => ReactNode);
  children: ReactNode;
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={(props) =>
            typeof errorFallback === "function"
              ? errorFallback(props)
              : errorFallback
          }
        >
          <Suspense fallback={loadingFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
