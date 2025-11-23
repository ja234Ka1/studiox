
'use client';

import * as React from 'react';
import type { Media } from '@/types/tmdb';
import { getTrending } from '@/lib/tmdb';
import { MediaCard } from './media-card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function TopTenCarousel() {
  const [items, setItems] = React.useState<Media[]>([]);
  const plugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  React.useEffect(() => {
    const fetchTrending = async () => {
      try {
        const trendingMovies = await getTrending('movie', 'day');
        setItems(trendingMovies.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch trending movies:', error);
      }
    };
    fetchTrending();
  }, []);

  if (items.length === 0) {
    return null; // Or a loading skeleton
  }

  return (
    <section className="w-full group/section">
      <div className="container px-4 md:px-8 mb-4 text-left">
        <h2 className="relative inline-block text-3xl md:text-4xl font-black">
          <span className="text-transparent text-outline-primary tracking-tighter">TOP</span>
          <span className="text-primary text-glow tracking-tighter">10</span>
          <span className="ml-3 text-foreground">Trending Movies Today</span>
        </h2>
      </div>

      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[plugin.current]}
        className="w-full"
      >
        <CarouselContent className="-ml-8">
          {items.map((item, index) => (
            <CarouselItem
              key={item.id}
              className={cn(
                'basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-[14%]',
                'group transition-transform duration-300 ease-in-out hover:scale-105',
                 index > 0 ? "-ml-8" : ""
              )}
            >
              <div className="flex items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <span className="text-[200px] font-black text-transparent text-outline-primary text-glow transition-transform duration-300 group-hover:scale-110">
                        {index + 1}
                    </span>
                </motion.div>
                <motion.div 
                    className="relative z-10 w-full -ml-10 transition-transform duration-300 group-hover:scale-110"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
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
