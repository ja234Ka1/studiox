
"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, VolumeX, Volume2, ListPlus, Check } from "lucide-react";
import { useState, useRef } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useRouter } from "next/navigation";

import type { MediaDetails } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import YouTubeEmbed from "./youtube-embed";
import { useTheme, type StreamSource } from "@/context/theme-provider";
import { StreamSourceDialog } from "./stream-source-dialog";
import { useWatchlist } from "@/context/watchlist-provider";

interface DetailPageHeroProps {
  item: MediaDetails;
}

export function DetailPageHero({ item }: DetailPageHeroProps) {
  const router = useRouter();
  
  const [showTrailer, setShowTrailer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const { dataSaver, setStreamSource } = useTheme();
  const { addToWatchlist, isInWatchlist, removeFromWatchlist } = useWatchlist();

  const [showSourceDialog, setShowSourceDialog] = useState(false);
  
  const onWatchlist = isInWatchlist(item.id);

  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';

  const trailer = item.videos?.results?.find(v => v.type === 'Trailer' && v.official) 
                  || item.videos?.results?.find(v => v.type === 'Trailer');


  const handleMouseEnter = () => {
    if (trailer && !dataSaver) {
      setShowTrailer(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTrailer(false);
    setIsMuted(true); // Always reset to muted when preview ends
  };

  const handleSelectSource = (source: StreamSource) => {
    setStreamSource(source);
    setShowSourceDialog(false);
    const streamPath = item.media_type === 'tv'
      ? `/stream/tv/${item.id}?s=1&e=1`
      : `/stream/movie/${item.id}`;
    router.push(streamPath);
  };
  
  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWatchlist) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  };

  return (
    <>
    <div 
      className="relative w-full h-[60vh] lg:h-[85vh]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0">
        <AnimatePresence>
            <motion.div
              key="image"
              initial={{ opacity: 1 }}
              animate={{ opacity: showTrailer ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
                <Image
                src={getTmdbImageUrl(item.backdrop_path, "original")}
                alt={title || "Hero backdrop"}
                fill
                priority
                className="object-cover"
                />
          </motion.div>
        </AnimatePresence>
        
        <AnimatePresence>
          {showTrailer && trailer && (
             <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                  <YouTubeEmbed 
                    videoId={trailer.key} 
                    isMuted={isMuted}
                    onReady={(event) => {
                      playerRef.current = event.target;
                    }}
                  />
            </motion.div>
          )}
        </AnimatePresence>


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
            <Button size="lg" onClick={() => setShowSourceDialog(true)}>
                <PlayCircle className="mr-2" />
                Watch
            </Button>
            <Button size="lg" variant="outline" onClick={handleWatchlistToggle}>
              {isInWatchlist(item.id) ? <Check className="mr-2" /> : <ListPlus className="mr-2" />}
              {isInWatchlist(item.id) ? 'On Watchlist' : 'Add to Watchlist'}
            </Button>
          </div>
        </motion.div>
      </div>

      {showTrailer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute z-20 right-8 bottom-24"
        >
          <Button
            size="icon"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted((prev) => !prev);
            }}
            className="rounded-full h-12 w-12"
          >
            {isMuted ? <VolumeX /> : <Volume2 />}
            <span className="sr-only">Toggle mute</span>
          </Button>
        </motion.div>
      )}
    </div>
    <StreamSourceDialog 
        isOpen={showSourceDialog} 
        onOpenChange={setShowSourceDialog}
        onSelectSource={handleSelectSource}
    />
    </>
  );
}
