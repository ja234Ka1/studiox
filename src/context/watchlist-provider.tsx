
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Media } from '@/types/tmdb';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getLocalWatchlist, setLocalWatchlist, addToFirebaseWatchlist, removeFromFirebaseWatchlist } from '@/lib/userData';
import { collection } from 'firebase/firestore';
import { useNotification } from './notification-provider';

interface WatchlistContextType {
  watchlist: Media[];
  isLoading: boolean;
  isInWatchlist: (mediaId: number) => boolean;
  addToWatchlist: (item: Media) => void;
  removeFromWatchlist: (mediaId: number) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { showNotification } = useNotification();
  
  const [localWatchlist, setLocalWatchlistState] = useState<Media[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Firestore state for logged-in user
  const watchlistQuery = useMemoFirebase(
    () => (user && !user.isAnonymous && firestore ? collection(firestore, 'users', user.uid, 'watchlists') : null),
    [user, firestore]
  );
  
  const { data: firebaseWatchlist, isLoading: isFirestoreLoading } = useCollection<Media>(watchlistQuery);

  useEffect(() => {
    setIsMounted(true);
    // Load initial guest watchlist from local storage only if it's a guest user
    if (!user || user.isAnonymous) {
      setLocalWatchlistState(getLocalWatchlist());
    }
  }, [user]);


  // Listen for local storage changes (for guest users in other tabs)
  useEffect(() => {
    // Only for guests
    if (user && !user.isAnonymous) return;

    const handleStorageChange = (e: Event) => {
        // Custom event from useLocalStorage hook
        if ((e as CustomEvent).detail?.key === "willow-watchlist") {
             setLocalWatchlistState(getLocalWatchlist());
        } else if ((e as StorageEvent).key === "willow-watchlist") {
             setLocalWatchlistState(getLocalWatchlist());
        }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('willow-storage-change', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('willow-storage-change', handleStorageChange);
    };
  }, [user]);
  
  const watchlist = isMounted && user && !user.isAnonymous ? (firebaseWatchlist || []) : localWatchlist;
  const isLoading = !isMounted || isUserLoading || (user && !user.isAnonymous && isFirestoreLoading);

  const isInWatchlist = useCallback((mediaId: number) => {
    return watchlist.some(item => item.id === mediaId);
  }, [watchlist]);

  const handleAddToWatchlist = (item: Media) => {
    if (isInWatchlist(item.id)) {
      showNotification(item, 'exists');
      return;
    }

    if (user && !user.isAnonymous && firestore) {
      addToFirebaseWatchlist(firestore, user.uid, item);
    } else {
      const newWatchlist = [item, ...localWatchlist];
      setLocalWatchlist(newWatchlist); 
      setLocalWatchlistState(newWatchlist);
    }
    showNotification(item, 'added');
  };

  const handleRemoveFromWatchlist = (mediaId: number) => {
    if (!isInWatchlist(mediaId)) return;

    if (user && !user.isAnonymous && firestore) {
      removeFromFirebaseWatchlist(firestore, user.uid, mediaId);
    } else {
      const newWatchlist = localWatchlist.filter(item => item.id !== mediaId);
      setLocalWatchlist(newWatchlist);
      setLocalWatchlistState(newWatchlist);
    }
  };
  
  const value = {
    watchlist,
    isLoading,
    isInWatchlist,
    addToWatchlist: handleAddToWatchlist,
    removeFromWatchlist: handleRemoveFromWatchlist,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
