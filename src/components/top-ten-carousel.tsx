
'use client';

import { useState, useEffect, useRef } from 'react';
import type { Media } from '@/types/tmdb';
import { getTrending } from '@/lib/tmdb';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { MediaCard } from './media-card';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import Autoplay from "embla-carousel-autoplay";
import { motion } from 'framer-motion';

export function TopTenCarousel() {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const autoplayPlugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  useEffect(() => {
    const fetchTopTen = async () => {
      setIsLoading(true);
      try {
        const trendingMovies = await getTrending('movie', 'day');
        setMediaItems(trendingMovies.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch top 10 movies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopTen();
  }, []);

  const headingVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  if (isLoading) {
    return (
        <div className="w-full space-y-6 container px-4 md:px-8">
            <div className="flex items-baseline gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-12 w-16" />
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center">
                        <Skeleton className="h-[200px] w-[100px] -mr-8" />
                        <Skeleton className="h-[300px] w-[200px]" />
                    </div>
                ))}
            </div>
        </div>
    );
  }

  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <section className="py-12 w-full overflow-hidden">
      <motion.div 
        className="container px-4 md:px-8 mb-6"
        variants={headingVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-3xl md:text-4xl font-black flex items-baseline gap-x-2">
          <span className="text-transparent" style={{ WebkitTextStroke: '2px hsl(var(--primary))' }}>
            {'TOP'.split('').map((char, i) => <motion.span key={i} variants={charVariants} className="inline-block">{char}</motion.span>)}
          </span>
          <span className="text-primary text-glow">
            {'10'.split('').map((char, i) => <motion.span key={i} variants={charVariants} className="inline-block">{char}</motion.span>)}
          </span>
          <span>
            {'MOVIES TODAY'.split('').map((char, i) => <motion.span key={i} variants={charVariants} className="inline-block">{char === ' ' ? '\u00A0' : char}</motion.span>)}
          </span>
        </h2>
      </motion.div>
      <Carousel
        opts={{ loop: true, align: 'start' }}
        plugins={[autoplayPlugin.current]}
        onMouseEnter={() => autoplayPlugin.current?.stop()}
        onMouseLeave={() => autoplayPlugin.current?.play()}
        className="w-full"
      >
        <CarouselContent className="px-4">
          {mediaItems.map((item, index) => (
            <CarouselItem
              key={item.id}
              className={cn("basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5", index > 0 && "-ml-8")}
            >
              <div className="group flex items-center transition-transform duration-300 ease-in-out hover:!transform-none">
                <span className="
                    text-[200px] font-black text-transparent opacity-50
                    transition-all duration-300 ease-in-out group-hover:text-primary
                    group-hover:opacity-100 group-hover:scale-110
                    "
                    style={{
                        WebkitTextStroke: '3px hsl(var(--primary))',
                        textShadow: '0 0 15px hsl(var(--primary) / 0.5)'
                    }}
                >
                  {index + 1}
                </span>
                <motion.div 
                    className="relative z-10 -ml-8 transition-transform duration-300 ease-in-out group-hover:scale-110"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <MediaCard item={item} />
                </motion.div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
