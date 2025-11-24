import MediaCarousel from "@/components/media-carousel";
import { getDiscover, getTopRated } from "@/lib/tmdb";

export default async function AnimePage() {
    const popularAnime = await getDiscover("tv", { with_genres: '16', with_origin_country: 'JP' });
    const topRatedAnime = await getTopRated("tv", { with_genres: '16', with_origin_country: 'JP' });
    const actionAnime = await getDiscover("tv", { with_genres: '16,10759', with_origin_country: 'JP' });
    const fantasyAnime = await getDiscover("tv", { with_genres: '16,10765', with_origin_country: 'JP' });
    

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Anime</h1>
            <p className="text-muted-foreground mt-1">
                Discover the best anime series.
            </p>
        </header>
        <div className="space-y-12">
            {popularAnime.length > 0 && <MediaCarousel title="Popular Anime" items={popularAnime} />}
            {topRatedAnime.length > 0 && <MediaCarousel title="Top Rated Anime" items={topRatedAnime} />}
            {actionAnime.length > 0 && <MediaCarousel title="Action & Adventure" items={actionAnime} />}
            {fantasyAnime.length > 0 && <MediaCarousel title="Sci-Fi & Fantasy" items={fantasyAnime} />}
        </div>
    </div>
  );
}
