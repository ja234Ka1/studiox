import { getTrending, getPopular, getTopRated, getDiscover } from "@/lib/tmdb";
import { Hero } from "@/components/hero";
import MediaCarousel from "@/components/media-carousel";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clapperboard } from "lucide-react";
import type { Media } from "@/types/tmdb";

interface Category {
  title: string;
  items: Media[];
}

const categoriesConfig = [
  { title: "Trending This Week", fetcher: () => getTrending("all", "week"), slice: 1 },
  { title: "Popular Movies", fetcher: () => getPopular("movie") },
  { title: "Top Rated Movies", fetcher: () => getTopRated("movie") },
  { title: "Popular TV Shows", fetcher: () => getPopular("tv") },
  { title: "Top Rated TV Shows", fetcher: () => getTopRated("tv") },
  { title: "Action & Adventure", fetcher: () => getDiscover("movie", { with_genres: '28' }) },
  { title: "Comedy", fetcher: () => getDiscover("movie", { with_genres: '35' }) },
  { title: "Sci-Fi & Fantasy", fetcher: () => getDiscover("movie", { with_genres: '878,14' }) },
];

export default async function Home() {
  let trendingItems: Media[] = [];
  let otherCategories: Category[] = [];
  let error: string | null = null;
  
  try {
    const results = await Promise.allSettled([
      categoriesConfig[0].fetcher(),
      ...categoriesConfig.slice(1).map(c => c.fetcher())
    ]);

    if (results[0].status === 'fulfilled') {
      trendingItems = results[0].value;
    } else {
      console.error('Failed to fetch trending:', results[0].reason);
      throw new Error("Failed to fetch trending data.");
    }
    
    otherCategories = results.slice(1).map((result, index) => {
        const config = categoriesConfig[index + 1];
        if (result.status === 'fulfilled') {
            return { title: config.title, items: result.value };
        }
        console.error(`Failed to load category "${config.title}":`, result.reason);
        return { title: config.title, items: [] };
    }).filter(c => c.items.length > 0);

  } catch (e: any) {
    error = e.message || "Failed to fetch data.";
  }
  
  const heroItem = trendingItems?.[0];
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

      <div className="container mx-auto px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24">
        {error && (
            <Alert variant="destructive">
                <Clapperboard className="h-4 w-4" />
                <AlertTitle>Error Loading Content</AlertTitle>
                <AlertDescription>
                    {error} Please make sure your TMDB API key is correct and try again later.
                </AlertDescription>
            </Alert>
        )}

        {!error && (
          <div className="space-y-12">
            {trendingItems.length > 1 && (
              <MediaCarousel title="Trending This Week" items={trendingItems.slice(1)} />
            )}
            {otherCategories.map((category) => (
              <MediaCarousel key={category.title} title={category.title} items={category.items} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
