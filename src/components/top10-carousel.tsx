
"use client";

import * as React from "react";
import { motion } from "framer-motion";

import type { Media } from "@/types/tmdb";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MediaCard } from "./media-card";
import { cn } from "@/lib/utils";

interface Top10CarouselProps {
  title: string;
  items: Media[];
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

export default function Top10Carousel({ title, items }: Top10CarouselProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <motion.section
      className="w-full group/carousel"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={carouselVariants}
    >
      <motion.div
        className="text-left md:px-8 px-4"
        variants={itemVariants}
      >
        <div className="flex items-center gap-4">
          <span className="text-7xl font-black tracking-tighter text-transparent text-outline">TOP</span>
          <span className="text-7xl font-black tracking-tighter text-accent text-glow">10</span>
          <div className="flex flex-col leading-tight -mt-1">
            <span className="text-lg font-bold">MOVIES</span>
            <span className="text-sm text-muted-foreground">TODAY</span>
          </div>
        </div>
      </motion.div>

      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full mt-4"
      >
        <CarouselContent className="px-4 md:px-8">
          {items.map((item, index) => (
            <CarouselItem
              key={`${item.id}-${index}`}
              className="basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pr-4 group"
            >
              <motion.div
                className="relative flex items-center h-full"
                layout
                variants={itemVariants}
              >
                <span className={cn(
                  "absolute font-black text-transparent text-outline leading-none select-none transition-all duration-300 group-hover:scale-105 group-hover:text-glow",
                  // Responsive font sizes
                  "text-[28vw] bottom-0", // Mobile first
                  "sm:text-[20vw] sm:-bottom-2",
                  "md:text-[16vw] md:-bottom-2",
                  "lg:text-[12vw] lg:-bottom-4",
                  "xl:text-[10vw] xl:-bottom-2",
                  // Responsive positioning
                  "left-[-8vw]",
                  "sm:left-[-5vw]",
                  "md:left-[-4vw]",
                  "lg:left-[-3vw]",
                  // Special adjustment for number 10
                  index === 9 && "left-[-16vw] sm:left-[-10vw] md:left-[-8vw] lg:left-[-6vw]"
                )}>
                  {index + 1}
                </span>
                <div className="w-full relative z-10">
                    <MediaCard item={item} />
                </div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 left-8" />
        <CarouselNext className="opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 right-8" />
      </Carousel>
    </motion.section>
  );
}
