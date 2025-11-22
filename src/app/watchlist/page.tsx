
"use client";

import { useEffect, useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { getWatchlist as getLocalWatchlist, removeFromWatchlist as removeLocalWatchlist } from "@/lib/userData";
import type { Media } from "@/types/tmdb";
import { MediaCard } from "@/components/media-card";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

function WatchlistGrid({ items, onRemove }: { items: Media[], onRemove: (id: number) => void }) {
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

  // Unified state for the watchlist, regardless of source
  const [watchlist, setWatchlist] = useState<Media[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Firestore state for logged-in user
  const watchlistQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'users', user.uid, 'watchlists') : null),
    [user, firestore]
  );
  
  const { data: firebaseWatchlist, isLoading: isFirestoreLoading } = useCollection<Media>(watchlistQuery);
  
  // Effect to load initial data from correct source (local or firebase)
  useEffect(() => {
    setIsMounted(true);
    if (user) {
      if (firebaseWatchlist) {
        setWatchlist(firebaseWatchlist);
      }
    } else {
      setWatchlist(getLocalWatchlist());
    }
  }, [user, firebaseWatchlist]);

  // Effect to listen for watchlist changes (from other tabs or actions)
  useEffect(() => {
    const handleWatchlistChange = (event: Event) => {
        if(user) {
            // For logged-in users, useCollection handles updates automatically.
            // But we need to handle removals instantly.
            if ((event as CustomEvent).detail?.removed) {
                const removedId = (event as CustomEvent).detail.removed;
                setWatchlist(prev => prev.filter(item => item.id !== removedId));
            }
        } else {
            // For guests, we refetch from local storage.
            setWatchlist(getLocalWatchlist());
        }
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

  const handleRemoveItem = (itemId: number) => {
    // Optimistically update UI
    setWatchlist(currentWatchlist => currentWatchlist.filter(item => item.id !== itemId));

    // Perform the actual removal
    if (user && firestore) {
      const watchlistItemRef = doc(firestore, 'users', user.uid, 'watchlists', String(itemId));
      deleteDoc(watchlistItemRef);
    } else {
      removeLocalWatchlist(itemId);
    }
  };

  const isLoading = user ? isFirestoreLoading && watchlist.length === 0 : false;

  return (
    <div className="container px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24 mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Watchlist</h1>
        <p className="text-muted-foreground mt-1">
          Your saved movies and TV shows.
        </p>
      </header>
      
      {isLoading && <WatchlistSkeleton />}
      {!isLoading && <WatchlistGrid items={watchlist} onRemove={handleRemoveItem} />}
      
    </div>
  );
}
