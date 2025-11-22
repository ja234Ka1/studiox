
'use client'

import type { ReactNode } from "react";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/providers";
import { Header } from "@/components/header";
import { Background } from "@/components/background";
import { Toaster } from "@/components/ui/toaster";
import VideoPlayer from "@/components/video-player";
import LoadingScreen from "@/components/loading-screen";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { useTheme } from "@/context/theme-provider";

function ThemedBody({ children }: { children: ReactNode }) {
  const { radius, contentDensity } = useTheme();

  const carouselBasis = {
    comfortable: '1/2',
    cozy: '1/3',
    compact: '1/4',
  };
  const carouselBasisSm = {
    comfortable: '1/3',
    cozy: '1/4',
    compact: '1/5',
  };
  const carouselBasisLg = {
    comfortable: '1/5',
    cozy: '1/6',
    compact: '1/7',
  };

  return (
    <body
      className={cn("antialiased font-sans")}
      style={{
        '--radius': `${radius}rem`,
        '--carousel-basis': carouselBasis[contentDensity],
        '--carousel-basis-sm': carouselBasisSm[contentDensity],
        '--carousel-basis-lg': carouselBasisLg[contentDensity],
      } as React.CSSProperties}
    >
      <FirebaseClientProvider>
          <LoadingScreen />
          <Background />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 w-full mx-auto">{children}</main>
          </div>
          <VideoPlayer />
          <Toaster />
      </FirebaseClientProvider>
    </body>
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="A sophisticated, ultra-luxurious content discovery experience." />
        <title>Willow</title>
      </head>
      {/* We wrap the body in a client component to access theme context */}
      <AppProviders>
        <ThemedBody>
            {children}
        </ThemedBody>
      </AppProviders>
    </html>
  );
}
