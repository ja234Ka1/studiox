
import MediaCarousel from "@/components/media-carousel";
import { getTopAiringAnime, getPopularAnime, getAnimeMovies } from "@/lib/anime";
import type { SearchResult } from "@/types/anime";
import type { Media } from "@/types/tmdb";

// Adapter function to convert Anime API search result to TMDB Media type
const adaptAnimeToMedia = (anime: SearchResult): Media => ({
    id: parseInt(anime.animeId.split('-').pop() || '0', 10), // Risky, but works for gogoanime IDs
    name: anime.animeTitle,
    poster_path: anime.animeImg,
    backdrop_path: null, // Anime API doesn't provide this
    overview: `Released: ${anime.releasedDate}`, // No overview in search results
    media_type: "tv", // Assuming all are TV shows for simplicity
    release_date: anime.releasedDate,
    first_air_date: anime.releasedDate,
    vote_average: 0, // No rating in search results
    genre_ids: [],
    popularity: 0,
});


export default async function AnimePage() {
    const topAiring = await getTopAiringAnime();
    const popularAnime = await getPopularAnime();
    const animeMovies = await getAnimeMovies();

    const adaptedTopAiring = topAiring.map(adaptAnimeToMedia);
    const adaptedPopular = popularAnime.map(adaptAnimeToMedia);
    const adaptedMovies = animeMovies.map(adaptAnimeToMedia);

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Anime</h1>
            <p className="text-muted-foreground mt-1">
                Discover the best anime series from around the world.
            </p>
        </header>
        <div className="space-y-12">
            {adaptedTopAiring.length > 0 && <MediaCarousel title="Top Airing" items={adaptedTopAiring} />}
            {adaptedPopular.length > 0 && <MediaCarousel title="Popular Anime" items={adaptedPopular} />}
            {adaptedMovies.length > 0 && <MediaCarousel title="Anime Movies" items={adaptedMovies} />}
        </div>
    </div>
  );
}
