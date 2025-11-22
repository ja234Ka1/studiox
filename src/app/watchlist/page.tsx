
"use client";

import { useEffect, useState } from "react";
import { getWatchlist } from "@/lib/userData";
import type { Media } from "@/types/tmdb";
import { MediaCard } from "@/components/media-card";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<Media[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setWatchlist(getWatchlist());

    const handleWatchlistChange = () => {
      setWatchlist(getWatchlist());
    };

    window.addEventListener('willow-watchlist-change', handleWatchlistChange);
    return () => {
      window.removeEventListener('willow-watchlist-change', handleWatchlistChange);
    };
  }, []);

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Watchlist</h1>
        <p className="text-muted-foreground mt-1">
          Your saved movies and TV shows.
        </p>
      </header>
      {watchlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {watchlist.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center col-span-full">
          Your watchlist is empty. Add some movies and shows to see them here.
        </p>
      )}
    </div>
  );
}
