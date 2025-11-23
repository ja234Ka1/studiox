
'use client'

import type { ReactNode } from "react";
import React from "react";
import { Inter } from 'next/font/google';
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/providers";
import { Header } from "@/components/header";
import { Background } from "@/components/background";
import VideoPlayer from "@/components/video-player";
import LoadingScreen from "@/components/loading-screen";
import { useTheme } from "@/context/theme-provider";
import { LoginPromptDialog } from "@/components/login-prompt-dialog";
import { WatchlistNotification } from "@/components/watchlist-notification";
import { BackToTopButton } from "@/components/back-to-top-button";
import { NewEpisodeNotifier } from "@/components/new-episode-notifier";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

function ThemedBodyContent({ children }: { children: ReactNode }) {
  const { radius, isMounted } = useTheme();

  React.useEffect(() => {
    if (isMounted) {
      document.documentElement.style.setProperty('--radius', `${radius}rem`);
    }
  }, [radius, isMounted]);

  return (
      <>
        <LoadingScreen />
        <Background />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 w-full mx-auto">{children}</main>
        </div>
        <VideoPlayer />
        <LoginPromptDialog />
        <WatchlistNotification />
        <NewEpisodeNotifier />
        <BackToTopButton />
        <Toaster />
      </>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="description" content="A sophisticated, ultra-luxurious content discovery experience." />
        <title>Willow</title>
      </head>
      <body className={cn("antialiased font-sans", inter.variable)}>
        <AppProviders>
          <ThemedBodyContent>
            {children}
          </ThemedBodyContent>
        </AppProviders>
      </body>
    </html>
  );
}
