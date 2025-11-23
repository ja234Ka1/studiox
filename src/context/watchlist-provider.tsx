
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Media } from '@/types/tmdb';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getLocalWatchlist, setLocalWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/userData';
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

  useEffect(() => {
    setIsMounted(true);
    // Load initial guest watchlist on mount
    setLocalWatchlistState(getLocalWatchlist());
  }, []);

  // Firestore state for logged-in user
  const watchlistQuery = useMemoFirebase(
    () => (user && !user.isAnonymous && firestore ? collection(firestore, 'users', user.uid, 'watchlists') : null),
    [user, firestore]
  );
  
  const { data: firebaseWatchlist, isLoading: isFirestoreLoading } = useCollection<Media>(watchlistQuery);

  // This effect handles changes in user state (login/logout)
  useEffect(() => {
    if (isUserLoading) return; // Wait until we know the user's status

    if (user && !user.isAnonymous) {
      // User is logged in, clear local state. The source of truth is now firebaseWatchlist.
      if (localWatchlist.length > 0) {
        setLocalWatchlistState([]);
      }
    } else {
      // User is a guest or logged out, ensure local state is loaded.
      setLocalWatchlistState(getLocalWatchlist());
    }
  }, [user, isUserLoading, localWatchlist.length]);

  // This effect handles listening for guest watchlist changes from other tabs
  useEffect(() => {
    if (user && !user.isAnonymous) return; // Only for guests

    const handleStorageChange = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.key === 'willow-watchlist' || (e as StorageEvent).key === 'willow-watchlist') {
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
  
  const isGuest = !user || user.isAnonymous;
  const watchlist = isGuest ? localWatchlist : (firebaseWatchlist || []);
  const isLoading = !isMounted || isUserLoading || (!isGuest && isFirestoreLoading);

  const isInWatchlist = useCallback((mediaId: number) => {
    return watchlist.some(item => item.id === mediaId);
  }, [watchlist]);

  const handleAddToWatchlist = useCallback((item: Media) => {
    if (isInWatchlist(item.id)) {
      showNotification(item, 'exists');
      return;
    }
    addToWatchlist(item);
    showNotification(item, 'added');
  }, [isInWatchlist, showNotification]);

  const handleRemoveFromWatchlist = useCallback((mediaId: number) => {
    const itemToRemove = watchlist.find(item => item.id === mediaId);
    if (!itemToRemove) return;
    removeFromWatchlist(mediaId);
  }, [watchlist]);
  
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
