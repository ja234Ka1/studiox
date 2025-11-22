import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PlaceHolderImages } from "./placeholder-images";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

type ImageSize = "w500" | "original";

export function getTmdbImageUrl(path: string | null | undefined, size: ImageSize = "w500"): string {
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
