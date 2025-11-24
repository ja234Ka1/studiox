
import MediaCarousel from "@/components/media-carousel";
import { getDiscover } from "@/lib/tmdb";

export default async function AnimePage() {
    const popularAnime = await getDiscover("tv", { with_genres: '16', sort_by: 'popularity.desc', with_origin_country: 'JP' });
    const topRatedAnime = await getDiscover("tv", { with_genres: '16', sort_by: 'vote_average.desc', 'vote_count.gte': '1000', with_origin_country: 'JP' });
    const newAnime = await getDiscover("tv", { with_genres: '16', 'first_air_date.gte': new Date().getFullYear().toString(), with_origin_country: 'JP' });
    

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Anime</h1>
            <p className="text-muted-foreground mt-1">
                Discover the best anime series from around the world.
            </p>
        </header>
        <div className="space-y-12">
            {popularAnime.length > 0 && <MediaCarousel title="Popular Anime" items={popularAnime} />}
            {topRatedAnime.length > 0 && <MediaCarousel title="Top Rated Anime" items={topRatedAnime} />}
            {newAnime.length > 0 && <MediaCarousel title="New This Year" items={newAnime} />}
        </div>
    </div>
  );
}

