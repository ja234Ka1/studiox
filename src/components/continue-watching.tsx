
'use client';

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
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

interface WatchProgress {
  currentTime: number;
  duration: number;
  lastWatched: number;
  eventType: string;
  mediaType: MediaType;
  title?: string;
  poster?: string;
  watched_percentage?: number;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  // Full media details might be added later
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


const getWatchingItemsFromStorage = async (): Promise<[string, WatchProgress][]> => {
    try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('progress_'));
        const progressItemsPromises: Promise<[string, WatchProgress] | null>[] = keys.map(async key => {
            const item = localStorage.getItem(key);
            if (!item) return null;
            
            const parsed = JSON.parse(item) as WatchProgress;
            
            // If details are already fetched, use them.
            if (parsed.details) {
                const mediaId = key.split('_')[2];
                return [mediaId, parsed];
            }

            // Fetch details if missing
            const mediaType = parsed.mediaType;
            const mediaId = key.split('_')[2];
            const numericId = parseInt(mediaId, 10);
            if (isNaN(numericId)) return null;

            const details = await getMediaDetails(numericId, mediaType);
            
            const updatedProgress: WatchProgress = {
                ...parsed,
                details,
                title: details.title || details.name,
                poster: details.poster_path,
                watched_percentage: (parsed.currentTime / parsed.duration) * 100,
            };

            if (mediaType === 'tv' && details.seasons && parsed.season) {
                const seasonData = details.seasons.find(s => s.season_number === parsed.season);
                if (seasonData && parsed.episode) {
                     const episodeData = seasonData.episodes?.find(e => e.episode_number === parsed.episode);
                     updatedProgress.episodeTitle = episodeData?.name;
                }
            }
            
            // Save back to localStorage with details
            localStorage.setItem(key, JSON.stringify(updatedProgress));

            return [mediaId, updatedProgress];
        });

        const resolvedItems = await Promise.all(progressItemsPromises);
        const validItems = resolvedItems.filter((item): item is [string, WatchProgress] => 
            item !== null && 
            item[1] !== null && 
            item[1].duration > 0 && 
            (item[1].watched_percentage ?? 0) < 95
        );
      
        const sortedItems = validItems.sort((a, b) => b[1].lastWatched - a[1].lastWatched);
            
        return sortedItems;
    } catch (error) {
        console.error("Failed to parse progress from storage:", error);
        return [];
    }
}


const ContinueWatchingCard = ({ item, mediaId }: { item: WatchProgress, mediaId: string }) => {
  if (!item.details) return null;

  let streamPath = `/stream/${item.mediaType}/${mediaId}`;
  let subTitle = "Resume Watching";

  if (item.mediaType === 'tv' && item.season && item.episode) {
    streamPath += `?s=${item.season}&e=${item.episode}`;
    subTitle = `S${item.season} E${item.episode}: ${item.episodeTitle || ''}`;
  }

  return (
    <LoadingLink href={streamPath} className="group block">
        <Card className="relative aspect-video w-full rounded-md overflow-hidden shadow-md">
            <Image
                src={getTmdbImageUrl(item.details.backdrop_path, 'w500')}
                alt={item.title || ''}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                <PlayCircle className="w-12 h-12 text-white/80" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h3 className="font-bold truncate text-sm">{item.title}</h3>
                <p className="text-xs text-white/70 truncate">{subTitle}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0">
                <Progress value={item.watched_percentage} className="h-1 bg-white/20 border-0" />
            </div>
        </Card>
    </LoadingLink>
  );
};


export default function ContinueWatching() {
  const [watchingItems, setWatchingItems] = React.useState<[string, WatchProgress][]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadProgress = React.useCallback(async () => {
    const items = await getWatchingItemsFromStorage();
    setWatchingItems(items);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadProgress();
    
    const handleProgressChange = (e: StorageEvent | CustomEvent) => {
        loadProgress();
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
        <div className="container px-4 md:px-8">
             <h2 className="text-2xl font-bold mb-4">Continue Watching</h2>
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/20 p-8 text-center h-48">
                <p className="text-lg font-semibold text-foreground">No items to continue watching</p>
                <p className="mt-1 text-sm text-muted-foreground">Start watching a movie or show to see it here.</p>
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
          {watchingItems.map(([mediaId, item]) => (
            <CarouselItem
              key={mediaId}
              className="basis-2/3 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-4 pr-2"
            >
              <motion.div layout variants={itemVariants}>
                <ContinueWatchingCard mediaId={mediaId} item={item} />
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
