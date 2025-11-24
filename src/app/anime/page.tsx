
import MediaCarousel from "@/components/media-carousel";
import { getDiscover } from "@/lib/tmdb";

export default async function AnimePage() {
    const topAiring = await getDiscover("tv", { with_genres: '16', with_origin_country: 'JP', sort_by: 'popularity.desc' });
    const popularAnime = await getDiscover("tv", { with_genres: '16', with_origin_country: 'JP', sort_by: 'vote_average.desc', 'vote_count.gte': '200' });
    const animeMovies = await getDiscover("movie", { with_genres: '16', sort_by: 'popularity.desc' });

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Anime</h1>
            <p className="text-muted-foreground mt-1">
                Discover the best anime series and movies from around the world.
            </p>
        </header>
        <div className="space-y-12">
            {topAiring.length > 0 && <MediaCarousel title="Top Airing Anime" items={topAiring} />}
            {popularAnime.length > 0 && <MediaCarousel title="Highly Rated Anime" items={popularAnime} />}
            {animeMovies.length > 0 && <MediaCarousel title="Anime Movies" items={animeMovies} />}
        </div>
    </div>
  );
}
