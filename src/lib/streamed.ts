
import type { APIMatch, Sport, Stream } from "@/types/streamed";

const BASE_URL = "https://streamed.pk/api";

async function fetchStreamed<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds for live data
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(`Failed to fetch data from Streamed API: ${errorBody.message || res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Error in Streamed fetcher for path ${path}:`, error);
    throw error;
  }
}

export async function getLiveMatches(): Promise<APIMatch[]> {
    try {
        return await fetchStreamed<APIMatch[]>('/matches/live');
    } catch (error) {
        return [];
    }
}

export async function getSports(): Promise<Sport[]> {
    try {
        return await fetchStreamed<Sport[]>('/sports');
    } catch (error) {
        return [];
    }
}

export async function getStream(source: string, id: string): Promise<Stream[]> {
    try {
        return await fetchStreamed<Stream[]>(`/stream/${source}/${id}`);
    } catch (error) {
        return [];
    }
}
