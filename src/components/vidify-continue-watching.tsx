
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
import type { MediaType } from "@/types/tmdb";
import { Card } from "./ui/card";

interface VidifyProgress {
  currentTime: number;
  duration: number;
  lastWatched: number;
  eventType: string;
  mediaType: MediaType;
  title: string;
  poster: string;
  watched_percentage: number;
  season?: number;
  episode?: number;
  episodeTitle?: string;
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

const ContinueWatchingCard = ({ item, mediaId }: { item: VidifyProgress, mediaId: string }) => {
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
                src={getTmdbImageUrl(item.poster, 'w500')}
                alt={item.title}
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


export default function VidifyContinueWatching() {
  const [items, setItems] = React.useState<[string, VidifyProgress][]>([]);

  const loadProgress = React.useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('progress_'));
      const progressItems: [string, VidifyProgress][] = keys.map(key => {
        const item = localStorage.getItem(key);
        const parsed = item ? JSON.parse(item) : {};
        const mediaId = key.split('_')[2];
        return [mediaId, parsed];
      });
      
      const sortedItems = progressItems
        .filter(item => item[1] && item[1].duration > 0 && item[1].watched_percentage < 95)
        .sort((a, b) => b[1].lastWatched - a[1].lastWatched);
        
      setItems(sortedItems);

    } catch (error) {
      console.error("Failed to parse Vidify progress:", error);
      setItems([]);
    }
  }, []);

  React.useEffect(() => {
    loadProgress();
    window.addEventListener('vidify-progress-change', loadProgress);
    return () => {
      window.removeEventListener('vidify-progress-change', loadProgress);
    };
  }, [loadProgress]);

  if (items.length === 0) {
    return null;
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
        Continue Watching (Vidify)
      </motion.h2>
      
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {items.map(([mediaId, item]) => (
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

