
"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/context/theme-provider";
import { VideoProvider } from "@/context/video-provider";
import { LoadingProvider } from "@/context/loading-provider";
import { AuthProvider } from "@/firebase/auth/use-user";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <VideoProvider>
          <LoadingProvider>{children}</LoadingProvider>
        </VideoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
