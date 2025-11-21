import { getTrending } from "@/lib/tmdb";
import { Hero } from "@/components/hero";
import MediaCarousel from "@/components/media-carousel";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clapperboard } from "lucide-react";
import { HomePageLoader } from "@/components/home-page-loader";


export default async function Home() {
  let trendingItems: Awaited<ReturnType<typeof getTrending>> | null = null;
  let error: string | null = null;
  try {
    trendingItems = await getTrending("all", "week");
  } catch (e: any) {
    error = e.message || "Failed to fetch trending data.";
  }
  
  const heroItem = trendingItems?.[0];
  const heroFallbackImage = PlaceHolderImages.find(p => p.id === 'hero-fallback');

  return (
    <div className="flex flex-col">
      {heroItem ? (
        <Hero item={heroItem} />
      ) : (
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
      )}

      <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24">
        {error && (
            <Alert variant="destructive">
                <Clapperboard className="h-4 w-4" />
                <AlertTitle>Error Loading Content</AlertTitle>
                <AlertDescription>
                    There was a problem loading the content from the data provider. Please make sure your API key is correct and try again later.
                </AlertDescription>
            </Alert>
        )}
        {trendingItems && trendingItems.length > 1 && (
          <MediaCarousel title="Trending This Week" items={trendingItems.slice(1)} />
        )}
        <HomePageLoader />
      </div>
    </div>
  );
}
