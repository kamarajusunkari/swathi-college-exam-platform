"use client";

import React, { Suspense } from "react";
import { Toaster } from "sonner";
import { NavigationProgressBar } from "@/components/common/NavigationProgressBar";
import { QueryProvider } from "./query-provider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <Suspense fallback={null}>
        <NavigationProgressBar />
      </Suspense>
      {children}
      <Toaster position="top-right" richColors theme="light" closeButton />
    </QueryProvider>
  );
}
