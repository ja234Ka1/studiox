
"use client";

import React, { type ReactNode } from "react";
import { ThemeProvider } from "@/context/theme-provider";
import { VideoProvider } from "@/context/video-provider";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { NotificationProvider } from "@/context/notification-provider";
import { WatchlistProvider } from "@/context/watchlist-provider";
import { ToastProvider } from "@/components/ui/toast";
import { LoadingProvider } from "@/context/loading-provider";


export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LoadingProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ToastProvider>
          <NotificationProvider>
            <VideoProvider>
                <FirebaseClientProvider>
                  <WatchlistProvider>
                    {children}
                  </WatchlistProvider>
                </FirebaseClientProvider>
            </VideoProvider>
          </NotificationProvider>
        </ToastProvider>
      </ThemeProvider>
    </LoadingProvider>
  );
}
