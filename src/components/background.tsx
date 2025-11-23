
"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "@/context/theme-provider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NUM_BLOBS = 4;

interface Blob {
  id: number;
  size: number;
  initialX: string;
  initialY: string;
  animationDuration: string;
  animationDelay: string;
}

interface Star {
    id: number;
    size: string;
    duration: string;
    delay: string;
    top: string;
    left: string;
}

function AnimatedBlobs() {
  const { blobSpeed } = useTheme();
  const [blobs, setBlobs] = useState<Blob[]>([]);

  useEffect(() => {
    // Generate blobs only on the client-side after mount
    const generatedBlobs = Array.from({ length: NUM_BLOBS }).map((_, i) => ({
      id: i,
      size: Math.random() * 200 + 150,
      initialX: `${Math.random() * 80 + 10}%`,
      initialY: `${Math.random() * 80 + 10}%`,
      animationDuration: `${Math.random() * 20 + blobSpeed}s`,
      animationDelay: `-${Math.random() * 10}s`,
    }));
    setBlobs(generatedBlobs);
  }, [blobSpeed]);

  if (blobs.length === 0) {
    return null; // Don't render anything until blobs are generated
  }

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
      {blobs.map((blob) => {
        return (
          <motion.div
            key={blob.id}
            className="absolute bg-accent/10 blur-3xl animate-morph animate-blob-move"
            style={{
              width: blob.size,
              height: blob.size,
              left: blob.initialX,
              top: blob.initialY,
              animationDuration: blob.animationDuration,
              animationDelay: blob.animationDelay,
            }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          />
        );
      })}
    </>
  );
}

const Starfield = () => {
    const [stars, setStars] = useState<Star[]>([]);

    useEffect(() => {
        // Generate stars only on the client-side
        const starCount = 100;
        const generatedStars = Array.from({ length: starCount }).map((_, i) => ({
            id: i,
            size: `${Math.random() * 2 + 1}px`,
            duration: `${Math.random() * 2 + 2}s`,
            delay: `${Math.random() * 2}s`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
        }));
        setStars(generatedStars);
    }, []);

    if (stars.length === 0) {
        return null;
    }

    return (
        <div className="absolute inset-0 z-0">
            {stars.map(star => (
                 <div
                    key={`star-${star.id}`}
                    className="absolute rounded-full bg-white/80 animate-[twinkle_4s_infinite]"
                    style={{
                        width: star.size,
                        height: star.size,
                        top: star.top,
                        left: star.left,
                        animationDuration: star.duration,
                        animationDelay: star.delay,
                    }}
                />
            ))}
        </div>
    );
}


export function Background() {
  const { backgroundEffects, theme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render nothing on the server
  if (!isClient) {
    return null;
  }

  // Render the background effects on the client
  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden">
      {backgroundEffects.blobs ? (
        <div className="absolute inset-0 transition-opacity duration-1000 opacity-100">
          <AnimatedBlobs />
        </div>
      ) : (
         <div className="absolute inset-0 transition-opacity duration-1000 opacity-100">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
        </div>
      )}

      {backgroundEffects.starfield && theme === 'dark' && <Starfield />}
    </div>
  );
}
