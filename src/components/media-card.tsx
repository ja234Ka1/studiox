
"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Star, Bookmark, BookmarkCheck, Loader2, Plus, Info } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from 'next/link';

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl, cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "./ui/button";
import { useWatchlist } from "@/context/watchlist-provider";
import { getMediaDetails } from "@/lib/tmdb";
import { Badge } from "./ui/badge";

interface MediaCardProps {
  item: Media;
}

const genresMap: { [key: number]: string } = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Science Fiction", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
  10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics"
};

const getGenreNames = (ids: number[]) => {
  return ids.slice(0, 3).map(id => genresMap[id]).filter(Boolean);
}

export function MediaCard({ item }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  
  const onWatchlist = isInWatchlist(item.id);

  const fallbackImage = PlaceHolderImages.find(p => p.id === 'media-fallback');
  const posterUrl = item.poster_path ? getTmdbImageUrl(item.poster_path, 'w500') : fallbackImage?.imageUrl;
  const backdropUrl = item.backdrop_path ? getTmdbImageUrl(item.backdrop_path, 'w500') : posterUrl;
  
  const title = item.title || item.name;
  
  const mediaId = String(item.id);
  const mediaTypeForPath = item.media_type;
  const detailPath = `/media/${mediaTypeForPath}/${mediaId}`;
  const streamPath = `/stream/${mediaTypeForPath}/${mediaId}${mediaTypeForPath === 'tv' ? '?s=1&e=1' : ''}`;

  const genreNames = getGenreNames(item.genre_ids || []);

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
    setIsWatchlistLoading(false);
  }, [onWatchlist]);

  return (
    <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative aspect-[2/3] w-full rounded-md"
        layout
    >
        <AnimatePresence>
            {!isHovered && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.15 } }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                >
                    <Image
                        src={posterUrl!}
                        alt={title || "Media"}
                        fill
                        sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
                        className="object-cover rounded-md"
                        data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
                    />
                </motion.div>
            )}
        </AnimatePresence>
        
        <AnimatePresence>
            {isHovered && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1.2, zIndex: 20 }}
                    exit={{ opacity: 0, scale: 0.9, zIndex: 1, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                    className="absolute inset-0 aspect-video rounded-lg bg-card shadow-2xl flex flex-col"
                >
                    <div className="relative w-full aspect-video rounded-t-lg overflow-hidden">
                        <Image
                            src={backdropUrl!}
                            alt={title || "Media"}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <Link href={streamPath} className="absolute inset-0 flex items-center justify-center">
                            <PlayCircle className="w-12 h-12 text-white/80 transition-all hover:text-white hover:scale-110 filter-glow" />
                        </Link>
                    </div>
                    <div className="p-3 w-full flex-grow flex flex-col justify-between">
                        <div>
                            <h3 className="text-white font-bold text-sm truncate w-full">{title}</h3>
                            <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1.5">
                                {genreNames.map((genre, index) => (
                                    <React.Fragment key={genre}>
                                        <span>{genre}</span>
                                        {index < genreNames.length - 1 && <span className="text-muted-foreground/50">•</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                           <div className="flex items-center gap-2">
                                <Button size="icon" className="h-8 w-8 rounded-full" variant="outline" onClick={handleToggleWatchlist}>
                                    {isWatchlistLoading ? (
                                    <Loader2 className="animate-spin" />
                                    ) : (
                                    <Plus />
                                    )}
                                </Button>
                                <Button size="icon" className="h-8 w-8 rounded-full" variant="outline" asChild>
                                    <Link href={detailPath} onClick={(e) => e.stopPropagation()}>
                                        <Info />
                                    </Link>
                                </Button>
                           </div>
                           <div>
                                <Badge variant="outline">HD</Badge>
                           </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  );
}
