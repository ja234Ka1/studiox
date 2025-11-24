
'use client';

import * as React from "react";
import Image from "next/image";
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
import { getRecommendations, type RecommendationsInput } from "@/ai/flows/recommendations";
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
    const router = useRouter();

    const handleNavigation = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(path);
    };

    return (
        <motion.div
            className="group/card relative aspect-video w-full cursor-pointer"
            onClick={(e) => handleNavigation(e, `/media/${item.media_type}/${item.id}`)}
            whileHover={{ scale: 1.05, zIndex: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}

        >
            <Card
                className="h-full w-full overflow-hidden rounded-xl border-border/20 shadow-lg"
            >
                <Image
                    src={getTmdbImageUrl(item.backdrop_path, 'w500')}
                    alt={item.title || item.name || "Recommendation"}
                    fill
                    sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 30vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 text-white">
                    <h3 className="text-lg font-bold leading-tight drop-shadow-md">{item.title || item.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-primary drop-shadow-md filter-glow">
                        <Sparkles className="h-4 w-4" />
                        <span>{item.reason}</span>
                    </p>
                </div>
                 {/* Animated border/glow effect */}
                <div className="pointer-events-none absolute -inset-0.5 rounded-xl border-2 border-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 group-hover/card:filter-glow"
                     style={{ borderColor: 'hsl(var(--primary))' }}
                />
            </Card>
           
            <div className="absolute inset-0 z-30 flex items-center justify-center gap-4 opacity-0 transition-all duration-300 group-hover/card:opacity-100">
                <Button
                    asChild
                    size="icon"
                    variant="secondary"
                    className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
                    onClick={(e) => handleNavigation(e, `/media/${item.media_type}/${item.id}`)}
                >
                    <a>
                        <Info className="h-6 w-6" />
                        <span className="sr-only">More Info</span>
                    </a>
                </Button>
                <Button
                    asChild
                    size="icon"
                    className="h-16 w-16 rounded-full bg-primary/80 backdrop-blur-sm hover:bg-primary"
                    onClick={(e) => handleNavigation(e, `/stream/${item.media_type}/${item.id}${item.media_type === 'tv' ? '?s=1&e=1' : ''}`)}
                >
                     <a>
                        <PlayCircle className="h-8 w-8" />
                        <span className="sr-only">Play</span>
                    </a>
                </Button>
            </div>
        </motion.div>
    );
}
const MemoizedRecommendationCard = React.memo(RecommendationCard);


export default function ForYouCarousel() {
  const { user } = useUser();
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchRecommendations = React.useCallback(async (currentWatchlist: MediaDetailsType[]) => {
    if (currentWatchlist.length < 2) {
      setRecommendations([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fullWatchlistDetails = await Promise.all(
        currentWatchlist.map(item => getMediaDetails(item.id, item.media_type as 'movie' | 'tv'))
      );

      const watchlistPayload: RecommendationsInput = {
        watchlist: fullWatchlistDetails.map(item => {
            return {
                id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
                title: item.title,
                name: item.name,
                media_type: item.media_type,
                genres: item?.genres?.map(g => g.name) || [],
                original_language: (item as any)?.original_language || 'en',
            };
        })
      };
      
      const aiResult = await getRecommendations(watchlistPayload);
      
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
          const isInWatchlist = currentWatchlist.some(item => item.id === current.id);
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
  }, []);

  React.useEffect(() => {
    if (user && !user.isAnonymous && !isWatchlistLoading && watchlist.length > 0) {
        fetchRecommendations(watchlist);
    }
  }, [user, isWatchlistLoading, watchlist, fetchRecommendations]);

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
             <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary filter-glow" />
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
