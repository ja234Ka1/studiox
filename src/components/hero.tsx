
"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Info, PlayCircle, Plus, Check } from "lucide-react";
import { useState, useEffect } from "react";

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadingLink from "./loading-link";
import { useToast } from "@/hooks/use-toast";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "@/lib/userData";

interface HeroProps {
  items: Media[];
}

export function Hero({ items }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const { toast } = useToast();

  const item = items[currentIndex];

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 7000); // Change slide every 7 seconds

    return () => clearInterval(timer);
  }, [items.length]);
  
  useEffect(() => {
    if (!item) return;
    
    const watchlist = getWatchlist();
    setIsInWatchlist(watchlist.some(watchlistItem => watchlistItem.id === item.id));

    const handleWatchlistChange = () => {
      const updatedWatchlist = getWatchlist();
      setIsInWatchlist(updatedWatchlist.some(watchlistItem => watchlistItem.id === item.id));
    };

    window.addEventListener('willow-watchlist-change', handleWatchlistChange);
    return () => window.removeEventListener('willow-watchlist-change', handleWatchlistChange);
  }, [item]);


  if (!item) return null;

  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const detailPath = `/media/${item.media_type}/${item.id}`;

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation if clicking on button over the link
    const itemToAdd = { ...item, media_type: item.media_type || (item.title ? 'movie' : 'tv') };
    if (isInWatchlist) {
      removeFromWatchlist(item.id);
      toast({ title: `Removed from Watchlist`, description: `"${title}" has been removed.` });
    } else {
      addToWatchlist(itemToAdd);
      toast({ title: 'Added to Watchlist', description: `"${title}" has been added.` });
    }
  };

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
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />

      <div className="relative z-10 container h-full flex flex-col justify-end pb-16 md:pb-24 px-4 md:px-8">
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
                <Button size="lg" variant="secondary" onClick={handleWatchlistToggle}>
                    {isInWatchlist ? <Check className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                    {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
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
