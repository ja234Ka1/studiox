import MediaCarousel from "@/components/media-carousel";
import { getPopular, getTopRated } from "@/lib/tmdb";

export default async function MoviesPage() {
    const popularMovies = await getPopular("movie");
    const topRatedMovies = await getTopRated("movie");
    const actionMovies = await getPopular("movie", { with_genres: '28' });
    const comedyMovies = await getPopular("movie", { with_genres: '35' });
    const horrorMovies = await getPopular("movie", { with_genres: '27' });


  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Movies</h1>
            <p className="text-muted-foreground mt-1">
                Explore a vast collection of movies.
            </p>
        </header>
        <div className="space-y-12">
            {popularMovies.length > 0 && <MediaCarousel title="Popular Movies" items={popularMovies} />}
            {topRatedMovies.length > 0 && <MediaCarousel title="Top Rated Movies" items={topRatedMovies} />}
            {actionMovies.length > 0 && <MediaCarousel title="Action Movies" items={actionMovies} />}
            {comedyMovies.length > 0 && <MediaCarousel title="Comedy Movies" items={comedyMovies} />}
            {horrorMovies.length > 0 && <MediaCarousel title="Horror Movies" items={horrorMovies} />}
        </div>
    </div>
  );
}
