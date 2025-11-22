
"use client"

import * as React from "react"
import { ToastContext } from "@/components/providers"
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  imageUrl?: string
  status?: "success" | "error" | "info"
}

export type ToastFn = (props: Omit<ToasterToast, "id">) => {
  id: string;
  dismiss: () => void;
  update: (props: Partial<ToasterToast>) => void;
};

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
