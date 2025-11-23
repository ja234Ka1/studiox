
"use client";

import React, { type ReactNode } from "react";
import { ThemeProvider } from "@/context/theme-provider";
import { VideoProvider } from "@/context/video-provider";
import { LoadingProvider } from "@/context/loading-provider";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { NotificationProvider } from "@/context/notification-provider";
import { WatchlistProvider } from "@/context/watchlist-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <NotificationProvider>
        <VideoProvider>
          <LoadingProvider>
            <FirebaseClientProvider>
              <WatchlistProvider>
                {children}
              </WatchlistProvider>
            </FirebaseClientProvider>
          </LoadingProvider>
        </VideoProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
