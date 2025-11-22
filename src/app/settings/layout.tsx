
"use client";

import React from "react";
import { SettingsSidebarNav } from "@/components/settings/settings-sidebar-nav";
import { Separator } from "@/components/ui/separator";

const settingsNavItems = [
    {
      title: "Profile",
      href: "/settings",
    },
    {
      title: "Appearance",
      href: "/settings/appearance",
    },
    {
      title: "Playback",
      href: "/settings/playback",
    },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 md:px-8">
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
