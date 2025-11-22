
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

interface MediaCardProps {
  item: Media;
}

export function MediaCard({ item }: MediaCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  const fallbackImage = PlaceHolderImages.find(p => p.id === 'media-fallback');
  const imageUrl = item.poster_path ? getTmdbImageUrl(item.poster_path) : fallbackImage?.imageUrl;
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
    // Prevent navigation if a button was clicked
    if ((e.target as HTMLElement).closest('button')) {
        return;
    }
    e.preventDefault();
    router.push(detailPath);
  }

  const cardVariants = {
    initial: { 
      scale: 1,
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    },
    hover: {
      scale: 1.1,
      zIndex: 10,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.15
      },
    },
  };
  
  const expandedDetailsVariants = {
    initial: { 
        opacity: 0, 
        height: 0,
        width: "100%",
    },
    hover: {
      opacity: 1,
      height: "auto",
      width: "180%", // Expand sideways
      transition: {
        opacity: { delay: 0.25, duration: 0.3 },
        height: { delay: 0.25, type: "spring", stiffness: 200, damping: 25 },
        width: { delay: 0.25, type: "spring", stiffness: 300, damping: 25 }
      },
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
      className="relative aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer bg-card"
    >
        {/* Poster Image (always visible) */}
        {imageUrl && (
            <Image
                src={imageUrl}
                alt={title || "Media poster"}
                fill
                sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Expanded Details - positioned absolutely to overlay content */}
       <motion.div
        variants={expandedDetailsVariants}
        className="absolute bottom-0 left-[-40%] w-[180%] p-4 bg-card/90 backdrop-blur-sm rounded-b-lg overflow-hidden flex flex-col justify-end"
        style={{ pointerEvents: 'none' }} // Initially no pointer events
      >
        <motion.div 
            className="flex flex-col gap-2 animate-fade-in"
            style={{ pointerEvents: 'auto' }} // Re-enable pointer events for content
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
            <div className="flex gap-2 w-full mt-2">
                <Button size="sm" className="flex-1" asChild>
                <Link href={detailPath}>
                    <Info className="w-4 h-4 mr-1" />
                    Details
                </Link>
                </Button>
                <Button size="sm" variant="secondary" onClick={handleWatchlistToggle}>
                    {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
            </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
