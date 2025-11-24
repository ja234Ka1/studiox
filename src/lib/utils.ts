
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
  // If path is a full URL (from anime API), use it directly
  if (path?.startsWith('http')) {
    return path;
  }
  
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

    // The API gives full paths for posters, so use them directly.
    if (type === 'poster' && id.startsWith('/')) {
        return `https://streamed.pk${id}`;
    }

    // For badges, the ID is clean and just needs the path and extension.
    if (type === 'badge') {
        return `${STREAMED_IMAGE_BASE_URL}/badge/${id}.webp`;
    }

    // Default proxy behavior for other cases
    return `${STREAMED_IMAGE_BASE_URL}/proxy/${id}.webp`;
}
