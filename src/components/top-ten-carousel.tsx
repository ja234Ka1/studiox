
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
import { cn } from "@/lib/utils";

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
            <Skeleton className="h-20 w-1/2" />
            <div className="flex gap-4 overflow-hidden">
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
            className="mb-6 px-4 md:px-8"
            variants={itemVariants}
        >
          <div className="flex items-center justify-start gap-x-2 sm:gap-x-4">
              <h2 className="text-7xl md:text-8xl font-black tracking-tighter flex items-center justify-center gap-x-1 sm:gap-x-2">
                  <span className="text-transparent text-outline-primary text-glow">TOP</span>
                  <span className="text-primary text-glow">10</span>
              </h2>
              <div className="flex flex-col items-start leading-none -mt-2">
                  <span className="text-xl md:text-2xl font-bold text-foreground/80 tracking-tight">MOVIES</span>
                  <span className="text-xl md:text-2xl font-bold text-foreground/80 tracking-tight">TODAY</span>
              </div>
          </div>
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
        <CarouselContent className="-ml-4 sm:-ml-8">
          {mediaItems.map((item, index) => (
            <CarouselItem
              key={`${item.id}-${index}`}
              className="pl-4 sm:pl-8 basis-auto"
            >
              <motion.div 
                variants={itemVariants} 
                className="flex items-center group/item transition-transform duration-300 ease-in-out"
              >
                <span 
                  className="text-[120px] sm:text-[160px] md:text-[200px] lg:text-[220px] xl:text-[240px] 2xl:text-[260px] font-black text-transparent group-hover/item:text-primary transition-all duration-300 ease-in-out group-hover/item:scale-110" 
                  style={{ WebkitTextStroke: '3px hsl(var(--foreground) / 0.1)', textShadow: '0 0 15px hsl(var(--foreground) / 0.1)' }}
                >
                    {index + 1}
                </span>
                <div className={cn(
                  "w-[130px] sm:w-[160px] md:w-[200px] lg:w-[220px] xl:w-[240px] 2xl:w-[260px] z-10 transition-transform duration-300 ease-in-out group-hover/item:scale-110 -ml-6 sm:-ml-8 md:-ml-12 lg:-ml-14 xl:-ml-16 2xl:-ml-20"
                )}>
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
