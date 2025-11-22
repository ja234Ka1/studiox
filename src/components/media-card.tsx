
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Star, PlayCircle, ChevronDown } from "lucide-react";
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

  const year = item.release_date || item.first_air_date
    ? new Date(item.release_date! || item.first_air_date!).getFullYear()
    : 'N/A';

  return (
    <motion.div
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ layout: { duration: 0.3, ease: 'easeOut' } }}
      className="relative aspect-[2/3] bg-card rounded-lg shadow-lg cursor-pointer"
      style={{
        zIndex: isHovered ? 10 : 0
      }}
    >
      <div className="w-full h-full" onClick={handleCardClick}>
        <Image
            src={posterUrl!}
            alt={title || "Media poster"}
            fill
            sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
            className="object-cover rounded-lg"
            data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
          />
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            layoutId={`card-container-${item.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[250%] max-w-none shadow-2xl bg-card rounded-lg overflow-hidden"
            style={{
                top: '-50%'
            }}
          >
            <div className="relative aspect-video">
                <Image
                    src={backdropUrl!}
                    alt={`${title} backdrop`}
                    fill
                    className="object-cover"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            </div>
            <div className="p-4 space-y-3">
                 <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Button size="icon" className="h-9 w-9 rounded-full bg-primary text-primary-foreground" asChild>
                            <Link href={detailPath} onClick={e => e.stopPropagation()}>
                                <PlayCircle className="w-4 h-4 fill-current" />
                            </Link>
                        </Button>
                        <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full" onClick={handleWatchlistToggle}>
                            {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </Button>
                    </div>
                    <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full" asChild>
                        <Link href={detailPath} onClick={e => e.stopPropagation()}>
                            <ChevronDown className="w-5 h-5" />
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {item.vote_average > 0 && (
                        <div className="flex items-center text-green-400 font-semibold">
                            <span>{Math.round(item.vote_average * 10)}% Match</span>
                        </div>
                    )}
                    <span className="border px-1.5 py-0.5 rounded text-xs">{year}</span>
                    <span className="font-semibold text-foreground truncate">{title}</span>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
