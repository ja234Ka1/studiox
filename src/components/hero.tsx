
"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { useState, useEffect } from "react";

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadingLink from "./loading-link";

interface HeroProps {
  items: Media[];
}

export function Hero({ items }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 7000); // Change slide every 7 seconds

    return () => clearInterval(timer);
  }, [items.length]);
  
  const item = items[currentIndex];
  if (!item) {
    // Render a consistent placeholder if there are no items
    return (
        <div className="relative w-full h-[60vh] lg:h-[80vh] bg-muted">
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
        </div>
    );
  }

  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const detailPath = `/media/${item.media_type}/${item.id}`;


  return (
    <div className="relative w-full h-[60vh] lg:h-[80vh] group">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
            <Image
              src={getTmdbImageUrl(item.backdrop_path, "original")}
              alt={title || "Hero backdrop"}
              fill
              priority
              className="object-cover"
            />
            {/* The link is now an overlay, preventing nesting issues */}
            <LoadingLink href={detailPath} className="absolute inset-0 z-10">
                <span className="sr-only">View details for {title}</span>
            </LoadingLink>
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />

      <div className="relative z-20 container h-full flex flex-col justify-end pb-16 md:pb-24 px-4 md:px-8">
        <AnimatePresence>
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="max-w-xl"
            >
            <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary" className="text-sm">{item.media_type.toUpperCase()}</Badge>
                <Badge variant="outline" className="text-sm">{year}</Badge>
                {item.vote_average > 0 && (
                    <Badge variant="default" className="bg-accent text-accent-foreground text-sm">
                        Rating: {item.vote_average.toFixed(1)}
                    </Badge>
                )}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight mb-4">
                {title}
            </h1>
            <p className="text-muted-foreground line-clamp-3 mb-8">
                {item.overview}
            </p>
            <div className="flex items-center gap-4">
                <Button size="lg" asChild>
                    <LoadingLink href={detailPath}>
                        <PlayCircle className="mr-2" />
                        Watch
                    </LoadingLink>
                </Button>
            </div>
            </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation dots */}
      {items.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {items.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                        currentIndex === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/50 hover:bg-muted-foreground'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
      )}
    </div>
  );
}
