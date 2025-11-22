
"use client";

import React, { type ReactNode } from "react";
import { ThemeProvider } from "@/context/theme-provider";
import { VideoProvider } from "@/context/video-provider";
import { LoadingProvider } from "@/context/loading-provider";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import type { ToastFn, ToasterToast } from "@/hooks/use-toast";
import { WatchlistProvider } from "@/context/watchlist-provider";

interface ToastContextType {
  toasts: ToasterToast[];
  toast: ToastFn;
  dismiss: (toastId?: string) => void;
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <VideoProvider>
        <LoadingProvider>
          <FirebaseClientProvider>
            <WatchlistProvider>
              {children}
            </WatchlistProvider>
          </FirebaseClientProvider>
        </LoadingProvider>
      </VideoProvider>
    </ThemeProvider>
  );
}
