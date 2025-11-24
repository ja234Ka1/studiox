
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from 'next/link';
import { PlayCircle, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import * as React from 'react';

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "./ui/button";
import { useWatchlist } from "@/context/watchlist-provider";

interface MediaCardProps {
  item: Media;
}

export function MediaCard({ item }: MediaCardProps) {
  const fallbackImage = PlaceHolderImages.find(p => p.id === 'media-fallback');
  const posterUrl = item.poster_path ? getTmdbImageUrl(item.poster_path, 'w500') : fallbackImage?.imageUrl;
  const title = item.title || item.name;
  const detailPath = `/media/${item.media_type}/${item.id}`;
  const streamPath = `/stream/${item.media_type}/${item.id}${item.media_type === 'tv' ? '?s=1&e=1' : ''}`;

  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [isWatchlistLoading, setIsWatchlistLoading] = React.useState(false);
  const onWatchlist = isInWatchlist(item.id);
  
  React.useEffect(() => {
    setIsWatchlistLoading(false);
  }, [onWatchlist]);

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWatchlistLoading(true);
    if (onWatchlist) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  };

  return (
    <Link href={detailPath}>
      <motion.div
        whileHover={{ scale: 1.1, zIndex: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative aspect-[2/3] w-full group overflow-hidden rounded-md shadow-lg"
      >
        <Image
          src={posterUrl!}
          alt={title || "Media"}
          fill
          sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
          className="object-cover"
          data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex justify-between items-center gap-2">
                <Button size="icon" className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm hover:bg-primary" asChild>
                    <Link href={streamPath} onClick={(e) => e.stopPropagation()}>
                        <PlayCircle className="w-5 h-5" />
                        <span className="sr-only">Watch</span>
                    </Link>
                </Button>
                <Button size="icon" className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20" onClick={handleToggleWatchlist}>
                    {isWatchlistLoading ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                    ) : onWatchlist ? (
                        <BookmarkCheck className="w-5 h-5 text-primary" />
                    ) : (
                        <Bookmark className="w-5 h-5" />
                    )}
                    <span className="sr-only">Add to watchlist</span>
                </Button>
            </div>
        </div>

      </motion.div>
    </Link>
  );
}
