"use client";

import { useEffect, useState } from "react";
import MediaCarousel from "@/components/media-carousel";
import { getPopular, getTopRated } from "@/lib/tmdb";
import type { Media } from "@/types/tmdb";
import { Skeleton } from "./ui/skeleton";

interface Category {
  title: string;
  fetcher: () => Promise<Media[]>;
  items: Media[];
}

const categoriesConfig: Omit<Category, 'items'>[] = [
  { title: "Popular Movies", fetcher: () => getPopular("movie") },
  { title: "Top Rated Movies", fetcher: () => getTopRated("movie") },
  { title: "Popular TV Shows", fetcher: () => getPopular("tv") },
  { title: "Top Rated TV Shows", fetcher: () => getTopRated("tv") },
  { title: "Action & Adventure", fetcher: () => getPopular("movie", { with_genres: '28,12' }) },
  { title: "Comedy", fetcher: () => getPopular("movie", { with_genres: '35' }) },
  { title: "Horror", fetcher: () => getPopular("movie", { with_genres: '27' }) },
  { title: "Sci-Fi & Fantasy", fetcher: () => getPopular("movie", { with_genres: '878,14' }) },
  { title: "Documentaries", fetcher: () => getPopular("movie", { with_genres: '99' }) },
  { title: "Hollywood Hits", fetcher: () => getTopRated("movie", { with_original_language: 'en' }) },
  { title: "Must-Watch Anime", fetcher: () => getPopular("tv", { with_genres: '16', with_keywords: '210024' }) },
];


export function HomePageLoader() {
  const [categories, setCategories] = useState<Category[]>(
    categoriesConfig.map(c => ({...c, items: []}))
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const results = await Promise.allSettled(
            categoriesConfig.map(c => c.fetcher())
        );

        const newCategories = categoriesConfig.map((category, index) => {
            const result = results[index];
            if (result.status === 'fulfilled') {
                return { ...category, items: result.value };
            }
            console.error(`Failed to load category "${category.title}":`, result.reason);
            return { ...category, items: [] };
        }).filter(c => c.items.length > 0);

        setCategories(newCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // A small delay to allow the main trending section to render first
    const timer = setTimeout(() => {
        loadCategories();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
        <div className="space-y-12">
            {[...Array(4)].map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-8 w-1/4 mb-4" />
                    <div className="flex space-x-4 overflow-hidden">
                        {[...Array(6)].map((_, j) => (
                            <Skeleton key={j} className="h-64 w-44 rounded-lg flex-shrink-0" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
  }

  if (categories.length === 0) {
    return null; // Don't show anything if all categories failed to load or are empty
  }

  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <MediaCarousel key={category.title} title={category.title} items={category.items} />
      ))}
    </div>
  );
}
