
"use client";

import { useWatchlist } from "@/context/watchlist-provider";
import type { Media } from "@/types/tmdb";
import { MediaCard } from "@/components/media-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/firebase";
import { GuestWatchlistPrompt } from "@/components/guest-watchlist-prompt";

function WatchlistGrid({ items }: { items: Media[] }) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center col-span-full pt-8">
        Your watchlist is empty. Add some movies and shows to see them here.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
      {items.map((item) => (
        <MediaCard key={`${item.id}-${item.media_type}`} item={item} />
      ))}
    </div>
  );
}

function WatchlistSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
        {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full">
            <Skeleton className="w-full h-full" />
            </div>
        ))}
        </div>
    );
}

export default function WatchlistPage() {
  const { watchlist, isLoading } = useWatchlist();
  const { user } = useUser();

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Watchlist</h1>
        <p className="text-muted-foreground mt-1">
          Your saved movies and TV shows.
        </p>
      </header>
      
      {user?.isAnonymous && (
        <GuestWatchlistPrompt />
      )}

      {isLoading ? <WatchlistSkeleton /> : <WatchlistGrid items={watchlist} />}
      
    </div>
  );
}
