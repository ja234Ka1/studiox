
"use client";

import * as React from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { Media } from "@/types/tmdb";
import { MediaCard } from "./media-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

interface ContinueWatchingItem {
    lastWatched: {
        seconds: number;
        nanoseconds: number;
    };
    media: Media;
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

export default function ContinueWatchingCarousel() {
    const { user } = useUser();
    const firestore = useFirestore();

    const continueWatchingQuery = useMemoFirebase(
        () => (user && firestore 
            ? query(
                collection(firestore, 'users', user.uid, 'continueWatching'),
                orderBy('lastWatched', 'desc'),
                limit(10)
              ) 
            : null),
        [user, firestore]
    );

    const { data: items, isLoading } = useCollection<ContinueWatchingItem>(continueWatchingQuery);

    const mediaItems = React.useMemo(() => items?.map(item => item.media) || [], [items]);

    if (!user || isLoading || !mediaItems || mediaItems.length === 0) {
        return null;
    }

    return (
        <motion.section 
            className="text-left w-full group"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={carouselVariants}
        >
            <motion.h2 
                className="text-2xl font-bold mb-4 px-4 md:px-8"
                variants={itemVariants}
            >
                Continue Watching
            </motion.h2>
            
            <Carousel
                opts={{
                align: "start",
                dragFree: true,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-2">
                {mediaItems.map((item, index) => (
                    <CarouselItem
                        key={`${item.id}-${index}`}
                        className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4 pr-2"
                    >
                    <motion.div layout variants={itemVariants}>
                        <MediaCard item={item} />
                    </motion.div>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CarouselNext className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Carousel>
        </motion.section>
    );
}
    