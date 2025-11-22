
"use client";

import React, { type ReactNode } from "react";
import { ThemeProvider } from "@/context/theme-provider";
import { VideoProvider } from "@/context/video-provider";
import { LoadingProvider } from "@/context/loading-provider";
import { ToastContext, type ToasterToast } from "@/hooks/use-toast";

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;


export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);
  const timers = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

  const toast = React.useCallback((props: Omit<ToasterToast, "id">) => {
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

    setToasts((prev) => [newToast, ...prev].slice(0, TOAST_LIMIT));

    const timer = setTimeout(() => {
      dismiss(id);
    }, props.duration || TOAST_REMOVE_DELAY);

    timers.current.set(id, timer);

    return {
      id,
      dismiss: () => dismiss(id),
      update: (updateProps: Partial<ToasterToast>) => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updateProps } : t))
        );
      },
    };
  }, []);

  const dismiss = React.useCallback((toastId?: string) => {
    setToasts((prev) =>
      prev.map((t) => {
        if (t.id === toastId || toastId === undefined) {
          if (timers.current.has(t.id)) {
            clearTimeout(timers.current.get(t.id)!);
            timers.current.delete(t.id);
          }
          return { ...t, open: false };
        }
        return t;
      })
    );
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
        setToasts(prev => prev.filter(t => t.open !== false));
    }, 1000);

    return () => clearInterval(interval);
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
          <LoadingProvider>{children}</LoadingProvider>
        </VideoProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
