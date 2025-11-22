
import type { IptvChannel, IptvStream, IptvCategory } from "@/types/tmdb";

const BASE_URL = "https://iptv-org.github.io/api";

let channelsCache: IptvChannel[] | null = null;
let streamsCache: IptvStream[] | null = null;
let categoriesCache: IptvCategory[] | null = null;

async function fetcher<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!res.ok) {
      throw new Error(`Failed to fetch data from IPTV API: ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Error in IPTV fetcher for path ${path}:`, error);
    throw error;
  }
}

export async function getChannels(): Promise<IptvChannel[]> {
  if (channelsCache) {
    return channelsCache;
  }
  const channels = await fetcher<IptvChannel[]>("/channels.json");
  channelsCache = channels;
  return channels;
}

export async function getStreams(): Promise<IptvStream[]> {
  if (streamsCache) {
    return streamsCache;
  }
  const streams = await fetcher<IptvStream[]>("/streams.json");
  streamsCache = streams;
  return streams;
}

export async function getCategories(): Promise<IptvCategory[]> {
    if (categoriesCache) {
      return categoriesCache;
    }
    const categories = await fetcher<IptvCategory[]>("/categories.json");
    categoriesCache = categories;
    return categories;
  }
