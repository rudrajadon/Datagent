"use client";

import { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/error-boundary";
import { ThemeProvider } from "@/context/theme-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider delayDuration={100}>
          <Toaster />
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}