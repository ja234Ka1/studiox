
"use client"

import * as React from "react"
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  imageUrl?: string
  status?: "success" | "error" | "info"
}

type ToastFn = (props: Omit<ToasterToast, "id">) => {
  id: string;
  dismiss: () => void;
  update: (props: Partial<ToasterToast>) => void;
};

interface ToastContextType {
  toasts: ToasterToast[];
  toast: ToastFn;
  dismiss: (toastId?: string) => void;
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
