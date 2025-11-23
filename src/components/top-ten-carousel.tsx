
'use client';

import * as React from "react";
import type { Media } from "@/types/tmdb";
import { getTrending } from "@/lib/tmdb";
import { MediaCard } from "./media-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

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

export function TopTenCarousel() {
  const [mediaItems, setMediaItems] = React.useState<Media[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      try {
        const items = await getTrending('movie', 'day');
        setMediaItems(items.slice(0, 10));
      } catch (error) {
        console.error("Failed to fetch top 10 trending:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (isLoading || mediaItems.length === 0) {
    return null; // Or a loading skeleton
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
        Top 10 Movies Today
      </motion.h2>
      
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {mediaItems.map((item, index) => (
            <CarouselItem
              key={`${item.id}-${index}`}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4 pr-2"
            >
              <motion.div variants={itemVariants} className="flex items-center">
                <span className="text-6xl font-black text-muted-foreground/20 -mr-4">{index + 1}</span>
                <MediaCard item={item} />
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
