
"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SettingsSidebarNav } from "@/components/settings/settings-sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { SettingsAppearancePage } from "@/components/settings/appearance/page";

const settingsNavItems = [
    {
      title: "Profile",
      href: "/settings",
      slug: "profile",
    },
    {
      title: "Appearance",
      href: "/settings/appearance",
      slug: "appearance",
    },
]

export default function SettingsPage({ params }: { params: { slug: string[] }}) {
    const router = useRouter();
    const initialSlug = params.slug?.[0] || 'profile';
    const [activeSlug, setActiveSlug] = useState(initialSlug);

    useEffect(() => {
        setActiveSlug(initialSlug);
    }, [initialSlug]);

    const handleNav = (href: string) => {
        // We use Next.js router to update the URL for deep linking
        router.replace(href, { scroll: false });
        
        // And update the state to swap content instantly
        const slug = settingsNavItems.find(item => item.href === href)?.slug || 'profile';
        setActiveSlug(slug);
    };

    return (
        <div className="container max-w-5xl mx-auto py-6 px-4 md:px-8">
            <header className="mb-4">
                <h1 className="text-xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                Manage your account and app preferences.
                </p>
            </header>
            <Separator className="mb-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <SettingsSidebarNav items={settingsNavItems} onNavigate={handleNav} />
                </aside>
                <div className="flex-1">
                    {activeSlug === 'profile' && <ProfileSettings />}
                    {activeSlug === 'appearance' && <SettingsAppearancePage />}
                </div>
            </div>
        </div>
    );
}
