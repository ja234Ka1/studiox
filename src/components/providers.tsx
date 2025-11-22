
"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/context/theme-provider";
import { VideoProvider } from "@/context/video-provider";
import { LoadingProvider } from "@/context/loading-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <VideoProvider>
        <LoadingProvider>{children}</LoadingProvider>
      </VideoProvider>
    </ThemeProvider>
  );
}
