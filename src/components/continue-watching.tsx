
'use client';

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, X } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getTmdbImageUrl } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import LoadingLink from "./loading-link";
import type { MediaType, MediaDetails } from "@/types/tmdb";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { getMediaDetails } from "@/lib/tmdb";
import { Button } from "./ui/button";

// This is the UNIFIED/NORMALIZED data structure we will use internally
interface NormalizedProgress {
  id: string; // mediaId
  mediaType: MediaType;
  currentTime: number;
  duration: number;
  lastWatched: number;
  season?: number;
  episode?: number;
  // Details fetched and added later
  details?: MediaDetails;
}

const carouselVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * Normalizes progress data from various sources (Prime, Elite) into a single format.
 * @param key The localStorage key (e.g., 'progress_movie_12345')
 * @param rawData The raw parsed JSON data from localStorage.
 * @returns A NormalizedProgress object or null if invalid.
 */
const normalizeProgressData = (key: string, rawData: any): NormalizedProgress | null => {
    if (!rawData || typeof rawData !== 'object') return null;

    const keyParts = key.split('_');
    const mediaType = keyParts[1] as MediaType;
    const mediaId = keyParts[2];
    
    if ((mediaType !== 'movie' && mediaType !== 'tv') || !mediaId) return null;

    let normalized: Partial<NormalizedProgress> = {
        id: mediaId,
        mediaType: mediaType,
    };

    // Detect 'Elite' source structure (vidify)
    if ('currentTime' in rawData && 'duration' in rawData && 'lastWatched' in rawData && 'watched_percentage' in rawData) {
        normalized.currentTime = rawData.currentTime;
        normalized.duration = rawData.duration;
        normalized.lastWatched = rawData.lastWatched;
        normalized.season = rawData.season;
        normalized.episode = rawData.episode;
    }
    // Detect 'Prime' source structure (vidfast) from PLAYER_EVENT
    else if ('event' in rawData && 'currentTime' in rawData && 'duration' in rawData) {
        normalized.currentTime = rawData.currentTime;
        normalized.duration = rawData.duration;
        normalized.lastWatched = rawData.lastWatched || Date.now();
        normalized.season = rawData.season;
        normalized.episode = rawData.episode;
    }
    else {
        return null; // Unrecognized format
    }

    // Add details if they are already in the cached object
    if (rawData.details) {
        normalized.details = rawData.details;
    }

    // Basic validation
    if (normalized.currentTime === undefined || normalized.duration === undefined || normalized.duration <= 0) {
        return null;
    }

    return normalized as NormalizedProgress;
}


const getWatchingItemsFromStorage = async (): Promise<NormalizedProgress[]> => {
    try {
        if (typeof window === 'undefined') return [];
        const keys = Object.keys(localStorage).filter(k => k.startsWith('progress_'));
        
        const progressItemsPromises: Promise<NormalizedProgress | null>[] = keys.map(async key => {
            const item = localStorage.getItem(key);
            if (!item) return null;
            
            const parsed = JSON.parse(item);
            let normalized = normalizeProgressData(key, parsed);

            if (!normalized || (normalized.currentTime / normalized.duration) * 100 > 95) {
                return null;
            }

            // If details are missing, fetch them
            if (!normalized.details) {
                const numericId = parseInt(normalized.id, 10);
                if (isNaN(numericId)) return null;

                try {
                    const details = await getMediaDetails(numericId, normalized.mediaType);
                    normalized.details = details;
                    // Save back to localStorage with details for caching
                    const updatedDataToStore = { ...parsed, details };
                    localStorage.setItem(key, JSON.stringify(updatedDataToStore));
                } catch (fetchError) {
                    console.error(`Failed to fetch details for ${normalized.mediaType} ${normalized.id}:`, fetchError);
                    return null; // Don't include items we can't get details for
                }
            }

            return normalized;
        });

        const resolvedItems = await Promise.all(progressItemsPromises);
        const validItems = resolvedItems.filter((item): item is NormalizedProgress => item !== null);
      
        const sortedItems = validItems.sort((a, b) => b.lastWatched - a.lastWatched);
            
        return sortedItems;
    } catch (error) {
        console.error("Failed to parse progress from storage:", error);
        return [];
    }
}


