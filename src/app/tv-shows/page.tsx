import MediaCarousel from "@/components/media-carousel";
import { getPopular, getTopRated } from "@/lib/tmdb";

export default async function TVShowsPage() {
    const popularShows = await getPopular("tv");
    const topRatedShows = await getTopRated("tv");
    const comedyShows = await getPopular("tv", { with_genres: '35' });
    const dramaShows = await getPopular("tv", { with_genres: '18' });
    const realityShows = await getPopular("tv", { with_genres: '10764' });

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">TV Shows</h1>
            <p className="text-muted-foreground mt-1">
                Discover your next favorite TV show.
            </p>
        </header>
        <div className="space-y-12">
            {popularShows.length > 0 && <MediaCarousel title="Popular TV Shows" items={popularShows} />}
            {topRatedShows.length > 0 && <MediaCarousel title="Top Rated TV Shows" items={topRatedShows} />}
            {comedyShows.length > 0 && <MediaCarousel title="Comedy Shows" items={comedyShows} />}
            {dramaShows.length > 0 && <MediaCarousel title="Drama Shows" items={dramaShows} />}
            {realityShows.length > 0 && <MediaCarousel title="Reality Shows" items={realityShows} />}
        </div>
    </div>
  );
}
