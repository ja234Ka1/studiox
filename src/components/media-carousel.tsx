
"use client";

import * as React from "react";
import type { Media } from "@/types/tmdb";
import { MediaCard } from "./media-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

interface MediaCarouselProps {
  title: string;
  items: Media[];
}

export default function MediaCarousel({ title, items }: MediaCarouselProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="text-left w-full">
      <h2 className="text-2xl font-bold mb-4 px-4 md:px-8">{title}</h2>
      
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
              className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/7 2xl:basis-[11%] pl-4 pr-2"
            >
              <motion.div layout>
                <MediaCard item={item} />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
