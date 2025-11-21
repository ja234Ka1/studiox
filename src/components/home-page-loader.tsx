"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import MediaCarousel from "@/components/media-carousel";
import { getPopular, getTopRated } from "@/lib/tmdb";
import type { Media } from "@/types/tmdb";
import { Skeleton } from "./ui/skeleton";

interface Category {
  title: string;
  items: Media[];
}

export function HomePageLoader() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (isLoading) {
    return (
        <div className="space-y-12">
            {[...Array(4)].map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-8 w-1/4 mb-4" />
                    <div className="flex space-x-4">
                        {[...Array(6)].map((_, j) => (
                            <Skeleton key={j} className="h-64 w-44 rounded-lg" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <MediaCarousel key={category.title} title={category.title} items={category.items} />
      ))}
    </div>
  );
}