const ContinueWatchingCard = ({ item, onRemove }: { item: NormalizedProgress, onRemove: (mediaType: MediaType, mediaId: string) => void }) => {
  if (!item.details) return null;

  const watchedPercentage = (item.currentTime / item.duration) * 100;
  let streamPath = `/stream/${item.mediaType}/${item.id}`;
  let subTitle = `Resume Watching`;

  if (item.mediaType === 'tv' && item.season && item.episode) {
    streamPath += `?s=${item.season}&e=${item.episode}`;
    // @ts-ignore private api
    const episodeTitle = item.details.seasons?.find(s => s.season_number === item.season)?.episodes?.find(e => e.episode_number === item.episode)?.name;
    
    subTitle = `S${item.season} E${item.episode}${episodeTitle ? `: ${episodeTitle}` : ''}`;
  }
  
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(item.mediaType, item.id);
  }


  return (
    <LoadingLink href={streamPath} className="group/card block">
        <Card className="relative aspect-video w-full rounded-md overflow-hidden shadow-md">
            <Image
                src={getTmdbImageUrl(item.details.backdrop_path, 'w500')}
                alt={item.details.title || item.details.name || ''}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover/card:scale-105"
            />
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-2 right-2 z-20 opacity-0 group-hover/card:opacity-100 transition-opacity"
                >
                    <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm hover:bg-destructive"
                        onClick={handleRemoveClick}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove from continue watching</span>
                    </Button>
                </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-black/40">
                <PlayCircle className="w-12 h-12 text-white/80" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h3 className="font-bold truncate text-sm">{item.details.title || item.details.name}</h3>
                <p className="text-xs text-white/70 truncate">{subTitle}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0">
                <Progress value={watchedPercentage} className="h-1 bg-white/20 border-0" />
            </div>
        </Card>
    </LoadingLink>
  );
};


export default function ContinueWatching() {
  const [watchingItems, setWatchingItems] = React.useState<NormalizedProgress[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadProgress = React.useCallback(async () => {
    setLoading(true);
    const items = await getWatchingItemsFromStorage();
    setWatchingItems(items);
    setLoading(false);
  }, []);

  const handleRemove = React.useCallback((mediaType: MediaType, mediaId: string) => {
    if (typeof window === 'undefined') return;
    const key = `progress_${mediaType}_${mediaId}`;
    localStorage.removeItem(key);
    // Manually trigger a re-load to update the UI
    loadProgress();
    // Dispatch a storage event so other tabs/components can update
    window.dispatchEvent(new StorageEvent('storage', { key }));
  }, [loadProgress]);

  React.useEffect(() => {
    loadProgress();
    
    const handleProgressChange = (e: Event) => {
        // This event can be a standard StorageEvent or our custom event
        const customEvent = e as CustomEvent;
        if ((e as StorageEvent).key?.startsWith('progress_') || customEvent.detail?.key?.startsWith('progress_') || customEvent.type === 'willow-progress-change') {
            loadProgress();
        }
    }

    window.addEventListener('storage', handleProgressChange);
    window.addEventListener('willow-progress-change', handleProgressChange);
    
    return () => {
        window.removeEventListener('storage', handleProgressChange);
        window.removeEventListener('willow-progress-change', handleProgressChange);
    };
  }, [loadProgress]);

  if (loading) {
      return (
          <div className="px-4 md:px-8">
              <Skeleton className="h-8 w-64 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="aspect-video" />)}
              </div>
          </div>
      )
  }

  if (watchingItems.length === 0) {
    return (
        <div>
             <h2 className="text-2xl font-bold mb-4 container px-4 md:px-8">Continue Watching</h2>
             <div className="container px-4 md:px-8">
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/20 p-8 text-center h-48">
                    <p className="text-lg font-semibold text-foreground">No items to continue watching</p>
                    <p className="mt-1 text-sm text-muted-foreground">Start watching a movie or show to see it here.</p>
                </div>
             </div>
        </div>
    );
  }

  return (
    <motion.section 
        className="text-left w-full group"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={carouselVariants}
    >
      <motion.h2 
        className="text-2xl font-bold mb-4 px-4 md:px-8"
        variants={itemVariants}
      >
        Continue Watching
      </motion.h2>
      
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {watchingItems.map((item) => (
            <CarouselItem
              key={item.id}
              className="basis-2/3 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-4 pr-2"
            >
              <motion.div layout variants={itemVariants}>
                <ContinueWatchingCard item={item} onRemove={handleRemove} />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CarouselNext className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Carousel>
    </motion.section>
  );
}
