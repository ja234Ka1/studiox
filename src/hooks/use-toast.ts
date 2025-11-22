
"use client"

import * as React from "react"
import { ToastContext } from "@/components/providers"
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 3;

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  imageUrl?: string
  status?: "success" | "error" | "info"
}

const reducer = (state: ToasterToast[], action: any) => {
  switch (action.type) {
    case "ADD_TOAST":
      return [action.toast, ...state].slice(0, TOAST_LIMIT);
    case "UPDATE_TOAST":
      return state.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      );
    case "DISMISS_TOAST":
      if (action.toastId) {
        return state.filter((t) => t.id !== action.toastId);
      }
      return [];
    default:
      return state;
  }
};

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ToastFn = (props: Omit<ToasterToast, "id">) => {
  id: string;
  dismiss: () => void;
  update: (props: Partial<ToasterToast>) => void;
};


function useToast() {
  const [state, dispatch] = React.useReducer(reducer, []);

  const toast: ToastFn = React.useCallback((props) => {
    const id = genId();

    const newToast = {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) {
          dismiss();
        }
      },
    };

    dispatch({ type: "ADD_TOAST", toast: newToast });

    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
    const update = (props: Partial<ToasterToast>) => dispatch({ type: "UPDATE_TOAST", toast: { id, ...props } });

    return {
      id,
      dismiss,
      update,
    };
  }, []);

  return {
    toasts: state,
    toast,
  };
}

export { useToast, type ToasterToast, type ToastFn };
