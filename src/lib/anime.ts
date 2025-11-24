
import type { Anime, AnimeDetails, SearchResult, EpisodeSource } from "@/types/anime";

const BASE_URL = "https://anime-api-rest.vercel.app/anime/gogoanime";

async function fetcher<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!res.ok) {
      // Don't throw, just log and return null
      console.error(`Anime API error for path ${path}: ${res.status} ${res.statusText}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(`Error in Anime API fetcher for path ${path}:`, error);
    // Return null on network error or other exceptions
    return null;
  }
}

export async function getPopularAnime(page: number = 1): Promise<SearchResult[]> {
    const data = await fetcher<SearchResult[]>(`/popular`, { page: String(page) });
    return data || [];
}

export async function getTopAiringAnime(page: number = 1): Promise<SearchResult[]> {
    const data = await fetcher<SearchResult[]>(`/top-airing`, { page: String(page) });
    return data || [];
}

export async function getAnimeMovies(page: number = 1): Promise<SearchResult[]> {
    const data = await fetcher<SearchResult[]>(`/movies`, { page: String(page) });
    return data || [];
}

export async function getAnimeDetails(id: string): Promise<AnimeDetails> {
    const data = await fetcher<AnimeDetails>(`/info/${id}`);
    if (!data) {
        throw new Error("Failed to fetch anime details.");
    }
    return data;
}

export async function getEpisodeStream(episodeId: string): Promise<EpisodeSource> {
    const data = await fetcher<EpisodeSource>(`/watch/${episodeId}`);
    if (!data) {
        throw new Error("Failed to fetch episode stream.");
    }
    return data;
}
