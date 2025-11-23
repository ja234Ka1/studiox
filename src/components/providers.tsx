
"use client";

import React, { type ReactNode } from "react";
import { ThemeProvider } from "@/context/theme-provider";
import { VideoProvider } from "@/context/video-provider";
import { LoadingProvider } from "@/context/loading-provider";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { WatchlistProvider } from "@/context/watchlist-provider";
import { ToastProvider } from "@/components/ui/toast";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <VideoProvider>
          <LoadingProvider>
            <FirebaseClientProvider>
              <ToastProvider>
                <WatchlistProvider>
                  {children}
                </WatchlistProvider>
              </ToastProvider>
            </FirebaseClientProvider>
          </LoadingProvider>
        </VideoProvider>
    </ThemeProvider>
  );
}
