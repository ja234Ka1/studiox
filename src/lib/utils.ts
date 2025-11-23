
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PlaceHolderImages } from "./placeholder-images";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";
const STREAMED_IMAGE_BASE_URL = "https://streamed.pk/api/images";

type TmdbImageSize = "w500" | "original";
type StreamedImageType = "badge" | "poster" | "proxy";

export function getTmdbImageUrl(path: string | null | undefined, size: TmdbImageSize = "w500"): string {
  if (path) {
    let finalSize = size;
    // Check if data saver is enabled from localStorage
    if (typeof window !== 'undefined' && localStorage.getItem('willow-data-saver') === 'true') {
        if (size === 'original') {
            finalSize = 'w500';
        }
    }
    return `${TMDB_IMAGE_BASE_URL}${finalSize}${path}`;
  }
  
  const fallbackImageId = size === 'original' ? 'hero-fallback' : 'media-fallback';
  const fallbackImage = PlaceHolderImages.find(p => p.id === fallbackImageId);
  
  // Return a default placeholder if the specific one isn't found
  return fallbackImage?.imageUrl || "https://picsum.photos/seed/placeholder/500/750";
}


export function getStreamedImageUrl(id: string, type: StreamedImageType = 'proxy'): string {
    if (!id) return "https://picsum.photos/seed/placeholder/200/200";
    if (type === 'poster') {
        // Assuming the 'id' for poster is something like 'team1-badge/team2-badge'
        return `${STREAMED_IMAGE_BASE_URL}/poster/${id}.webp`;
    }
    return `${STREAMED_IMAGE_BASE_URL}/${type}/${id}.webp`;
}
