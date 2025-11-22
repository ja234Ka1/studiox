
import { getTrending, getPopular, getTopRated, getDiscover, getUpcoming } from "@/lib/tmdb";
import { Hero } from "@/components/hero";
import MediaCarousel from "@/components/media-carousel";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clapperboard } from "lucide-react";
import type { Media } from "@/types/tmdb";
import Top10Carousel from "@/components/top10-carousel";

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
  { title: "Anime", fetcher: () => getDiscover("tv", { with_genres: '16', with_origin_country: 'JP' }) },
  { title: "K-Drama", fetcher: () => getDiscover("tv", { with_origin_country: 'KR' }) },
  { title: "Hindi Cinema", fetcher: () => getDiscover("movie", { with_original_language: 'hi' }) },
  { title: "Action & Adventure", fetcher: () => getDiscover("movie", { with_genres: '28' }) },
  { title: "Comedy", fetcher: () => getDiscover("movie", { with_genres: '35' }) },
  { title: "Sci-Fi & Fantasy", fetcher: () => getDiscover("movie", { with_genres: '878,14' }) },
];

export default async function Home() {
  let trendingWeekly: Media[] = [];
  let categories: Category[] = [];
  let error: string | null = null;
  let top10MoviesToday: Media[] = [];
  
  try {
    const trendingWeeklyPromise = getTrending("all", "week");
    const categoriesPromises = categoriesConfig.map(c => c.fetcher());

    const [trendingWeeklyResult, ...categoriesResults] = await Promise.allSettled([
      trendingWeeklyPromise,
      ...categoriesPromises
    ]);

    if (trendingWeeklyResult.status === 'fulfilled') {
      trendingWeekly = trendingWeeklyResult.value;
    } else {
      console.error('Failed to fetch trending:', trendingWeeklyResult.reason);
      throw new Error("Failed to fetch trending data.");
    }
    
    // The first category config is "Trending Movies Today", which we use for the Top 10
    const top10Result = categoriesResults[0];
    if (top10Result.status === 'fulfilled') {
        top10MoviesToday = top10Result.value.slice(0, 10);
    }

    categories = categoriesConfig.map((config, index) => {
        const result = categoriesResults[index];
        if (result.status === 'fulfilled') {
            return { title: config.title, items: result.value };
        }
        console.error(`Failed to load category "${config.title}":`, result.reason);
        return { title: config.title, items: [] };
    }).filter(c => c.items.length > 0);

  } catch (e: any) {
    error = e.message || "Failed to fetch data.";
  }
  
  const heroItem = trendingWeekly?.[0];
  const heroFallbackImage = PlaceHolderImages.find(p => p.id === 'hero-fallback');

  return (
    <div className="flex flex-col">
      {heroItem ? (
        <Hero item={heroItem} />
      ) : (
        !error && (
          <div className="relative w-full h-[60vh] lg:h-[80vh]">
            {heroFallbackImage && (
              <Image
                  src={heroFallbackImage.imageUrl}
                  alt="Fallback hero image"
                  fill
                  className="object-cover"
                  data-ai-hint={heroFallbackImage.imageHint}
                  priority
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
        )
      )}

      <div className="w-full space-y-12 py-12 pb-24">
        {error && (
          <div className="container mx-auto px-4 md:px-8">
            <Alert variant="destructive" className="text-left">
                <Clapperboard className="h-4 w-4" />
                <AlertTitle>Error Loading Content</AlertTitle>
                <AlertDescription>
                    {error} Please make sure your TMDB API key is correct and try again later.
                </AlertDescription>
            </Alert>
          </div>
        )}

        {!error && (
          <div className="space-y-16">
            {top10MoviesToday.length > 0 && (
              <Top10Carousel title="Top 10 Movies Today" items={top10MoviesToday} />
            )}
            {trendingWeekly.length > 1 && (
              <MediaCarousel title="Trending This Week" items={trendingWeekly.slice(1)} />
            )}
            {categories.slice(1).map((category) => ( // .slice(1) to skip the Top 10 data we already used
              <MediaCarousel key={category.title} title={category.title} items={category.items} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
