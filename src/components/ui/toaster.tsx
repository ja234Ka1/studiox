
"use client"

import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, imageUrl, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-4">
              {imageUrl && (
                <div className="relative w-16 h-24 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={imageUrl}
                      alt={title as string || 'Media Poster'}
                      fill
                      className="object-cover"
                    />
                </div>
              )}
              <div className="grid gap-1 flex-grow">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
