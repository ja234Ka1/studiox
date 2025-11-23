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
import { Skeleton } from "./ui/skeleton";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "./ui/button";
import { PlayCircle } from "lucide-react";
import LoadingLink from "./loading-link";

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

  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnHover: true })
  );

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

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 md:px-8 space-y-6">
            <Skeleton className="h-16 w-1/2 mx-auto" />
            <div className="flex gap-4 overflow-hidden -ml-8">
                {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="flex items-center">
                        <Skeleton className="h-[200px] w-[100px] bg-transparent" />
                        <Skeleton className="w-[200px] aspect-[2/3]" />
                    </div>
                ))}
            </div>
        </div>
    )
  }

  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <motion.section 
      className="w-full group"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={carouselVariants}
    >
        <motion.div 
            className="text-center mb-6"
            variants={itemVariants}
        >
            <h2 className="text-4xl font-black tracking-tighter flex items-center justify-center gap-x-1 sm:gap-x-2">
                <span className="text-transparent text-outline-primary text-glow">TOP</span>
                <span className="text-primary text-glow">10</span>
                <span>MOVIES TODAY</span>
            </h2>
        </motion.div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[autoplayPlugin.current]}
        onMouseEnter={() => autoplayPlugin.current && autoplayPlugin.current.stop()}
        onMouseLeave={() => autoplayPlugin.current && autoplayPlugin.current.play()}
        className="w-full"
      >
        <CarouselContent className="-ml-8">
          {mediaItems.map((item, index) => (
            <CarouselItem
              key={`${item.id}-${index}`}
              className="basis-auto pl-8"
            >
              <motion.div 
                variants={itemVariants} 
                className="flex items-center group/item transition-transform duration-300 ease-in-out"
              >
                <span 
                  className="text-[200px] font-black text-transparent group-hover/item:text-primary transition-all duration-300 ease-in-out group-hover/item:scale-110" 
                  style={{ WebkitTextStroke: '3px hsl(var(--foreground) / 0.1)', textShadow: '0 0 15px hsl(var(--foreground) / 0.1)' }}
                >
                    {index + 1}
                </span>
                <div className="-ml-8 w-[200px] z-10 transition-transform duration-300 ease-in-out group-hover/item:scale-110">
                    <MediaCard item={item} />
                </div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 left-4" />
        <CarouselNext className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-4" />
      </Carousel>
    </motion.section>
  );
}
