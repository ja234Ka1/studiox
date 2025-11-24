
import { getTrending, getPopular, getTopRated, getDiscover, getUpcoming } from "@/lib/tmdb";
import MediaCarousel from "@/components/media-carousel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clapperboard } from "lucide-react";
import type { Media } from "@/types/tmdb";
import PlatformCarousel from "@/components/platform-carousel";
import { FeaturedContent } from "@/components/featured-content";
import { TopTenCarousel } from "@/components/top-ten-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Hero } from "@/components/hero";
import dynamic from 'next/dynamic';
import Image from "next/image";

const ContinueWatching = dynamic(() => import('@/components/continue-watching'), {
  loading: () => (
    <div className="px-4 md:px-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="aspect-video" />)}
        </div>
    </div>
  ),
});

const ForYouCarousel = dynamic(() => import('@/components/for-you-carousel'), {
  loading: () => (
     <div className="px-4 md:px-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="aspect-video" />
            <Skeleton className="aspect-video" />
            <Skeleton className="aspect-video" />
        </div>
    </div>
  ),
});


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

export default async function Home() {
  let heroItems: Media[] = [];
  let categories: Category[] = [];
  let featuredAction: Media | undefined;
  let featuredScifi: Media | undefined;
  let error: string | null = null;

  try {
    const trendingWeeklyPromise = getTrending("all", "week");
    const categoriesPromises = categoriesConfig.map(c => c.fetcher());
    const featuredActionPromise = getDiscover("movie", { with_genres: '28' });
    const featuredScifiPromise = getDiscover("movie", { with_genres: '878,14' });

    const [
        trendingWeeklyResult,
        featuredActionRes,
        featuredScifiRes,
        ...categoriesResults
    ] = await Promise.allSettled([
        trendingWeeklyPromise,
        featuredActionPromise,
        featuredScifiPromise,
        ...categoriesPromises
    ]);
    
    if (trendingWeeklyResult.status === 'fulfilled') {
        heroItems = trendingWeeklyResult.value.slice(0, 5);
    } else {
        console.error('Failed to fetch trending:', trendingWeeklyResult.reason);
        throw new Error("Failed to fetch trending data for the hero section.");
    }

    if (featuredActionRes.status === 'fulfilled' && featuredActionRes.value.length > 0) {
        featuredAction = featuredActionRes.value[0];
    }
    if (featuredScifiRes.status === 'fulfilled' && featuredScifiRes.value.length > 0) {
        featuredScifi = featuredScifiRes.value[1];
    }

    const resolvedCategories = categoriesConfig.map((config, index) => {
        const result = categoriesResults[index];
        if (result.status === 'fulfilled' && result.value) {
            return { title: config.title, items: result.value };
        }
        console.error(`Failed to load category "${config.title}":`, result.status === 'rejected' ? result.reason : 'No data');
        return { title: config.title, items: [] };
    }).filter(c => c.items.length > 0);
    
    categories = resolvedCategories;

  } catch (e: any) {
    console.error("Error fetching homepage data:", e);
    error = e.message || "An unexpected error occurred while loading content.";
  }

  return (
    <div className="flex flex-col">
      {heroItems.length > 0 ? (
        <Hero items={heroItems} />
      ) : (
         <div className="relative w-full h-[70vh] lg:h-[90vh]">
            <Skeleton className="w-full h-full" />
         </div>
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

        {!error && (
          <div className="space-y-16">
            <ContinueWatching />

            <ForYouCarousel />
            
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
