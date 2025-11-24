
"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Star, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from 'next/link';

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl, cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "./ui/button";
import { useWatchlist } from "@/context/watchlist-provider";

interface MediaCardProps {
  item: Media;
}

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

export function MediaCard({ item }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  
  const onWatchlist = isInWatchlist(item.id);

  const fallbackImage = PlaceHolderImages.find(p => p.id === 'media-fallback');
  const posterUrl = item.poster_path ? getTmdbImageUrl(item.poster_path, 'w500') : fallbackImage?.imageUrl;
  
  const title = item.title || item.name;
  
  // Handle anime IDs which are strings
  const mediaId = String(item.id);
  const mediaTypeForPath = item.media_type;
  const detailPath = `/media/${mediaTypeForPath}/${mediaId}`;

  const year = item.release_date || item.first_air_date ? new Date(item.release_date || item.first_air_date!).getFullYear() : 'N/A';

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsWatchlistLoading(true);
    if (onWatchlist) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  };

  useEffect(() => {
    // When the onWatchlist status changes (via context), we know the operation is complete.
    setIsWatchlistLoading(false);
  }, [onWatchlist]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-card shadow-md cursor-pointer group"
    >
      <Link href={detailPath}>
        <Image
          src={posterUrl!}
          alt={title || "Media"}
          fill
          sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
        />
      </Link>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 p-3 flex flex-col justify-end items-center text-center bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          >
            <motion.h3 variants={itemVariants} className="text-white font-bold text-base truncate w-full mb-1">{title}</motion.h3>
            <motion.div variants={itemVariants} className="flex items-center text-xs text-muted-foreground mb-3 gap-2">
              {item.vote_average > 0 && (
                <>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-current"/>
                    <span>{item.vote_average.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                </>
              )}
              <span>{year}</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <Button size="icon" className="h-8 w-8 rounded-full" asChild >
                <Link href={detailPath} onClick={(e) => e.stopPropagation()}>
                    <PlayCircle className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="icon" className="h-8 w-8 rounded-full" variant="outline" onClick={handleToggleWatchlist}>
                {isWatchlistLoading ? (
                  <Loader2 className="animate-spin" />
                ) : onWatchlist ? (
                  <BookmarkCheck className="text-primary" />
                ) : (
                  <Bookmark />
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
