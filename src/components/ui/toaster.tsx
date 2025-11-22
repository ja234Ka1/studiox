
"use client"

import Image from "next/image"
import { CheckCircle2, Info, XCircle } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

const statusIcons = {
  success: <CheckCircle2 className="text-green-500" />,
  error: <XCircle className="text-destructive" />,
  info: <Info className="text-blue-500" />,
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, imageUrl, status, ...props }) {
        const Icon = status ? statusIcons[status] : null

        return (
          <Toast key={id} {...props}>
            <div className="flex items-center gap-3 w-full">
              {Icon && <div className="flex-shrink-0">{Icon}</div>}
              {imageUrl && (
                <div className="relative w-12 h-16 rounded-sm overflow-hidden flex-shrink-0">
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
