
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import type { Media } from '@/types/tmdb';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getLocalWatchlist, addToWatchlist as writeToWatchlist, removeFromWatchlist as deleteFromWatchlist, mergeLocalWatchlistToFirebase } from '@/lib/userData';
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
  const [isMounted, setIsMounted] = useState(false);

  // Firestore state for logged-in (non-anonymous) user
  const watchlistQuery = useMemoFirebase(
    () => (user && !user.isAnonymous && firestore ? collection(firestore, 'users', user.uid, 'watchlists') : null),
    [user, firestore]
  );
  const { data: firebaseWatchlist, isLoading: isFirestoreLoading } = useCollection<Media>(watchlistQuery);

  // Local state for optimistic updates
  const [optimisticWatchlist, setOptimisticWatchlist] = useState<Media[]>([]);

  // Effect to load initial data and merge on login
  useEffect(() => {
    setIsMounted(true);
    if (user && !user.isAnonymous && firestore) {
      // User is logged in, merge local data and then rely on Firestore
      mergeLocalWatchlistToFirebase(firestore, user.uid);
    } else if (!isUserLoading) {
      // User is a guest or not yet loaded
      setOptimisticWatchlist(getLocalWatchlist());
    }
    
    // Listen for local storage changes (for guest users in other tabs)
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
        if (!user || user.isAnonymous) {
            const detail = (e as CustomEvent).detail;
            if ((e as StorageEvent).key === 'willow-watchlist' || (detail && detail.key === 'willow-watchlist')) {
                setOptimisticWatchlist(getLocalWatchlist());
            }
        }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('willow-storage-change', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('willow-storage-change', handleStorageChange);
    };

  }, [user, firestore, isUserLoading]);

  // Sync optimistic state with Firestore's state when it updates
  useEffect(() => {
    if (user && !user.isAnonymous && firebaseWatchlist) {
      setOptimisticWatchlist(firebaseWatchlist);
    }
  }, [firebaseWatchlist, user]);

  const isLoading = !isMounted || isUserLoading || isFirestoreLoading;

  const isInWatchlist = useCallback((mediaId: number) => {
    return optimisticWatchlist.some(item => item.id === mediaId);
  }, [optimisticWatchlist]);

  const addToWatchlist = useCallback((item: Media) => {
    if (isInWatchlist(item.id)) {
      showNotification(item, 'exists');
      return;
    }

    // Optimistically update UI
    setOptimisticWatchlist(prev => [item, ...prev]);
    showNotification(item, 'added');
    
    // Persist change in the background
    writeToWatchlist(item);

  }, [isInWatchlist, showNotification]);

  const removeFromWatchlist = useCallback((mediaId: number) => {
    const itemToRemove = optimisticWatchlist.find(i => i.id === mediaId);
    if (!itemToRemove) return;

    // Optimistically update UI
    setOptimisticWatchlist(prev => prev.filter(item => item.id !== mediaId));
    
    // Persist change in the background
    deleteFromWatchlist(mediaId);

  }, [optimisticWatchlist]);

  const value = {
    watchlist: optimisticWatchlist,
    isLoading,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
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
