'use client';

import { getTrending, getPopular, getTopRated, getDiscover, getUpcoming } from "@/lib/tmdb";
import MediaCarousel from "@/components/media-carousel";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clapperboard } from "lucide-react";
import type { Media } from "@/types/tmdb";
import ContinueWatching from "@/components/continue-watching";
import PlatformCarousel from "@/components/platform-carousel";
import { FeaturedContent } from "@/components/featured-content";
import { TopTenCarousel } from "@/components/top-ten-carousel";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import { Hero } from "@/components/hero";


interface Category {
  title: string;
  items: Media[];
}

const categoriesConfig = [
  { title: "Trending Movies Today", fetcher: () => getTrending("movie", "day") },
  { title: "Trending TV Today", fetcher: () => getTrending("tv", "day") },
  { title: "Upcoming Movies", fetcher: () => getUpcoming("movie") },
  { title: "Popular Movies", fetcher: () => getPopular("movie") },
  { title: "Top Rated Movies", fetcher: () => getTopRated("movie") },
  { title: "Popular TV Shows", fetcher: () => getPopular("tv") },
  { title: "Top Rated TV Shows", fetcher: () => getTopRated("tv") },
  { title: "K-Drama", fetcher: () => getDiscover("tv", { with_origin_country: 'KR' }) },
  { title: "Hindi Cinema", fetcher: () => getDiscover("movie", { with_original_language: 'hi' }) },
];

export default function Home() {
  const [heroItems, setHeroItems] = useState<Media[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredAction, setFeaturedAction] = useState<Media | undefined>();
  const [featuredScifi, setFeaturedScifi] = useState<Media | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trendingWeeklyPromise = getTrending("all", "week");
        const categoriesPromises = categoriesConfig.map(c => c.fetcher());
        const featuredActionPromise = getDiscover("movie", { with_genres: '28' });
        const featuredScifiPromise = getDiscover("movie", { with_genres: '878,14' });

        const [trendingWeeklyResult, featuredActionRes, featuredScifiRes, ...categoriesResults] = await Promise.allSettled([
          trendingWeeklyPromise,
          featuredActionPromise,
          featuredScifiPromise,
          ...categoriesPromises
        ]);

        if (trendingWeeklyResult.status === 'fulfilled') {
          setHeroItems(trendingWeeklyResult.value.slice(0, 5));
        } else {
          console.error('Failed to fetch trending:', trendingWeeklyResult.reason);
          throw new Error("Failed to fetch trending data.");
        }
        
        if (featuredActionRes.status === 'fulfilled' && featuredActionRes.value.length > 0) {
          setFeaturedAction(featuredActionRes.value[0]);
        }
        if (featuredScifiRes.status === 'fulfilled' && featuredScifiRes.value.length > 0) {
          setFeaturedScifi(featuredScifiRes.value[1]); // Get a different one
        }
        
        const resolvedCategories = categoriesConfig.map((config, index) => {
            const result = categoriesResults[index];
            if (result.status === 'fulfilled') {
                return { title: config.title, items: result.value };
            }
            console.error(`Failed to load category "${config.title}":`, result.reason);
            return { title: config.title, items: [] };
        }).filter(c => c.items.length > 0);
        setCategories(resolvedCategories);

      } catch (e: any) {
        setError(e.message || "Failed to fetch data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const heroFallbackImage = PlaceHolderImages.find(p => p.id === 'hero-fallback');

  return (
    <div className="flex flex-col">
      {isLoading ? (
         <div className="relative w-full h-[70vh] lg:h-[90vh]">
            <Skeleton className="w-full h-full" />
         </div>
      ) : heroItems.length > 0 ? (
        <Hero items={heroItems} />
      ) : (
        !error && heroFallbackImage && (
          <div className="relative w-full h-[60vh] lg:h-[80vh]">
            <Image
                src={heroFallbackImage.imageUrl}
                alt="Fallback hero image"
                fill
                className="object-cover"
                data-ai-hint={heroFallbackImage.imageHint}
                priority
              />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
        )
      )}

      <div className="w-full space-y-12 py-12 pb-24">
        {error && (
          <div className="container mx-auto px-4 md:px-8">
            <Alert variant="destructive" className="text-left">
                <Image src="https://upload.wikimedia.org/wikipedia/commons/7/7a/A-symmetrical-silhouette-of-a-tree-with-many-branches-and-leaves-cutouts-png.svg" alt="Willow logo" width={16} height={16} className="h-4 w-4" />
                <AlertTitle>Error Loading Content</AlertTitle>
                <AlertDescription>
                    {error} Please make sure your TMDB API key is correct and try again later.
                </AlertDescription>
            </Alert>
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-16">
            <ContinueWatching />
            
            <TopTenCarousel />

            {heroItems.length > 0 && (
              <MediaCarousel title="Trending This Week" items={heroItems} />
            )}
            
            {categories.slice(0, 2).map((category) => (
              category.title !== 'Trending Movies Today' && <MediaCarousel key={category.title} title={category.title} items={category.items} />
            ))}

            {featuredAction && <FeaturedContent media={featuredAction} textPosition="left" />}
            
            {categories.slice(2, 4).map((category) => (
              <MediaCarousel key={category.title} title={category.title} items={category.items} />
            ))}

            {featuredScifi && <FeaturedContent media={featuredScifi} textPosition="right" />}

            {categories.slice(4).map((category) => (
              <MediaCarousel key={category.title} title={category.title} items={category.items} />
            ))}

            <PlatformCarousel />
          </div>
        )}
      </div>
    </div>
  );
}