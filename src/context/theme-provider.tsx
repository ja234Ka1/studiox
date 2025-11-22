
"use client"

import * as React from "react"

type BackgroundEffects = {
  blobs: boolean;
  starfield: boolean;
};

type CustomThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  enableSystem?: boolean;
  attribute?: string;
};

type ThemeProviderState = {
  theme?: string;
  setTheme: (theme: string) => void;
  backgroundEffects: BackgroundEffects;
  setBackgroundEffects: (effects: Partial<BackgroundEffects>) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  blobSpeed: number;
  setBlobSpeed: (speed: number) => void;
  dataSaver: boolean;
  setDataSaver: (enabled: boolean) => void;
};

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ 
    children, 
    defaultTheme = 'system', 
    enableSystem = true,
    ...props 
}: CustomThemeProviderProps) {
  const [theme, setThemeState] = React.useState<string>(() => 'system');
  
  const [backgroundEffects, setBackgroundEffectsState] = React.useState<BackgroundEffects>({
    blobs: true,
    starfield: false,
  });

  const [animationsEnabled, setAnimationsEnabledState] = React.useState<boolean>(true);
  const [blobSpeed, setBlobSpeedState] = React.useState<number>(30);
  const [dataSaver, setDataSaverState] = React.useState<boolean>(false);


  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;

    setThemeState(localStorage.getItem("willow-theme") || defaultTheme);
    setBackgroundEffectsState({
      blobs: localStorage.getItem("willow-bg-blobs") !== "false",
      starfield: localStorage.getItem("willow-bg-starfield") === "true",
    });
    setAnimationsEnabledState(localStorage.getItem("willow-animations-enabled") !== "false");
    const storedBlobSpeed = localStorage.getItem("willow-blob-speed");
    setBlobSpeedState(storedBlobSpeed ? parseInt(storedBlobSpeed, 10) : 30);
    setDataSaverState(localStorage.getItem("willow-data-saver") === "true");

  }, [isMounted, defaultTheme]);

  const setTheme = (newTheme: string) => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    const isSystem = newTheme === 'system' && enableSystem;

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const resolvedTheme = isSystem ? systemTheme : newTheme;
    
    root.classList.remove("light", "dark", "theme-rose", "theme-nintendo", "theme-playstation", "theme-xbox");
    
    if (resolvedTheme !== 'system') {
        root.classList.add(resolvedTheme);
    }
    
    localStorage.setItem("willow-theme", newTheme);
    setThemeState(newTheme);

    window.dispatchEvent(new CustomEvent("willow-storage-change"));
  };
  
  React.useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;
    
    setTheme(theme);
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
        if (theme === 'system' && enableSystem) {
            setTheme('system');
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, enableSystem, isMounted]);


  const setBackgroundEffects = (effects: Partial<BackgroundEffects>) => {
    setBackgroundEffectsState(prev => {
      const newEffects = { ...prev, ...effects };
      if (typeof window !== 'undefined' && isMounted) {
        localStorage.setItem("willow-bg-blobs", String(newEffects.blobs));
        localStorage.setItem("willow-bg-starfield", String(newEffects.starfield));
        window.dispatchEvent(new CustomEvent("willow-storage-change", { detail: { key: 'backgroundEffects' } }));
      }
      return newEffects;
    });
  };

  const setAnimationsEnabled = (enabled: boolean) => {
    setAnimationsEnabledState(enabled);
    if (typeof window !== 'undefined' && isMounted) {
      localStorage.setItem("willow-animations-enabled", String(enabled));
      window.dispatchEvent(new CustomEvent("willow-storage-change", { detail: { key: 'animationsEnabled' } }));
    }
  };

  const setBlobSpeed = (speed: number) => {
    setBlobSpeedState(speed);
    if (typeof window !== "undefined" && isMounted) {
      localStorage.setItem("willow-blob-speed", String(speed));
      window.dispatchEvent(new CustomEvent("willow-storage-change", { detail: { key: 'blobSpeed' } }));
    }
  };

  const setDataSaver = (enabled: boolean) => {
    setDataSaverState(enabled);
    if (typeof window !== 'undefined' && isMounted) {
      localStorage.setItem("willow-data-saver", String(enabled));
      window.dispatchEvent(new CustomEvent("willow-storage-change", { detail: { key: 'dataSaver' } }));
    }
  };

  const value = {
    theme,
    setTheme,
    backgroundEffects,
    setBackgroundEffects,
    animationsEnabled,
    setAnimationsEnabled,
    blobSpeed,
    setBlobSpeed,
    dataSaver,
    setDataSaver
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
