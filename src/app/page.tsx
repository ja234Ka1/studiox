import { getTrending } from "@/lib/tmdb";
import { Hero } from "@/components/hero";
import MediaCarousel from "@/components/media-carousel";
import { HomePageLoader } from "@/components/home-page-loader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

export default async function Home() {
  const trendingItems = await getTrending("all", "week");
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

      <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
        {trendingItems && trendingItems.length > 0 && (
          <MediaCarousel title="Trending This Week" items={trendingItems.slice(1)} />
        )}
        <HomePageLoader />
      </div>
    </div>
  );
}
