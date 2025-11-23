
'use client';

import React, { useState, useEffect, useRef } from "react";
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
import Autoplay from "embla-carousel-autoplay";

export default function TopTenCarousel() {
  const [items, setItems] = useState<Media[]>([]);
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
    getTrending('movie', 'day').then(movies => {
      setItems(movies.slice(0, 10));
    });
  }, []);

  if (items.length === 0) {
    return null; // Or a loading skeleton
  }

  return (
    <section className="py-12 group/section">
        <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-end gap-2 mb-6">
                <h2 className="text-8xl font-black tracking-tighter flex items-center">
                    <span className="text-transparent text-outline-white">TOP</span>
                    <span className="text-primary text-glow">10</span>
                </h2>
                <div className="pb-2">
                    <h3 className="text-xl font-bold">MOVIES</h3>
                    <p className="text-sm text-muted-foreground">TODAY</p>
                </div>
            </div>
        </div>
      
        <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            className="w-full"
        >
            <CarouselContent className="-ml-4 md:ml-0 container">
            {items.map((item, index) => (
                <CarouselItem
                    key={item.id}
                    className="basis-auto pl-4 md:pl-8 group"
                >
                    <div className="flex items-center transition-transform duration-500 ease-out group-hover:scale-105">
                        <span 
                            className="text-[200px] font-black text-transparent text-outline-primary text-glow transition-colors duration-500 ease-out group-hover:text-primary"
                        >
                            {index + 1}
                        </span>
                        <div className="w-52 -ml-8 shrink-0">
                           <MediaCard item={item} />
                        </div>
                    </div>
                </CarouselItem>
            ))}
            </CarouselContent>
            <CarouselPrevious className="left-8 opacity-0 group-hover/section:opacity-100 transition-opacity" />
            <CarouselNext className="right-8 opacity-0 group-hover/section:opacity-100 transition-opacity" />
        </Carousel>
    </section>
  );
}
