
import MediaCarousel from "@/components/media-carousel";
import { getTrendingAnime, getPopularAnime } from "@/lib/aniwatch";

export default async function AnimePage() {
    const trendingAnime = await getTrendingAnime();
    const popularAnime = await getPopularAnime();
    

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Anime</h1>
            <p className="text-muted-foreground mt-1">
                Discover the best anime series.
            </p>
        </header>
        <div className="space-y-12">
            {trendingAnime.length > 0 && <MediaCarousel title="Trending Anime" items={trendingAnime} />}
            {popularAnime.length > 0 && <MediaCarousel title="Popular Anime" items={popularAnime} />}
        </div>
    </div>
  );
}
