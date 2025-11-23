
"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { Media } from "@/types/tmdb";

interface NotificationContextType {
  notification: Media | null;
  showNotification: (item: Media) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Media | null>(null);

  const showNotification = useCallback((item: Media) => {
    setNotification(item);
    setTimeout(() => {
      setNotification(null);
    }, 4000); // Hide after 4 seconds
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
