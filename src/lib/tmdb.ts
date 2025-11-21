import type { ApiResponse, Media, MediaType, TimeRange, Video } from "@/types/tmdb";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

async function fetcher<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  if (!API_KEY) {
    throw new Error("TMDB API key is not configured.");
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.append("api_key", API_KEY);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!res.ok) {
      console.error(`API call failed: ${res.status} ${res.statusText}`);
      const errorBody = await res.json().catch(() => ({}));
      console.error("Error body:", errorBody);
      throw new Error(`Failed to fetch data from TMDB: ${errorBody.status_message || res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Error in TMDB fetcher for path ${path}:`, error);
    throw error;
  }
}

export async function getTrending(mediaType: MediaType | "all" = "all", timeRange: TimeRange = "day"): Promise<Media[]> {
    try {
        const data = await fetcher<ApiResponse<Media>>(`/trending/${mediaType}/${timeRange}`);
        return data.results;
    } catch (error) {
        return [];
    }
}

export async function getPopular(mediaType: MediaType, params: Record<string, string> = {}): Promise<Media[]> {
    try {
        const data = await fetcher<ApiResponse<Media>>(`/${mediaType}/popular`, params);
        return data.results;
    } catch (error) {
        return [];
    }
}

export async function getTopRated(mediaType: MediaType, params: Record<string, string> = {}): Promise<Media[]> {
    try {
        const data = await fetcher<ApiResponse<Media>>(`/${mediaType}/top_rated`, params);
        return data.results;
    } catch (error) {
        return [];
    }
}

export async function getVideos(mediaId: number, mediaType: MediaType): Promise<Video[]> {
    try {
        const data = await fetcher<{ results: Video[] }>(`/${mediaType}/${mediaId}/videos`);
        return data.results.filter(v => v.site === "YouTube");
    } catch (error) {
        return [];
    }
}
