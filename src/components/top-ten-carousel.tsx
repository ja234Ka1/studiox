
'use client';

import * as React from "react";
import type { Media } from "@/types/tmdb";
import { TopTenCard } from "./top-ten-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

interface TopTenCarouselProps {
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

export default function TopTenCarousel({ items }: TopTenCarouselProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <motion.section 
      className="text-left w-full group relative overflow-hidden py-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={carouselVariants}
    >
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          className="flex items-end gap-4 mb-8"
          variants={itemVariants}
        >
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-outline text-glow">
                TOP 10
            </h2>
            <div>
                <h3 className="text-lg md:text-xl font-bold">MOVIES</h3>
                <p className="text-sm text-muted-foreground">TODAY</p>
            </div>
        </motion.div>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-16">
          {items.map((item, index) => (
            <CarouselItem
              key={item.id}
              className="basis-[45%] sm:basis-[30%] md:basis-[25%] lg:basis-[20%] xl:basis-[18%] pl-16"
            >
              <motion.div layout variants={itemVariants}>
                <TopTenCard item={item} rank={index} />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 left-8" />
        <CarouselNext className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-8" />
      </Carousel>
    </motion.section>
  );
}
