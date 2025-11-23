"use client"

import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
  }[],
  onNavigate?: (href: string) => void;
}

export function SettingsSidebarNav({ className, items, onNavigate, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, href: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  }

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start"
          )}
          onClick={(e) => handleClick(e, item.href)}
        >
          {item.title}
        </Button>
      ))}
    </nav>
  )
}
