
'use client';

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
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
import type { MediaDetails as MediaDetailsType } from "@/types/tmdb";
import { Card } from "./ui/card";
import { getTmdbImageUrl, cn } from "@/lib/utils";
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
    return (
        <Card className="relative group aspect-video w-full overflow-hidden rounded-xl border-border/20 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20">
            <Link href={`/media/${item.media_type}/${item.id}`} className="absolute inset-0 z-10">
                <span className="sr-only">View details for {item.title || item.name}</span>
            </Link>
            
            <motion.div 
                className="h-full w-full"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
                <Image
                    src={getTmdbImageUrl(item.backdrop_path, 'w500')}
                    alt={item.title || item.name || "Recommendation"}
                    fill
                    sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 30vw"
                    className="object-cover"
                />
            </motion.div>

            {/* Animated Gradient Border on Hover */}
            <div className="absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 rounded-xl button-bg-pan" style={{ backgroundSize: '400% 400%', animation: 'gradient 6s ease infinite' }}></div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

            <div className="absolute top-3 right-3 z-20 flex gap-2">
                <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm opacity-0 transition-all duration-300 hover:bg-white/20 group-hover:opacity-100"
                    asChild
                >
                    <Link href={`/media/${item.media_type}/${item.id}`}>
                        <Info className="w-5 h-5" />
                    </Link>
                </Button>
                <Button
                    size="icon"
                    className="h-9 w-9 rounded-full bg-primary/80 backdrop-blur-sm opacity-0 transition-all duration-300 hover:bg-primary group-hover:opacity-100"
                    asChild
                >
                    <Link href={`/stream/${item.media_type}/${item.id}${item.media_type === 'tv' ? '?s=1&e=1' : ''}`}>
                        <PlayCircle className="w-5 h-5" />
                    </Link>
                </Button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold truncate text-base">{item.title || item.name}</h3>
                <p className="text-sm text-primary flex items-center gap-1.5 mt-1 filter-glow">
                    <Sparkles className="w-4 h-4" />
                    <span className='font-medium'>{item.reason}</span>
                </p>
            </div>
        </Card>
    );
}

const MemoizedRecommendationCard = React.memo(RecommendationCard);


export default function ForYouCarousel() {
  const { user } = useUser();
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchRecommendations = React.useCallback(async () => {
    if (isWatchlistLoading || watchlist.length < 2) {
      setRecommendations([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const watchlistPayload = watchlist.map(item => ({
        id: Number(item.id),
        title: item.title,
        name: item.name,
        media_type: item.media_type
      }));

      const aiResult = await getRecommendations({ watchlist: watchlistPayload });
      
      if (aiResult?.recommendations?.length > 0) {
        const detailPromises = aiResult.recommendations.map(async (rec) => {
          try {
            const details = await getMediaDetails(rec.id, rec.media_type);
            if (details.backdrop_path) {
              return { ...details, reason: rec.reason, media_type: rec.media_type };
            }
          } catch (e) {
            console.error(`Error fetching details for recommended item ID: ${rec.id}`, e);
          }
          return null;
        });

        const settledDetails = await Promise.all(detailPromises);
        const successfulDetails = settledDetails.filter((d): d is Recommendation => d !== null);

        const finalRecommendations = successfulDetails.reduce((acc, current) => {
          const isInWatchlist = watchlist.some(item => item.id === current.id);
          const isAlreadyAdded = acc.some(item => item.id === current.id);
          if (!isInWatchlist && !isAlreadyAdded) {
            acc.push(current);
          }
          return acc;
        }, [] as Recommendation[]);
        
        setRecommendations(finalRecommendations.slice(0, 10));
      } else {
        setRecommendations([]);
      }

    } catch (error) {
      console.error("Failed to fetch AI recommendations:", error);
      setError("Could not load recommendations at this time.");
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [watchlist, isWatchlistLoading]);

  React.useEffect(() => {
    if (user && !user.isAnonymous) {
        fetchRecommendations();
    }
  }, [user, watchlist, fetchRecommendations]);

  // Conditions to not render the component at all
  if (isWatchlistLoading) {
    return null;
  }
  
  if (!user || user.isAnonymous || watchlist.length < 2) {
      return null;
  }
  
  // Loading state skeleton
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
                             <Skeleton className="aspect-video w-full rounded-xl" />
                        </CarouselItem>
                    ))}
                </CarouselContent>
             </Carousel>
        </section>
    );
  }

  // Graceful handling of no recommendations or errors
  if (recommendations.length === 0) {
      return (
        <section className="text-left w-full group px-4 md:px-8">
             <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold">For You</h2>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/20 p-8 text-center h-48">
                <p className="text-lg font-semibold text-foreground">
                    {error ? error : "Thinking of new recommendations..."}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    {error ? "Please try again later." : "Add more to your watchlist to improve suggestions."}
                </p>
            </div>
        </section>
      )
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
                <MemoizedRecommendationCard item={item} />
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
