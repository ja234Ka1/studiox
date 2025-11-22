
"use client";

import React, { useState, useEffect, useRef } from "react";
import { SettingsSidebarNav } from "@/components/settings/settings-sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { LiquidCursor } from "@/components/settings/liquid-cursor";

const settingsNavItems = [
    {
      title: "Profile",
      href: "/settings",
    },
    {
      title: "Appearance",
      href: "/settings/appearance",
    },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseOver = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if(target.closest('button, a, [role="switch"], [role="slider"]')) {
            setIsHovering(true);
        }
    };
    
    const handleMouseOut = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if(target.closest('button, a, [role="switch"], [role="slider"]')) {
            setIsHovering(false);
        }
    };

    const currentRef = layoutRef.current;
    if (currentRef) {
        currentRef.addEventListener("mousemove", handleMouseMove);
        currentRef.addEventListener("mouseover", handleMouseOver);
        currentRef.addEventListener("mouseout", handleMouseOut);
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("mousemove", handleMouseMove);
        currentRef.removeEventListener("mouseover", handleMouseOver);
        currentRef.removeEventListener("mouseout", handleMouseOut);
      }
    };
  }, []);

  return (
    <div ref={layoutRef} className="container max-w-6xl mx-auto py-12 px-4 md:px-8 cursor-none gooey-container">
        <LiquidCursor x={mousePosition.x} y={mousePosition.y} isHovering={isHovering} />
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
            Manage your account and app preferences.
            </p>
        </header>
        <Separator className="mb-8" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 lg:w-1/5">
                <SettingsSidebarNav items={settingsNavItems} />
            </aside>
            <div className="flex-1">{children}</div>
        </div>
    </div>
  )
}
