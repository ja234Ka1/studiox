
import type { ApiResponse, Media, MediaDetails, MediaType, TimeRange, Video, SeasonDetails, PersonDetails } from "@/types/tmdb";
import type { AniWatchMedia, AniWatchAPIResponse, AniWatchEpisode, AniWatchDetails } from "@/types/aniwatch";

const ANIME_API_URL = "https://aniwatch-api-8ax1.onrender.com";

async function fetchAniWatch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${ANIME_API_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(`Failed to fetch data from AniWatch API: ${errorBody.message || res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Error in AniWatch fetcher for path ${path}:`, error);
    throw error;
  }
}

// Helper to convert AniWatch media format to our internal Media format
function toInternalMedia(anime: AniWatchMedia): Media {
    return {
        id: parseInt(anime.id.replace('gogoanime-','') , 10), // Use TMDB ID if available, otherwise parse from string
        name: anime.name,
        title: anime.name,
        poster_path: anime.poster,
        backdrop_path: null, // Aniwatch API doesn't provide backdrop
        overview: '', // Aniwatch API doesn't provide overview in lists
        media_type: 'tv', // All are TV shows
        release_date: anime.other_name, // Using other_name for year/status info
        first_air_date: anime.other_name,
        vote_average: 0, // No vote average
        genre_ids: [], // No genre info in list view
        popularity: 0,
        // aniwatch specific data
        ...{ aniwatchId: anime.id }
    };
}


export async function getTrendingAnime(): Promise<Media[]> {
    try {
        const data = await fetchAniWatch<AniWatchAPIResponse<AniWatchMedia>>('/anime/trending');
        return data.results.map(toInternalMedia);
    } catch (error) {
        console.error("Failed to get trending anime:", error);
        return [];
    }
}

export async function getPopularAnime(): Promise<Media[]> {
    try {
        const data = await fetchAniWatch<AniWatchAPIResponse<AniWatchMedia>>('/anime/popular');
        return data.results.map(toInternalMedia);
    } catch (error) {
        console.error("Failed to get popular anime:", error);
        return [];
    }
}

export async function getAnimeDetails(id: string): Promise<AniWatchDetails> {
    try {
        const data = await fetchAniWatch<AniWatchDetails>(`/anime/detail`, { id: id });
        return data;
    } catch (error) {
        console.error(`Failed to get details for anime ID ${id}:`, error);
        throw error;
    }
}

export async function getEpisodeSources(episodeId: string) {
    try {
        const data = await fetchAniWatch<any>(`/anime/episode-srcs`, { id: episodeId });
        return data;
    } catch (error) {
        console.error(`Failed to get sources for episode ID ${episodeId}:`, error);
        throw error;
    }
}
