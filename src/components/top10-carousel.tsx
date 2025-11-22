
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

  const [mainTitle, ...subTitleParts] = title.split(" ");
  const subTitle = subTitleParts.join(" ");

  return (
    <motion.section
      className="w-full group/carousel"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={carouselVariants}
    >
      <motion.div
        className="text-left px-4 md:px-8 flex items-baseline gap-4"
        variants={itemVariants}
      >
        <h2 className="text-3xl font-bold tracking-tight text-blue-400/90">{mainTitle}</h2>
        <p className="text-lg font-semibold text-muted-foreground">{subTitle}</p>
      </motion.div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full mt-4"
      >
        <CarouselContent className="-ml-4">
          {items.map((item, index) => (
            <CarouselItem
              key={`${item.id}-${index}`}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-20 pr-4 group"
            >
              <motion.div
                className="relative flex items-center"
                layout
                variants={itemVariants}
              >
                <span className="absolute -left-24 bottom-0 text-[16rem] font-black text-transparent text-outline leading-none select-none z-0 transition-all duration-300 group-hover:scale-105 group-hover:text-glow">
                  {index + 1}
                </span>
                <div className="relative z-10 w-full">
                    <MediaCard item={item} />
                </div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 ml-12" />
        <CarouselNext className="opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 mr-12" />
      </Carousel>
    </motion.section>
  );
}
