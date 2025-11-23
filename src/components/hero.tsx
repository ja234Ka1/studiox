
"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Info } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from 'next/link';

import type { Media } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "./ui/skeleton";

interface HeroProps {
  items: Media[];
}

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.08,
      delayChildren: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

function HeroContent({ item }: { item: Media }) {
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const detailPath = `/media/${item.media_type}/${item.id}`;
  const streamPath = `/stream/${item.media_type}/${item.id}${item.media_type === 'tv' ? '?s=1&e=1' : ''}`;

  return (
    <motion.div
      key={item.id}
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="relative z-20 max-w-2xl text-left"
    >
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="secondary">{item.media_type.toUpperCase()}</Badge>
        <Badge variant="outline">{year}</Badge>
        {item.vote_average > 0 && (
          <Badge variant="default" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
            Rating: {item.vote_average.toFixed(1)}
          </Badge>
        )}
      </motion.div>
      <motion.h1
        variants={itemVariants}
        className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-4 text-shadow-primary"
      >
        {title}
      </motion.h1>
      <motion.p variants={itemVariants} className="text-muted-foreground line-clamp-3 mb-8 text-base md:text-lg">
        {item.overview}
      </motion.p>
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <Button size="lg" asChild className="button-bg-pan">
          <Link href={streamPath}>
            <PlayCircle />
            Watch Now
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild className="bg-background/20 backdrop-blur-sm">
          <Link href={detailPath}>
            <Info />
            More Info
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}

function HeroThumbnailNav({ items, currentIndex, onSelect }: { items: Media[], currentIndex: number, onSelect: (index: number) => void }) {
    return (
        <div className="absolute bottom-8 right-0 z-20 w-full lg:w-auto lg:right-16">
            <div className="lg:max-w-xl xl:max-w-2xl mx-auto lg:mx-0">
                <AnimatePresence>
                    <motion.div layout className="flex items-end justify-center gap-3 px-4">
                    {items.map((item, index) => (
                        <motion.div
                            layout
                            key={item.id}
                            onClick={() => onSelect(index)}
                            className="relative w-1/4 max-w-[120px] cursor-pointer rounded-md overflow-hidden border-2 transition-all duration-300 ease-in-out"
                            animate={{
                                borderColor: currentIndex === index ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.2)',
                                flex: currentIndex === index ? '1 1 150px' : '1 1 80px',
                            }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        >
                            <Image
                                src={getTmdbImageUrl(item.poster_path, 'w500')}
                                alt={`Thumbnail for ${item.title || item.name}`}
                                width={150}
                                height={225}
                                className="aspect-[2/3] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            {currentIndex === index && (
                                <motion.div
                                    layoutId="hero-active-border"
                                    className="absolute -bottom-1 left-0 right-0 h-1 bg-primary"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </motion.div>
                    ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

export function Hero({ items }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleThumbnailSelect = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 8000); // 8 seconds per slide
    return () => clearInterval(timer);
  }, [items.length]);

  const activeItem = items[currentIndex];

  if (!items || items.length === 0) {
    return (
      <div className="relative w-full h-[70vh] lg:h-[90vh]">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[70vh] lg:h-[90vh] flex flex-col justify-center overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={activeItem.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: 1.05, transition: { duration: 1.5, ease: "easeInOut" } }}
          exit={{ opacity: 0, transition: { duration: 1, ease: 'easeOut' } }}
          className="absolute inset-0"
        >
          <motion.div
            className="w-full h-full"
            initial={{ scale: 1, x: 0 }}
            animate={{ scale: 1.1, x: '-2%', transition: { duration: 12, ease: "easeInOut", delay: 1 } }}
          >
            <Image
              src={getTmdbImageUrl(activeItem.backdrop_path, "original")}
              alt={activeItem.title || activeItem.name || "Hero backdrop"}
              fill
              priority
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_50%,_rgba(0,0,0,0.5))]"/>
      <div 
        className="absolute inset-0 opacity-5 dark:opacity-[0.02]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}
      />


      <div className="container mx-auto px-4 md:px-8 lg:px-16 h-full flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeItem && <HeroContent item={activeItem} />}
        </AnimatePresence>
      </div>

      <HeroThumbnailNav 
        items={items}
        currentIndex={currentIndex}
        onSelect={handleThumbnailSelect}
      />
    </div>
  );
}
