
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Check, Star, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  const fallbackImage = PlaceHolderImages.find(p => p.id === 'media-fallback');
  const imageUrl = item.poster_path ? getTmdbImageUrl(item.poster_path) : fallbackImage?.imageUrl;
  const title = item.title || item.name;

  const streamPath = item.media_type === 'tv' ? `/stream/tv/${item.id}/1/1` : `/stream/movie/${item.id}`;

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
  
  return (
    <Link href={`/media/${item.media_type}/${item.id}`} className="block">
        <motion.div
          whileHover="hover"
          className="relative aspect-[2/3] rounded-lg overflow-hidden group"
          variants={{
            hover: {
              scale: 1.05,
              boxShadow: "0px 10px 30px -5px rgba(0, 0, 0, 0.3)",
              y: -8,
            },
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={title || "Media poster"}
              fill
              sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
              className="object-cover"
              data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <h3 className="font-bold text-sm text-white truncate mb-1">{title}</h3>
            {item.vote_average > 0 && (
              <div className="flex items-center text-xs text-amber-400 mb-2">
                <Star className="w-3 h-3 mr-1 fill-current" />
                <span>{item.vote_average.toFixed(1)}</span>
              </div>
            )}
            <div className="flex gap-2">
                <Button size="sm" className="flex-1" asChild onClick={(e) => e.stopPropagation()}>
                  <Link href={streamPath}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Watch
                  </Link>
                </Button>
                <Button size="sm" variant="secondary" onClick={handleWatchlistToggle}>
                    {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
            </div>
          </div>
        </motion.div>
    </Link>
  );
}
