
"use client";

import React, { type ReactNode, useState, useCallback, useMemo } from "react";
import { ThemeProvider } from "@/context/theme-provider";
import { VideoProvider } from "@/context/video-provider";
import { LoadingProvider } from "@/context/loading-provider";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import type { ToasterToast, ToastFn } from "@/hooks/use-toast";
import { WatchlistProvider } from "@/context/watchlist-provider";

const TOAST_LIMIT = 3;

interface ToastContextType {
  toasts: ToasterToast[];
  toast: ToastFn;
  dismiss: (toastId?: string) => void;
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToasterToast[]>([]);

  const toast: ToastFn = useCallback((props) => {
    const id = genId();
    const newToast: ToasterToast = {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          dismiss(id);
        }
      },
    };

    setToasts((prevToasts) => [newToast, ...prevToasts].slice(0, TOAST_LIMIT));

    return {
      id: id,
      dismiss: () => dismiss(id),
      update: (props: Partial<ToasterToast>) =>
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...props } : t))
        ),
    };
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    setToasts((prev) =>
      toastId ? prev.filter((t) => t.id !== toastId) : []
    );
  }, []);

  const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}


export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ToastProvider>
            <VideoProvider>
                <LoadingProvider>
                    <FirebaseClientProvider>
                        {children}
                    </FirebaseClientProvider>
                </LoadingProvider>
            </VideoProvider>
        </ToastProvider>
    </ThemeProvider>
  );
}
