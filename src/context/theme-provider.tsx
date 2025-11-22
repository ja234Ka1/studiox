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
};

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ 
    children, 
    defaultTheme = 'system', 
    enableSystem = true,
    ...props 
}: CustomThemeProviderProps) {
  const [theme, setThemeState] = React.useState<string>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    return localStorage.getItem("willow-theme") || defaultTheme;
  });
  
  const [backgroundEffects, setBackgroundEffectsState] = React.useState<BackgroundEffects>({
    blobs: true,
    starfield: false,
  });

   React.useEffect(() => {
    const storedTheme = localStorage.getItem("willow-theme") || defaultTheme;
    setTheme(storedTheme);
    const storedBlobs = localStorage.getItem("willow-bg-blobs") !== "false";
    const storedStarfield = localStorage.getItem("willow-bg-starfield") === "true";
    setBackgroundEffectsState({ blobs: storedBlobs, starfield: storedStarfield });
  }, [defaultTheme]);

  const setTheme = (newTheme: string) => {
    const root = window.document.documentElement;
    const isSystem = newTheme === 'system' && enableSystem;

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const resolvedTheme = isSystem ? systemTheme : newTheme;
    
    root.classList.remove("light", "dark", "theme-rose", "theme-blue", "theme-green", "theme-orange");
    
    if (resolvedTheme !== 'system') {
        root.classList.add(resolvedTheme);
    }
    
    localStorage.setItem("willow-theme", newTheme);
    setThemeState(newTheme);

    window.dispatchEvent(new CustomEvent("willow-storage-change"));
  };
  
  React.useEffect(() => {
    // Apply the theme on initial load
    setTheme(theme);
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
        if (theme === 'system' && enableSystem) {
            setTheme('system');
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, enableSystem]);


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
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
