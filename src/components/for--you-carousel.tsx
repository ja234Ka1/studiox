
'use client';

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Info, PlayCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useWatchlist } from "@/context/watchlist-provider";
import { useUser } from "@/firebase";
import { getRecommendations } from "@/ai/flows/recommendations";
import { getMediaDetails } from "@/lib/tmdb";
import type { MediaDetails as MediaDetailsType, Media } from "@/types/tmdb";
import { Card, CardContent } from "./ui/card";
import { getTmdbImageUrl } from "@/lib/utils";
import { Button } from "./ui/button";

interface Recommendation extends MediaDetailsType {
  reason: string;
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

function RecommendationCard({ item }: { item: Recommendation }) {
  const detailPath = `/media/${item.media_type}/${item.id}`;
  const streamPath = `/stream/${item.media_type}/${item.id}${item.media_type === 'tv' ? '?s=1&e=1' : ''}`;
  
  return (
    <div className="relative group aspect-[16/9] w-full">
      <Link href={detailPath}>
        <Card className="h-full overflow-hidden">
          <Image
            src={getTmdbImageUrl(item.backdrop_path, 'w500')}
            alt={item.title || item.name || "Recommendation"}
            fill
            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 30vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          
          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm hover:bg-primary" asChild>
                <Link href={streamPath} onClick={(e) => e.stopPropagation()}>
                    <PlayCircle className="w-5 h-5" />
                </Link>
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-bold truncate text-base">{item.title || item.name}</h3>
            <p className="text-xs text-primary flex items-center gap-1.5 mt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{item.reason}</span>
            </p>
          </div>
        </Card>
      </Link>
    </div>
  );
}


export default function ForYouCarousel() {
  const { user } = useUser();
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const hasFetched = React.useRef(false);

  React.useEffect(() => {
    if (!user || user.isAnonymous || isWatchlistLoading || watchlist.length < 2 || hasFetched.current) {
      return;
    }

    const fetchRecommendations = async () => {
      hasFetched.current = true;
      setIsLoading(true);

      try {
        const watchlistPayload = watchlist.map(item => ({
            id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
            title: item.title,
            name: item.name,
            media_type: item.media_type
        }));

        const aiResult = await getRecommendations({ watchlist: watchlistPayload });
        
        if (aiResult.recommendations.length > 0) {
            const detailsPromises = aiResult.recommendations.map(rec => 
                getMediaDetails(rec.id, rec.media_type).then(details => ({ ...details, reason: rec.reason }))
            );
            const fullDetails = await Promise.all(detailsPromises);
            setRecommendations(fullDetails.filter(d => d.backdrop_path));
        }

      } catch (error) {
        console.error("Failed to fetch AI recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, watchlist, isWatchlistLoading]);

  // Don't render anything if user is not logged in, watchlist is empty, or still loading watchlist
  if (isWatchlistLoading || !user || user.isAnonymous || watchlist.length < 2) {
    return null;
  }
  
  // Show loading skeleton only when actively fetching AI recs
  if (isLoading) {
    return (
        <section className="text-left w-full group">
            <div className="flex items-center gap-3 mb-4 px-4 md:px-8">
                <h2 className="text-2xl font-bold">For You</h2>
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
             <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                <CarouselContent className="-ml-2 px-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <CarouselItem key={i} className="basis-5/6 sm:basis-2/3 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-4 pr-2">
                             <Skeleton className="aspect-video w-full" />
                        </CarouselItem>
                    ))}
                </CarouselContent>
             </Carousel>
        </section>
    );
  }

  // If no recommendations were generated, render nothing
  if (recommendations.length === 0) {
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
      <motion.div 
        className="text-2xl font-bold mb-4 px-4 md:px-8 flex items-center gap-2"
        variants={itemVariants}
      >
        <Sparkles className="w-6 h-6 text-primary filter-glow" />
        <span>For You</span>
      </motion.div>
      
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 px-8">
          {recommendations.map((item) => (
            <CarouselItem
              key={item.id}
              className="basis-5/6 sm:basis-2/3 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-4 pr-2"
            >
              <motion.div layout variants={itemVariants}>
                <RecommendationCard item={item} />
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
