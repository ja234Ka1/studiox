
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Info, PlayCircle, Plus, Check } from "lucide-react";
import { useEffect, useState } from "react";

import type { MediaDetails } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useVideo } from "@/context/video-provider";
import { useToast } from "@/hooks/use-toast";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "@/lib/userData";
import Link from "next/link";

interface DetailPageHeroProps {
  item: MediaDetails;
}

export function DetailPageHero({ item }: DetailPageHeroProps) {
  const { playVideo } = useVideo();
  const { toast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';

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

  const handlePlayTrailer = () => {
    playVideo(item.id, item.media_type);
  };

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlist(item.id);
      toast({ title: `Removed from Watchlist`, description: `"${title}" has been removed.` });
    } else {
      // Ensure media_type is passed when adding to watchlist
      const itemToAdd = { ...item, media_type: item.media_type || (item.title ? 'movie' : 'tv') };
      addToWatchlist(itemToAdd);
      toast({ title: 'Added to Watchlist', description: `"${title}" has been added.` });
    }
  };

  const trailer = item.videos?.results?.find(v => v.type === 'Trailer' && v.official);
  const streamPath = item.media_type === 'tv' ? `/stream/tv/${item.id}/1/1` : `/stream/movie/${item.id}`;


  return (
    <div className="relative w-full h-[60vh] lg:h-[85vh]">
      <div className="absolute inset-0">
        <Image
          src={getTmdbImageUrl(item.backdrop_path, "original")}
          alt={title || "Hero backdrop"}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
      </div>

      <div className="relative z-10 container h-full flex flex-col justify-end items-start pb-16 md:pb-24 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl"
        >
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {item.media_type && <Badge variant="secondary">{item.media_type.toUpperCase()}</Badge>}
            <Badge variant="outline">{year}</Badge>
            {item.genres?.slice(0, 3).map(genre => (
                <Badge key={genre.id} variant="outline">{genre.name}</Badge>
            ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight mb-6">
            {title}
          </h1>
          
          <div className="flex items-center gap-4">
            <Button size="lg" asChild>
              <Link href={streamPath}>
                <PlayCircle className="mr-2" />
                Watch
              </Link>
            </Button>
            {trailer && (
                <Button size="lg" variant="secondary" onClick={handlePlayTrailer}>
                  Play Trailer
                </Button>
            )}
            <Button size="lg" variant="secondary" onClick={handleWatchlistToggle}>
                {isInWatchlist ? <Check className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
              {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
