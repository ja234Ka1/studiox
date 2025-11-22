
"use client";

import React, { type ReactNode } from "react";
import { ThemeProvider } from "@/context/theme-provider";
import { VideoProvider } from "@/context/video-provider";
import { LoadingProvider } from "@/context/loading-provider";
import { ToastContext, type ToasterToast } from "@/hooks/use-toast";
import { FirebaseClientProvider } from "@/firebase/client-provider";

const TOAST_LIMIT = 3;
let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  const toast = React.useCallback(
    (props: Omit<ToasterToast, "id">) => {
      const id = genId();
      const newToast: ToasterToast = {
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) {
            setToasts((prev) => prev.filter((t) => t.id !== id));
          }
        },
      };

      setToasts((prev) => [newToast, ...prev].slice(0, TOAST_LIMIT));

      return {
        id: id,
        dismiss: () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        update: (props: Partial<ToasterToast>) =>
          setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...props } : t))
          ),
      };
    },
    [] // No dependencies, as we use the functional update form of setState
  );

  const dismiss = React.useCallback((toastId?: string) => {
    setToasts((prev) =>
      toastId ? prev.filter((t) => t.id !== toastId) : []
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
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
