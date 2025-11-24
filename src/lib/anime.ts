
import type { Anime, AnimeDetails, SearchResult, EpisodeSource } from "@/types/anime";

const BASE_URL = "https://anime-api-rest.vercel.app/anime/gogoanime";

async function fetcher<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(`Failed to fetch data from Anime API: ${errorBody.message || res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Error in Anime API fetcher for path ${path}:`, error);
    throw error;
  }
}

export async function getPopularAnime(page: number = 1): Promise<SearchResult[]> {
    try {
        return await fetcher<SearchResult[]>(`/popular/${page}`);
    } catch (error) {
        return [];
    }
}

export async function getTopAiringAnime(page: number = 1): Promise<SearchResult[]> {
    try {
        return await fetcher<SearchResult[]>(`/top-airing`);
    } catch (error) {
        return [];
    }
}

export async function getAnimeMovies(page: number = 1): Promise<SearchResult[]> {
    try {
        return await fetcher<SearchResult[]>(`/movies/${page}`);
    } catch (error) {
        return [];
    }
}

export async function getAnimeDetails(id: string): Promise<AnimeDetails> {
    return await fetcher<AnimeDetails>(`/info/${id}`);
}

export async function getEpisodeStream(episodeId: string): Promise<EpisodeSource> {
    return await fetcher<EpisodeSource>(`/watch/${episodeId}`);
}
