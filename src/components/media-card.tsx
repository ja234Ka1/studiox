
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Star, Info } from "lucide-react";
import { useEffect, useState } from "react";
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

  const cardVariants = {
    initial: { scale: 1, zIndex: 10, y: 0 },
    hover: { 
      scale: 1.15, 
      zIndex: 20, 
      y: -10,
      transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.2 },
    },
  };

  const detailsVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { duration: 0.3, delay: 0.2 }
    },
  };

  return (
    <motion.div
      layout
      className="relative aspect-[2/3]"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        variants={cardVariants}
        animate={isHovered ? "hover" : "initial"}
        className="w-full h-full rounded-lg shadow-lg bg-card overflow-hidden cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Main Card Content (Always Visible Part) */}
        <div className="w-full h-full">
            {posterUrl && (
                <Image
                    src={posterUrl}
                    alt={title || "Media poster"}
                    fill
                    sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
                    className="object-cover"
                    data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
                />
            )}
        </div>
        
        {/* Expanded Details - Absolutely Positioned */}
        <AnimatePresence>
        {isHovered && (
          <motion.div
            variants={detailsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute top-full left-0 right-0 w-full bg-card rounded-b-lg shadow-lg"
          >
            <div className="relative w-full aspect-video">
              {backdropUrl && (
                  <Image
                      src={backdropUrl}
                      alt={`${title} backdrop`}
                      fill
                      className="object-cover"
                  />
              )}
               <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
            </div>
            <div className="p-3 space-y-2">
              <h3 className="font-bold text-base text-card-foreground truncate">{title}</h3>
              {item.vote_average > 0 && (
                  <div className="flex items-center text-xs text-amber-400">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      <span>{item.vote_average.toFixed(1)}</span>
                  </div>
              )}
              <div className="flex gap-2 w-full mt-1">
                  <Button size="sm" className="flex-1 text-xs" asChild>
                  <Link href={detailPath}>
                      <Info className="w-3.5 h-3.5 mr-1" />
                      Details
                  </Link>
                  </Button>
                  <Button size="sm" variant="secondary" className="px-2" onClick={handleWatchlistToggle}>
                      {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </Button>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
