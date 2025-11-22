
"use client";

import { useEffect, useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { getWatchlist as getLocalWatchlist, removeFromWatchlist as removeLocalWatchlist } from "@/lib/userData";
import type { Media } from "@/types/tmdb";
import { MediaCard } from "@/components/media-card";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

function WatchlistGrid({ items }: { items: Media[] }) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center col-span-full">
        Your watchlist is empty. Add some movies and shows to see them here.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function WatchlistSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full">
            <Skeleton className="w-full h-full" />
            </div>
        ))}
        </div>
    );
}

export default function WatchlistPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [guestWatchlist, setGuestWatchlist] = useState<Media[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Firestore state for logged-in user
  const watchlistQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'users', user.uid, 'watchlists') : null),
    [user, firestore]
  );
  
  const { data: firebaseWatchlist, isLoading: isFirestoreLoading } = useCollection<Media>(watchlistQuery);
  
  useEffect(() => {
    setIsMounted(true);
    if (!user) {
      setGuestWatchlist(getLocalWatchlist());
    }
  }, [user]);

  // Effect to listen for local storage changes for GUEST users
  useEffect(() => {
    if (user) return; // Only run for guests

    const handleWatchlistChange = () => {
        setGuestWatchlist(getLocalWatchlist());
    };
    
    window.addEventListener('willow-watchlist-change', handleWatchlistChange);
    return () => {
        window.removeEventListener('willow-watchlist-change', handleWatchlistChange);
    };
  }, [user]);


  if (!isMounted || isUserLoading) {
    return (
        <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
             <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">My Watchlist</h1>
                <p className="text-muted-foreground mt-1">
                Your saved movies and TV shows.
                </p>
            </header>
            <WatchlistSkeleton />
        </div>
    );
  }
  
  const watchlist = user ? firebaseWatchlist : guestWatchlist;
  const isLoading = user ? isFirestoreLoading : false;

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Watchlist</h1>
        <p className="text-muted-foreground mt-1">
          Your saved movies and TV shows.
        </p>
      </header>
      
      {isLoading && <WatchlistSkeleton />}
      {!isLoading && <WatchlistGrid items={watchlist || []} />}
      
    </div>
  );
}
