
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Star, PlayCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "./ui/button";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "@/lib/userData";
import { useToast } from "@/hooks/use-toast";

interface MediaCardProps {
  item: Media;
}

export function MediaCard({ item }: MediaCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const fallbackImage = PlaceHolderImages.find(p => p.id === 'media-fallback');
  const posterUrl = item.poster_path ? getTmdbImageUrl(item.poster_path) : fallbackImage?.imageUrl;
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
    if ((e.target as HTMLElement).closest('button')) {
        return;
    }
    e.preventDefault();
    router.push(detailPath);
  }

  return (
    <motion.div
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative aspect-[2/3] bg-card rounded-lg shadow-lg cursor-pointer z-0"
      transition={{ layout: { duration: 0.2 } }}
    >
      {/* Poster Image (Visible when not hovered) */}
      <motion.div
        className="w-full h-full"
        animate={{ opacity: isHovered ? 0 : 1 }}
        transition={{ duration: 0.2, delay: isHovered ? 0 : 0.15 }}
      >
        {posterUrl && (
          <Image
            src={posterUrl}
            alt={title || "Media poster"}
            fill
            sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
            className="object-cover rounded-lg"
            data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
          />
        )}
      </motion.div>

      {/* Expanded Content (Visible on hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 w-full h-full rounded-lg overflow-hidden flex flex-col bg-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.15 } }}
            exit={{ opacity: 0, transition: { delay: 0, duration: 0.1 } }}
            style={{
              width: '160%',
              left: '-30%',
              height: 'auto',
              aspectRatio: '16/9',
            }}
            onClick={handleCardClick}
          >
            {/* Backdrop Image */}
            <div className="relative w-full flex-shrink-0" style={{ paddingBottom: "56.25%" /* 16:9 aspect ratio */ }}>
              {backdropUrl && (
                <Image
                  src={backdropUrl}
                  alt={`${title} backdrop`}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            </div>
            
            {/* Details */}
            <div className="p-3 flex-grow flex flex-col justify-between">
              <h3 className="font-bold text-sm text-card-foreground truncate">{title}</h3>
              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <Button size="icon" className="h-8 w-8 rounded-full" asChild>
                    <Link href={detailPath} onClick={e => e.stopPropagation()}>
                      <PlayCircle className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={handleWatchlistToggle}>
                    {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </Button>
                </div>
                {item.vote_average > 0 && (
                  <div className="flex items-center text-xs text-amber-400">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    <span>{item.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
