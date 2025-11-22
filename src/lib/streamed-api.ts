
import type { StreamedSport, StreamedMatch, StreamedStream } from '@/types/tmdb';

const BASE_URL = 'https://streamed.pk/api';

async function fetchStreamed<T>(path: string, tags: string[] = []): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      next: { revalidate: 3600, tags: ['streamed', ...tags] }, // Revalidate every hour
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ message: 'No error body' }));
      throw new Error(`Failed to fetch from Streamed API (${res.status}): ${errorBody.message || res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Error in Streamed API fetcher for path ${path}:`, error);
    // Re-throw the error to be caught by the calling component
    throw error;
  }
}

export async function getSports(): Promise<StreamedSport[]> {
  return fetchStreamed<StreamedSport[]>('/sports', ['sports']);
}

export async function getMatches(category: string): Promise<StreamedMatch[]> {
  return fetchStreamed<StreamedMatch[]>(`/matches/${category}`, ['matches', `matches-${category}`]);
}

export async function getLiveMatches(): Promise<StreamedMatch[]> {
  return fetchStreamed<StreamedMatch[]>('/matches/live', ['matches', 'live-matches']);
}

export async function getPopularMatches(): Promise<StreamedMatch[]> {
  return fetchStreamed<StreamedMatch[]>('/matches/all-today/popular', ['matches', 'popular-matches']);
}

export async function getStreams(source: string, id: string): Promise<StreamedStream[]> {
  return fetchStreamed<StreamedStream[]>(`/stream/${source}/${id}`, ['streams', `stream-${id}`]);
}

export const getImageUrl = (path: string) => {
    if (!path) return '/placeholder.png';
    return `${BASE_URL}/images/${path}`;
}
