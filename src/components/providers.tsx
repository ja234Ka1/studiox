
"use client";

import React, { type ReactNode } from "react";
import { ThemeProvider } from "@/context/theme-provider";
import { VideoProvider } from "@/context/video-provider";
import { LoadingProvider } from "@/context/loading-provider";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <VideoProvider>
          <LoadingProvider>
            <FirebaseClientProvider>
                {children}
            </FirebaseClientProvider>
          </LoadingProvider>
        </VideoProvider>
    </ThemeProvider>
  );
}
