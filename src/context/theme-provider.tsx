
"use client"

import * as React from "react"
import { useLocalStorage } from "@/hooks/use-local-storage";

type BackgroundEffects = {
  blobs: boolean;
  starfield: boolean;
};

export type StreamSource = "Prime" | "Elite" | "Vision" | "Infinity";

type CustomThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  enableSystem?: boolean;
  attribute?: string;
};

type ThemeProviderState = {
  theme: string;
  setTheme: (theme: string) => void;
  backgroundEffects: BackgroundEffects;
  setBackgroundEffects: (effects: Partial<BackgroundEffects>) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  blobSpeed: number;
  setBlobSpeed: (speed: number) => void;
  dataSaver: boolean;
  setDataSaver: (enabled: boolean) => void;
  radius: number;
  setRadius: (radius: number) => void;
  streamSource: StreamSource;
  setStreamSource: (source: StreamSource) => void;
};

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ 
    children, 
    defaultTheme = 'system', 
    enableSystem = true,
}: CustomThemeProviderProps) {
  const [theme, setTheme] = useLocalStorage<string>("willow-theme", defaultTheme);
  const [backgroundEffects, setBackgroundEffects] = useLocalStorage<BackgroundEffects>("willow-bg-effects", {
    blobs: true,
    starfield: false,
  });
  const [animationsEnabled, setAnimationsEnabled] = useLocalStorage<boolean>("willow-animations-enabled", true);
  const [blobSpeed, setBlobSpeed] = useLocalStorage<number>("willow-blob-speed", 30);
  const [dataSaver, setDataSaver] = useLocalStorage<boolean>("willow-data-saver", false);
  const [radius, setRadius] = useLocalStorage<number>("willow-radius", 1.0);
  const [streamSource, setStreamSource] = useLocalStorage<StreamSource>("willow-stream-source", "Prime");
  
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;

    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark", "theme-rose", "theme-nintendo", "theme-playstation", "theme-xbox", "theme-ghibli", "theme-ghibli-dark");

    let effectiveTheme = theme;
    if (theme === 'system' && enableSystem) {
        effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    if (effectiveTheme !== 'system') {
        root.classList.add(effectiveTheme);
    }
  }, [theme, enableSystem, isMounted]);

  React.useEffect(() => {
    if (!isMounted) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
        if (theme === 'system' && enableSystem) {
            // This will trigger the effect above to re-evaluate the theme
            setTheme('system'); 
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setTheme, enableSystem, isMounted]);


  const handleSetBackgroundEffects = (effects: Partial<BackgroundEffects>) => {
    setBackgroundEffects(prev => ({ ...prev, ...effects }));
  };

  const value = {
    theme,
    setTheme: (newTheme: string) => setTheme(newTheme),
    backgroundEffects,
    setBackgroundEffects: (effects: Partial<BackgroundEffects>) => setBackgroundEffects(prev => ({...prev, ...effects})),
    animationsEnabled,
    setAnimationsEnabled: (enabled: boolean) => setAnimationsEnabled(enabled),
    blobSpeed,
    setBlobSpeed: (speed: number) => setBlobSpeed(speed),
    dataSaver,
    setDataSaver: (enabled: boolean) => setDataSaver(enabled),
    radius,
    setRadius: (newRadius: number) => setRadius(newRadius),
    streamSource,
    setStreamSource: (source: StreamSource) => setStreamSource(source),
  };

  if (!isMounted) {
    return null;
  }
  
  return (
    <ThemeProviderContext.Provider value={value}>
      <div key={theme}>{children}</div>
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
