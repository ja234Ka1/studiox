"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MediaCarousel from "@/components/media-carousel";
import { getPopular, getTopRated } from "@/lib/tmdb";
import type { Media } from "@/types/tmdb";

interface Category {
  title: string;
  items: Media[];
}

export function HomePageLoader() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const [
        popularMovies,
        topRatedMovies,
        popularTv,
        topRatedTv,
        hollywood,
        anime,
      ] = await Promise.all([
        getPopular("movie"),
        getTopRated("movie"),
        getPopular("tv"),
        getTopRated("tv"),
        getPopular("movie", { with_original_language: 'en' }),
        getPopular("tv", { with_genres: '16', with_keywords: '210024|287501' }) // Anime genre and keywords
      ]);

      const newCategories: Category[] = [
        { title: "Popular Movies", items: popularMovies },
        { title: "Top Rated Movies", items: topRatedMovies },
        { title: "Popular TV Shows", items: popularTv },
        { title: "Top Rated TV Shows", items: topRatedTv },
        { title: "Hollywood Hits", items: hollywood },
        { title: "Must-Watch Anime", items: anime },
      ].filter(category => category.items.length > 0);

      setCategories(newCategories);
      setIsLoaded(true);
    } catch (error) {
      console.error("Failed to load categories:", error);
      // Optionally, show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <MediaCarousel key={category.title} title={category.title} items={category.items} />
      ))}

      {!isLoaded && (
        <div className="text-center">
          <Button
            size="lg"
            variant="secondary"
            onClick={loadCategories}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Summoning More Content...
              </>
            ) : (
              "Load More Categories"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
