
"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, PlayCircle, Star, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "./ui/button";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "@/lib/userData";
import LoadingLink from "./loading-link";


interface MediaCardProps {
  item: Media;
}

export function MediaCard({ item }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const { toast } = useToast();

  const fallbackImage = PlaceHolderImages.find(p => p.id === 'media-fallback');
  const posterUrl = item.poster_path ? getTmdbImageUrl(item.poster_path, 'w500') : fallbackImage?.imageUrl;
  
  const title = item.title || item.name;
  const detailPath = `/media/${item.media_type}/${item.id}`;
  const year = item.release_date || item.first_air_date ? new Date(item.release_date || item.first_air_date!).getFullYear() : 'N/A';

  useEffect(() => {
    const watchlist = getWatchlist();
    setIsInWatchlist(watchlist.some(watchlistItem => watchlistItem.id === item.id));

    const handleWatchlistChange = () => {
      const updatedWatchlist = getWatchlist();
      setIsInWatchlist(updatedWatchlist.some(watchlistItem => watchlistItem.id === item.id));
    };

    window.addEventListener('willow-watchlist-change', handleWatchlistChange);
    return () => window.removeEventListener('willow-watchlist-change', handleWatchlistChange);
  }, [item.id]);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <LoadingLink href={detailPath} className="w-full h-full block">
      <motion.div
        layout
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-card shadow-md cursor-pointer group"
        whileHover={{ scale: 1.05, zIndex: 10 }}
        transition={{ duration: 0.3 }}
      >
          <Image
              src={posterUrl!}
              alt={title || "Media"}
              fill
              sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
              className="object-cover"
              data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
          />

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 p-3 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            >
              <h3 className="text-white font-bold text-base truncate mb-2">{title}</h3>
              <div className="flex items-center text-xs text-muted-foreground mb-3 gap-2">
                  <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-current"/>
                      <span>{item.vote_average.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                  <span>{year}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" className="h-8 w-8 rounded-full" asChild>
                    <LoadingLink href={detailPath}>
                      <PlayCircle className="w-4 h-4" />
                    </LoadingLink>
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={handleWatchlistToggle}>
                  {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </LoadingLink>
  );
}
