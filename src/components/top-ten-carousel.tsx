
'use client';

import React, { useState, useEffect, useRef } from "react";
import type { Media } from "@/types/tmdb";
import { getTrending } from "@/lib/tmdb";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TopTenCard } from "./top-ten-card";

export default function TopTenCarousel() {
  const [items, setItems] = useState<Media[]>([]);
  
  useEffect(() => {
    getTrending('movie', 'day').then(movies => {
      setItems(movies.slice(0, 10));
    });
  }, []);

  if (items.length === 0) {
    return null; // Or a loading skeleton
  }

  return (
    <section className="py-12 group/section overflow-hidden">
        <div className="container px-4 md:px-8 mb-6">
            <div className="flex items-end gap-2">
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
              dragFree: true,
            }}
            className="w-full"
        >
            <CarouselContent className="container -ml-4 md:ml-0">
            {items.map((item, index) => (
                <CarouselItem
                    key={item.id}
                    className="basis-auto pl-12 pr-8"
                >
                  <TopTenCard item={item} rank={index} />
                </CarouselItem>
            ))}
            </CarouselContent>
            <CarouselPrevious className="left-8 opacity-0 group-hover/section:opacity-100 transition-opacity" />
            <CarouselNext className="right-8 opacity-0 group-hover/section:opacity-100 transition-opacity" />
        </Carousel>
    </section>
  );
}
