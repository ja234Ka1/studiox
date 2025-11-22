
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
    // On the server, always return the default so there's no mismatch
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    // On the client, read from localStorage
    return localStorage.getItem("willow-theme") || defaultTheme;
  });
  
  const [backgroundEffects, setBackgroundEffectsState] = React.useState<BackgroundEffects>({
    blobs: true,
    starfield: false,
  });

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return; // Only run effect after mount

    const storedTheme = localStorage.getItem("willow-theme") || defaultTheme;
    setTheme(storedTheme);
    const storedBlobs = localStorage.getItem("willow-bg-blobs") !== "false";
    const storedStarfield = localStorage.getItem("willow-bg-starfield") === "true";
    setBackgroundEffectsState({ blobs: storedBlobs, starfield: storedStarfield });
  }, [isMounted, defaultTheme]);

  const setTheme = (newTheme: string) => {
    if (typeof window === 'undefined') return;

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
    if (typeof window === 'undefined' || !isMounted) return;
    
    setTheme(theme); // Apply theme on change
    
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
      if (typeof window !== 'undefined') {
        localStorage.setItem("willow-bg-blobs", String(newEffects.blobs));
        localStorage.setItem("willow-bg-starfield", String(newEffects.starfield));
        window.dispatchEvent(new CustomEvent("willow-storage-change", { detail: { key: 'backgroundEffects' } }));
      }
      return newEffects;
    });
  };

  const value = {
    theme,
    setTheme,
    backgroundEffects,
    setBackgroundEffects,
  };

  // During server-side rendering and the initial client render, we don't know the
  // real theme yet. To prevent hydration mismatches, we can render null or a
  // placeholder. But a better user experience is to just render the children.
  // The theme will be applied in the useEffect.
  // We add the theme as a key to force re-render when it changes.
  return (
    <ThemeProviderContext.Provider value={value}>
      <div key={isMounted ? theme : 'initial'}>{children}</div>
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
