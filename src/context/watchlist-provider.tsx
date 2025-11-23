
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import type { Media, MediaDetails } from '@/types/tmdb';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getLocalWatchlist, addToWatchlist as writeToWatchlist, removeFromWatchlist as deleteFromWatchlist, mergeLocalWatchlistToFirebase } from '@/lib/userData';
import { collection } from 'firebase/firestore';
import { useNotification } from './notification-provider';
import { getMediaDetails } from '@/lib/tmdb';

interface WatchlistContextType {
  watchlist: Media[];
  isLoading: boolean;
  isInWatchlist: (mediaId: number) => boolean;
  addToWatchlist: (item: Media) => void;
  removeFromWatchlist: (mediaId: number) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const WATCH_DATA_KEY = 'willow-tv-watch-data';

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

  const addToWatchlist = useCallback(async (item: Media) => {
    if (isInWatchlist(item.id)) {
      showNotification(item, 'exists');
      return;
    }

    let fullItem = item;
    // If it's a TV show, fetch full details to get episode count
    if (item.media_type === 'tv') {
        try {
            const details = await getMediaDetails(item.id, 'tv');
            const watchData = { id: item.id, lastKnownEpisodeCount: details.number_of_episodes || 0 };
            
            // Save to TV watch data storage
            const currentData = JSON.parse(localStorage.getItem(WATCH_DATA_KEY) || '[]');
            const existingIndex = currentData.findIndex((d: {id: number}) => d.id === item.id);
            if (existingIndex > -1) {
                currentData[existingIndex] = watchData;
            } else {
                currentData.push(watchData);
            }
            localStorage.setItem(WATCH_DATA_KEY, JSON.stringify(currentData));
            window.dispatchEvent(new CustomEvent('willow-storage-change', { detail: { key: WATCH_DATA_KEY } }));

            fullItem = { ...item, ...details };

        } catch (error) {
            console.error("Could not fetch TV details on add to watchlist", error);
        }
    }


    // Optimistically update UI
    setOptimisticWatchlist(prev => [fullItem, ...prev]);
    showNotification(item, 'added');
    
    // Persist change in the background
    writeToWatchlist(fullItem);

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
