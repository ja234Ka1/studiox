
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

// Types matching the VidZee localStorage structure
interface VidZeeProgressDetails {
  watched: number;
  duration: number;
}

interface VidZeeEpisodeProgress {
  season: string;
  episode: string;
  progress: VidZeeProgressDetails;
  last_updated: number;
}

interface VidZeeMedia {
  id: string;
  type: MediaType;
  title: string;
  poster_path: string;
  backdrop_path: string;
  progress: VidZeeProgressDetails;
  last_updated: number;
  number_of_episodes?: number;
  number_of_seasons?: number;
  last_season_watched?: string;
  last_episode_watched?: string;
  show_progress?: Record<string, VidZeeEpisodeProgress>;
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

const ContinueWatchingCard = ({ item }: { item: VidZeeMedia }) => {
  const progressPercent = (item.progress.watched / item.progress.duration) * 100;
  
  let streamPath = `/stream/${item.type}/${item.id}`;
  let subTitle = "Resume Watching";

  if (item.type === 'tv' && item.last_season_watched && item.last_episode_watched) {
    streamPath += `?s=${item.last_season_watched}&e=${item.last_episode_watched}`;
    subTitle = `S${item.last_season_watched} E${item.last_episode_watched}`;
  }

  return (
    <LoadingLink href={streamPath} className="group block">
      <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-card shadow-md">
        <Image
          src={getTmdbImageUrl(item.poster_path, 'w500')}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <PlayCircle className="w-12 h-12 text-white/80" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2">
            <Progress value={progressPercent} className="h-1 bg-white/20" />
        </div>
      </div>
      <div className="mt-2">
        <p className="font-semibold truncate text-sm">{item.title}</p>
        <p className="text-xs text-muted-foreground">{subTitle}</p>
      </div>
    </LoadingLink>
  );
};


export default function VidzeeContinueWatching() {
  const [items, setItems] = React.useState<VidZeeMedia[]>([]);

  const loadProgress = React.useCallback(() => {
    try {
      const progressData = localStorage.getItem('vidZeeProgress');
      if (progressData) {
        const parsedData: Record<string, VidZeeMedia> = JSON.parse(progressData);
        const sortedItems = Object.values(parsedData).sort((a, b) => b.last_updated - a.last_updated);
        setItems(sortedItems);
      }
    } catch (error) {
      console.error("Failed to parse VidZee progress:", error);
      setItems([]);
    }
  }, []);

  React.useEffect(() => {
    loadProgress();
    window.addEventListener('vidzee-progress-change', loadProgress);
    return () => {
      window.removeEventListener('vidzee-progress-change', loadProgress);
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
          {items.map((item, index) => (
            <CarouselItem
              key={`${item.id}-${index}`}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4 pr-2"
            >
              <motion.div layout variants={itemVariants}>
                <ContinueWatchingCard item={item} />
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
