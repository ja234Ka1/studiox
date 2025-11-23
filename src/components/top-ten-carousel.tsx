
'use client';

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { getTrending } from "@/lib/tmdb";
import type { Media } from "@/types/tmdb";
import { MediaCard } from "./media-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export default function TopTenCarousel() {
  const [mediaItems, setMediaItems] = React.useState<Media[]>([]);

  React.useEffect(() => {
    const fetchTrending = async () => {
      const trendingMovies = await getTrending('movie', 'day');
      setMediaItems(trendingMovies.slice(0, 10));
    };
    fetchTrending();
  }, []);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <section className="w-full group/section">
      <div className="container px-4 md:px-8 mx-auto mb-6">
        <h2 className="text-3xl font-bold tracking-tighter flex items-end gap-2">
            <span 
                className="text-5xl font-black text-transparent text-outline-primary"
            >
                TOP
            </span>
            <span className="text-7xl font-black text-primary text-shadow-primary">10</span>
            <span className="text-xl font-semibold text-muted-foreground">MOVIES TODAY</span>
        </h2>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[plugin.current]}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {mediaItems.map((item, index) => (
            <CarouselItem
              key={item.id}
              className={cn(
                "basis-2/3 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6 pl-4 pr-2 group",
                index > 0 && "-ml-4" // The crucial overlap
              )}
            >
                <div className="flex items-center transition-transform duration-300 ease-in-out group-hover:scale-105">
                    <span 
                        style={{ WebkitTextStroke: '3px hsl(var(--primary))', textShadow: '0 0 15px hsl(var(--primary))' }}
                        className="text-[200px] font-black text-transparent transition-transform duration-300 ease-in-out"
                    >
                        {index + 1}
                    </span>
                    <div className="w-full shrink-0 transition-transform duration-300 ease-in-out -ml-8 group-hover:scale-110">
                        <MediaCard item={item} />
                    </div>
                </div>
            </CarouselItem>
          ))}
        </CarouselContent>
         <CarouselPrevious className="opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 ml-20" />
        <CarouselNext className="opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 mr-4" />
      </Carousel>
    </section>
  );
}
