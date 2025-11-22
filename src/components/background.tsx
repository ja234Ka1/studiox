"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/context/theme-provider";
import { cn } from "@/lib/utils";

export function Background() {
  const { backgroundEffects, theme } = useTheme();

  // Use a state to prevent SSR/hydration mismatch for randomized values
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);


  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 h-full w-full">
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-1000",
          backgroundEffects.blobs ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
        <div
          className={cn(
            "absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl",
            "animate-[spin_20s_linear_infinite]"
          )}
          style={{ animationDelay: '0s' }}
        />
        <div
          className={cn(
            "absolute -top-40 -right-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl",
            "animate-[spin_22s_linear_infinite]"
          )}
          style={{ animationDelay: '-5s' }}
        />
         <div
          className={cn(
            "absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl",
            "animate-[spin_25s_linear_infinite]"
          )}
          style={{ animationDelay: '-10s' }}
        />
      </div>

       {backgroundEffects.starfield && theme === 'dark' && <Starfield />}
    </div>
  );
}

const Starfield = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    if (!isMounted) return null;

    const starCount = 100;
    const stars = Array.from({ length: starCount }).map((_, i) => {
        const size = `${Math.random() * 2 + 1}px`;
        const duration = `${Math.random() * 2 + 2}s`;
        const delay = `${Math.random() * 2}s`;
        const top = `${Math.random() * 100}%`;
        const left = `${Math.random() * 100}%`;
        
        return (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-white/80 animate-[twinkle_4s_infinite]"
              style={{
                width: size,
                height: size,
                top: top,
                left: left,
                animationDuration: duration,
                animationDelay: delay,
              }}
            />
        );
    });

    return <div className="absolute inset-0 z-0">{stars}</div>
}
