
"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { Media } from "@/types/tmdb";

export type NotificationType = "added" | "exists";

interface NotificationData {
  item: Media;
  type: NotificationType;
}

interface NotificationContextType {
  notification: NotificationData | null;
  showNotification: (item: Media, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showNotification = useCallback((item: Media, type: NotificationType) => {
    // If there's an existing notification timeout, clear it
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setNotification({ item, type });
    
    // Set a new timeout to hide the notification
    const newTimeoutId = setTimeout(() => {
      setNotification(null);
      setTimeoutId(null);
    }, 4000); // Hide after 4 seconds
    setTimeoutId(newTimeoutId);
  }, [timeoutId]);

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
