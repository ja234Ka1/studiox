
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, PlayCircle, ChevronDown, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "./ui/button";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "@/lib/userData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  item: Media;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export function MediaCard({ item, isHovered, onHoverStart, onHoverEnd }: MediaCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  const fallbackImage = PlaceHolderImages.find(p => p.id === 'media-fallback');
  const posterUrl = item.poster_path ? getTmdbImageUrl(item.poster_path, 'w500') : fallbackImage?.imageUrl;
  const backdropUrl = item.backdrop_path ? getTmdbImageUrl(item.backdrop_path, 'w500') : posterUrl;
  const title = item.title || item.name;
  const detailPath = `/media/${item.media_type}/${item.id}`;

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
    e.stopPropagation();
    e.preventDefault();
    if (isInWatchlist) {
      removeFromWatchlist(item.id);
      toast({ title: `Removed from Watchlist`, description: `"${title}" has been removed.` });
    } else {
      addToWatchlist(item);
      toast({ title: 'Added to Watchlist', description: `"${title}" has been added.` });
    }
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(detailPath);
  }

  const year = item.release_date || item.first_air_date
    ? new Date(item.release_date! || item.first_air_date!).getFullYear()
    : 'N/A';
  
  return (
    <motion.div
      layout
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={handleCardClick}
      className={cn(
        "relative rounded-lg bg-card cursor-pointer shadow-md overflow-hidden",
        isHovered ? "z-20 scale-110 shadow-2xl" : "z-0"
      )}
      transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
    >
      <motion.div
        layout="position"
        className="w-full"
        animate={{ aspectRatio: isHovered ? 16 / 9 : 2 / 3 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <AnimatePresence initial={false}>
          {isHovered ? (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.15, duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="absolute inset-0"
            >
              <Image
                src={backdropUrl!}
                alt={title || "Media backdrop"}
                fill
                className="object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
            </motion.div>
          ) : (
            <motion.div
              key="poster"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="absolute inset-0"
            >
              <Image
                src={posterUrl!}
                alt={title || "Media poster"}
                fill
                className="object-cover"
                data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.2 } }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.15 } }}
            className="p-3 bg-card rounded-b-lg"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Button size="icon" className="h-8 w-8 rounded-full" asChild>
                  <Link href={detailPath} onClick={e => e.stopPropagation()}>
                    <PlayCircle className="w-4 h-4 fill-current" />
                  </Link>
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={handleWatchlistToggle}>
                  {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" asChild>
                <Link href={detailPath} onClick={e => e.stopPropagation()}>
                  <ChevronDown className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            <p className="font-bold text-sm truncate mb-1">{title}</p>
            
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {item.vote_average > 0 && (
                    <span className="flex items-center gap-1 text-green-400 font-semibold">
                      <Star className="w-3 h-3 fill-current" />
                      {item.vote_average.toFixed(1)}
                    </span>
                )}
                <span>{year}</span>
                <span className="uppercase text-[0.6rem] border px-1 py-0.5 rounded">{item.media_type}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
