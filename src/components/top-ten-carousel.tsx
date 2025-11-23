
'use client';

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { getTrending } from "@/lib/tmdb";
import type { Media } from "@/types/tmdb";
import { MediaCard } from "./media-card";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";

export function TopTenCarousel() {
  const [mediaItems, setMediaItems] = React.useState<Media[]>([]);
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  React.useEffect(() => {
    const fetchTrending = async () => {
      try {
        const trendingMovies = await getTrending('movie', 'day');
        setMediaItems(trendingMovies.slice(0, 10));
      } catch (error) {
        console.error("Failed to fetch trending movies:", error);
      }
    };
    fetchTrending();
  }, []);

  if (mediaItems.length === 0) {
    return null; // Or a loading skeleton
  }

  return (
    <section className="w-full text-left">
      <div className="container mx-auto px-4 md:px-8 mb-6">
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter">
          <span
            className="text-transparent"
            style={{ WebkitTextStroke: '2px hsl(var(--primary))' }}
          >
            TOP
          </span>{' '}
          <span className="text-primary text-glow">10</span> MOVIES TODAY
        </h2>
      </div>

      <Carousel
        plugins={[plugin.current]}
        opts={{
          loop: true,
          align: "start",
        }}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="px-4 md:px-8">
          {mediaItems.map((item, index) => (
            <CarouselItem
              key={item.id}
              className={cn(
                "basis-3/4 sm:basis-2/3 md:basis-1/2 lg:basis-1/3",
                index > 0 && "-ml-8"
              )}
            >
              <div className="group flex items-center">
                <span
                  className="text-[200px] font-black text-transparent transition-transform duration-300 group-hover:scale-110"
                  style={{
                    WebkitTextStroke: '3px hsl(var(--primary) / 0.5)',
                    textShadow: '0 0 15px hsl(var(--primary) / 0.3)',
                  }}
                >
                  {index + 1}
                </span>
                <div className="w-48 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <MediaCard item={item} />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
