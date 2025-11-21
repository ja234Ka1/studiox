"use client"

import * as React from "react"
import { type ThemeProviderProps } from "next-themes/dist/types"

type BackgroundEffects = {
  blobs: boolean;
  starfield: boolean;
};

type CustomThemeProviderProps = ThemeProviderProps & {
  children: React.ReactNode;
}

type ThemeProviderState = {
  theme?: string;
  setTheme: (theme: string) => void;
  backgroundEffects: BackgroundEffects;
  setBackgroundEffects: (effects: Partial<BackgroundEffects>) => void;
};

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(undefined);

// Dummy implementation for next-themes compatibility.
const NextThemesProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
  const [theme, setThemeState] = React.useState<string>(props.defaultTheme || 'dark');
  const [backgroundEffects, setBackgroundEffectsState] = React.useState<BackgroundEffects>({
    blobs: true,
    starfield: false,
  });

   React.useEffect(() => {
    const storedTheme = localStorage.getItem("willow-theme") || props.defaultTheme || 'dark';
    setTheme(storedTheme);
    const storedBlobs = localStorage.getItem("willow-bg-blobs") !== "false";
    const storedStarfield = localStorage.getItem("willow-bg-starfield") === "true";
    setBackgroundEffectsState({ blobs: storedBlobs, starfield: storedStarfield });
  }, []);

  const setTheme = (newTheme: string) => {
    const root = window.document.documentElement;
    const isSystem = newTheme === 'system';

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const resolvedTheme = isSystem ? systemTheme : newTheme;
    
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    localStorage.setItem("willow-theme", newTheme);
    setThemeState(newTheme);

    window.dispatchEvent(new CustomEvent("willow-storage-change"));
  };
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
        if (theme === 'system') {
            setTheme('system');
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);


  const setBackgroundEffects = (effects: Partial<BackgroundEffects>) => {
    setBackgroundEffectsState(prev => {
      const newEffects = { ...prev, ...effects };
      localStorage.setItem("willow-bg-blobs", String(newEffects.blobs));
      localStorage.setItem("willow-bg-starfield", String(newEffects.starfield));
      window.dispatchEvent(new CustomEvent("willow-storage-change", { detail: { key: 'backgroundEffects' } }));
      return newEffects;
    });
  };

  const value = {
    theme,
    setTheme,
    backgroundEffects,
    setBackgroundEffects,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
