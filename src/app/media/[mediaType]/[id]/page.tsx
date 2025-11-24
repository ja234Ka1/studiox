
import { notFound } from "next/navigation";
import Image from "next/image";
import { getMediaDetails } from "@/lib/tmdb";
import { getAnimeDetails } from "@/lib/anime";
import type { MediaType } from "@/types/tmdb";
import { Star } from "lucide-react";
import MediaCarousel from "@/components/media-carousel";
import { DetailPageHero } from "@/components/detail-page-hero";
import { EpisodeSelector } from "@/components/episode-selector";
import { CastSection } from "@/components/cast-section";
import type { AnimeDetails } from "@/types/anime";

interface MediaDetailsPageProps {
    params?: {
        mediaType: MediaType | 'anime';
        id: string;
    }
}

export default async function MediaDetailsPage({ params }: MediaDetailsPageProps) {
  if (!params) {
    notFound();
  }
  const { mediaType, id } = params;
  
  if (mediaType !== "movie" && mediaType !== "tv" && mediaType !== "anime") {
    notFound();
  }

  let item;
  let animeItem: AnimeDetails | null = null;

  if (mediaType === 'anime') {
    // For anime, we need to construct a TMDB-like object for the hero
    try {
        animeItem = await getAnimeDetails(id);
        item = {
            id: parseInt(id.split('-').pop() || '0', 10),
            name: animeItem.animeTitle,
            overview: animeItem.synopsis,
            backdrop_path: null, // No backdrop from this API
            poster_path: animeItem.animeImg,
            genres: animeItem.genres.map(g => ({ id: 0, name: g })),
            vote_average: 0,
            first_air_date: animeItem.releasedDate,
            credits: { cast: [], crew: [] },
            recommendations: { results: [] },
            videos: { results: [] },
            media_type: 'tv', // Treat as TV for hero
        };
    } catch (error) {
        console.error("Failed to fetch anime details:", error);
        notFound();
    }
  } else {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        notFound();
    }
    try {
        item = await getMediaDetails(numericId, mediaType);
    } catch (error) {
        console.error("Failed to fetch media details:", error);
        notFound();
    }
  }
  
  if (!item) {
    notFound();
  }

  // Manually add media_type to the item object, as it's not in the API response for details
  const itemWithMediaType = { ...item, media_type: item.media_type || mediaType };

  const director = item.credits.crew.find(
    (person) => person.job === "Director"
  );

  const topCast = item.credits.cast.slice(0, 10);

  return (
    <div className="flex flex-col">
      <DetailPageHero item={itemWithMediaType} />

      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 pb-24 space-y-16">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3 text-center">
            <p className="text-muted-foreground text-lg mb-8 max-w-4xl mx-auto">{item.overview}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-8 max-w-2xl mx-auto">
              <div>
                <p className="font-semibold">Rating</p>
                <p className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {item.vote_average > 0 ? `${item.vote_average.toFixed(1)} / 10` : 'N/A'}
                </p>
              </div>
              {director && (
                <div>
                  <p className="font-semibold">Director</p>
                  <p className="text-muted-foreground">{director.name}</p>
                </div>
              )}
              <div>
                <p className="font-semibold">Runtime</p>
                <p className="text-muted-foreground">
                  {item.runtime ||
                    (item.episode_run_time && item.episode_run_time[0]) ||
                    "N/A"}{" "}
                  mins
                </p>
              </div>
              <div>
                <p className="font-semibold">Genres</p>
                <p className="text-muted-foreground">
                  {item.genres.map((g) => g.name).join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {mediaType === 'tv' && item.number_of_seasons && (
            <EpisodeSelector 
                showId={item.id} 
                numberOfSeasons={item.number_of_seasons} 
                title={item.name || item.title || ''}
            />
        )}
        
        {animeItem && (
            <EpisodeSelector 
                showId={0} // Not needed for anime source
                title={animeItem.animeTitle}
                animeEpisodes={animeItem.episodesList}
                animeId={id}
            />
        )}

        {topCast.length > 0 && (
          <CastSection topCast={topCast} />
        )}

        {item.recommendations?.results.length > 0 && (
          <MediaCarousel
            title="More Like This"
            items={item.recommendations.results}
          />
        )}
      </div>
    </div>
  );
}
