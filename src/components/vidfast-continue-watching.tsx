
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
import Link from "next/link";
import type { MediaType } from "@/types/tmdb";
import { Card } from "./ui/card";

// Types matching the VidFast localStorage structure
interface VidFastProgressDetails {
  watched: number;
  duration: number;
}

interface VidFastEpisodeProgress {
  season: number;
  episode: number;
  progress: VidFastProgressDetails;
  last_updated: number;
}

interface VidFastMedia {
  id: string;
  type: MediaType;
  title: string;
  poster_path: string;
  backdrop_path: string;
  progress: VidFastProgressDetails;
  last_updated: number;
  last_season_watched?: number;
  last_episode_watched?: number;
  show_progress?: Record<string, VidFastEpisodeProgress>;
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

const ContinueWatchingCard = ({ item }: { item: VidFastMedia }) => {
  const progressPercent = (item.progress.watched / item.progress.duration) * 100;
  
  let streamPath = `/stream/${item.type}/${item.id}`;
  let subTitle = "Resume Watching";

  if (item.type === 'tv' && item.last_season_watched && item.last_episode_watched) {
    streamPath += `?s=${item.last_season_watched}&e=${item.last_episode_watched}`;
    subTitle = `S${item.last_season_watched} E${item.last_episode_watched}`;
  }

  return (
    <Link href={streamPath} className="group block">
        <Card className="relative aspect-video w-full rounded-md overflow-hidden shadow-md">
            <Image
                src={getTmdbImageUrl(item.backdrop_path, 'w500')}
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
                <p className="text-xs text-white/70">{subTitle}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0">
                <Progress value={progressPercent} className="h-1 bg-white/20 border-0" />
            </div>
        </Card>
    </Link>
  );
};


export default function VidfastContinueWatching() {
  const [items, setItems] = React.useState<VidFastMedia[]>([]);

  const loadProgress = React.useCallback(() => {
    try {
      const progressData = localStorage.getItem('vidFastProgress');
      if (progressData) {
        const parsedData: Record<string, VidFastMedia> = JSON.parse(progressData);
        const sortedItems = Object.values(parsedData).sort((a, b) => b.last_updated - a.last_updated);
        setItems(sortedItems);
      }
    } catch (error) {
      console.error("Failed to parse VidFast progress:", error);
      setItems([]);
    }
  }, []);

  React.useEffect(() => {
    loadProgress();
    window.addEventListener('vidfast-progress-change', loadProgress);
    return () => {
      window.removeEventListener('vidfast-progress-change', loadProgress);
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
              className="basis-2/3 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-4 pr-2"
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
