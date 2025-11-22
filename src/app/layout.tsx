
import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/providers";
import { Header } from "@/components/header";
import { Background } from "@/components/background";
import { Toaster } from "@/components/ui/toaster";
import VideoPlayer from "@/components/video-player";
import LoadingScreen from "@/components/loading-screen";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export const metadata: Metadata = {
  title: "Willow",
  description: "A sophisticated, ultra-luxurious content discovery experience.",
};

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
      </head>
      <body className={cn("antialiased font-sans")}>
        <svg className="absolute w-0 h-0">
            <defs>
                <filter id="goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12" result="goo" />
                <feBlend in="SourceGraphic" in2="goo" />
                </filter>
            </defs>
        </svg>
        <FirebaseClientProvider>
          <AppProviders>
            <LoadingScreen />
            <Background />
            <div className="relative z-10 flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 w-full mx-auto">{children}</main>
            </div>
            <VideoPlayer />
            <Toaster />
          </AppProviders>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
