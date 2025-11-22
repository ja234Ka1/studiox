
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Check, Star, Info } from "lucide-react";
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
}

export function MediaCard({ item }: MediaCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
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
  
  const handlePrefetch = () => {
    router.prefetch(detailPath);
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
        return;
    }
    e.preventDefault();
    router.push(detailPath);
  }

  const cardVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.1,
      zIndex: 20,
      transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.2 },
    },
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      onHoverStart={handlePrefetch}
      onClick={handleCardClick}
      className="relative aspect-[2/3] rounded-lg group cursor-pointer bg-card shadow-lg"
    >
      {/* Poster Image */}
      <motion.div 
        className="w-full h-full"
        animate={{ opacity: 1 }}
        whileHover={{ opacity: 0, transition: { delay: 0.15, duration: 0.2 } }}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg" />
      </motion.div>

      {/* Expanded Details - Hidden by default */}
      <motion.div
        className="absolute inset-0 w-full h-full rounded-lg overflow-hidden"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1, transition: { delay: 0.15, duration: 0.2 } }}
      >
        <div className="relative w-full h-full">
            {backdropUrl && (
                <Image
                    src={backdropUrl}
                    alt={`${title} backdrop`}
                    fill
                    className="object-cover"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        </div>
        <div 
            className="absolute bottom-0 left-0 right-0 p-3 text-white flex flex-col justify-end gap-2 animate-fade-in"
        >
            <h3 className="font-bold text-base text-card-foreground truncate">{title}</h3>
            {item.vote_average > 0 && (
                <div className="flex items-center text-xs text-amber-400">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    <span>{item.vote_average.toFixed(1)}</span>
                </div>
            )}
            <p className="text-xs text-muted-foreground line-clamp-3 my-1">
                {item.overview}
            </p>
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
    </motion.div>
  );
}
