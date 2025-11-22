
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Check, PlayCircle, ChevronDown } from "lucide-react";
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
  
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(detailPath);
  }

  const year = item.release_date || item.first_air_date
    ? new Date(item.release_date! || item.first_air_date!).getFullYear()
    : 'N/A';

  const cardVariants = {
    initial: { scale: 1, zIndex: 1, boxShadow: '0px 5px 10px rgba(0,0,0,0.1)' },
    hover: { scale: 1.1, zIndex: 50, y: -20, boxShadow: '0px 15px 30px rgba(0,0,0,0.3)' },
  };

  return (
    <motion.div
      layoutId={`card-container-${item.id}`}
      variants={cardVariants}
      whileHover="hover"
      initial="initial"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative aspect-[2/3] rounded-lg bg-card cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Poster image - visible when not hovered */}
      <motion.div 
        className="w-full h-full"
        animate={{ opacity: 1 }}
        whileHover={{ opacity: 0 }}
      >
        <Image
          src={posterUrl!}
          alt={title || "Media poster"}
          fill
          sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
          className="object-cover rounded-lg"
          data-ai-hint={!item.poster_path ? fallbackImage?.imageHint : undefined}
        />
      </motion.div>

      {/* Expanded details - visible on hover */}
      <motion.div
        className="absolute inset-0 w-full h-full rounded-lg overflow-hidden flex flex-col pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="relative w-full aspect-video">
            <Image
                src={backdropUrl!}
                alt={`${title} backdrop`}
                fill
                className="object-cover"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
        </div>
        <div className="p-3 bg-card flex-grow pointer-events-auto flex flex-col justify-between">
             <div>
                <div className="flex items-center justify-between gap-2 mb-2">
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
                        <span className="text-green-400 font-semibold">{Math.round(item.vote_average * 10)}% Match</span>
                    )}
                    <span className="border px-1 py-0.5 rounded">{year}</span>
                    <span className="uppercase text-[0.6rem] border px-1 py-0.5 rounded">{item.media_type}</span>
                </div>
             </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
