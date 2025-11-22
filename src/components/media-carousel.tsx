
"use client";

import * as React from "react";
import type { Media } from "@/types/tmdb";
import { MediaCard } from "./media-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AnimatePresence } from "framer-motion";
import { ExpandedMediaCard } from "./expanded-media-card";

interface MediaCarouselProps {
  title: string;
  items: Media[];
}

export default function MediaCarousel({ title, items }: MediaCarouselProps) {
  const [hoveredItem, setHoveredItem] = React.useState<{ el: HTMLDivElement, item: Media } | null>(null);
  const [isLocked, setIsLocked] = React.useState(false);

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  if (!items || items.length === 0) {
    return null;
  }

  const handleHover = (el: HTMLDivElement | null, item: Media | null) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isLocked) return;

    if (el && item) {
      timeoutRef.current = setTimeout(() => {
        setHoveredItem({ el, item });
      }, 300);
    } else {
      setHoveredItem(null);
    }
  };

  const handleExpandedCardClose = () => {
    setIsLocked(true);
    setHoveredItem(null);
    setTimeout(() => {
      setIsLocked(false);
    }, 300); 
  };


  return (
    <section className="relative">
      <h2 className="text-2xl font-bold mb-4 ml-4 md:ml-0">{title === "Trending This Week" ? title : `Only on Willow: ${title}`}</h2>
      
      <AnimatePresence>
        {hoveredItem && (
          <ExpandedMediaCard 
            item={hoveredItem.item}
            anchorElement={hoveredItem.el}
            onClose={handleExpandedCardClose}
          />
        )}
      </AnimatePresence>
      
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
          containScroll: 'keepSnaps',
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 py-8 px-2">
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-[15%] pl-4 transition-transform duration-300 ease-out"
              style={{
                transform: hoveredItem?.item.id === item.id ? 'scale(0.95)' : 'none',
              }}
            >
              <div 
                className="h-full"
                onMouseEnter={(e) => handleHover(e.currentTarget as HTMLDivElement, item)}
                onMouseLeave={() => handleHover(null, null)}
              >
                <MediaCard 
                  item={item} 
                  onHover={(el) => {
                    if (el) {
                      handleHover(el, item);
                    }
                  }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
}
