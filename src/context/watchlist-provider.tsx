
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Media } from '@/types/tmdb';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getLocalWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/userData';
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
  
  const [guestWatchlist, setGuestWatchlist] = useState<Media[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Firestore state for logged-in (non-anonymous) user
  const watchlistQuery = useMemoFirebase(
    () => (user && !user.isAnonymous && firestore ? collection(firestore, 'users', user.uid, 'watchlists') : null),
    [user, firestore]
  );
  const { data: firebaseWatchlist, isLoading: isFirestoreLoading } = useCollection<Media>(watchlistQuery);

  // Effect to load initial guest watchlist and handle guest storage events
  useEffect(() => {
    setIsMounted(true);

    const loadAndListenForGuestData = () => {
      setGuestWatchlist(getLocalWatchlist());

      const handleStorageChange = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.key === 'willow-watchlist' || (e as StorageEvent).key === 'willow-watchlist') {
             setGuestWatchlist(getLocalWatchlist());
        }
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('willow-storage-change', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('willow-storage-change', handleStorageChange);
      };
    };

    // Only set up listeners if user is a guest or not yet known
    if (!user || user.isAnonymous) {
      const cleanup = loadAndListenForGuestData();
      return cleanup;
    }
  }, [user]);

  // Determine which watchlist and loading state to use
  const isGuest = !user || user.isAnonymous;
  const watchlist = isGuest ? guestWatchlist : (firebaseWatchlist || []);
  const isLoading = !isMounted || isUserLoading || (!isGuest && isFirestoreLoading);

  const isInWatchlist = useCallback((mediaId: number) => {
    return watchlist.some(item => item.id === mediaId);
  }, [watchlist]);

  const handleAddToWatchlist = useCallback((item: Media) => {
    if (isInWatchlist(item.id)) {
      showNotification(item, 'exists');
      return;
    }
    // This function from userData handles both guest and logged-in cases
    addToWatchlist(item); 
    
    // For guests, we need to manually update state as there's no real-time listener
    if (isGuest) {
      setGuestWatchlist(prev => [item, ...prev]);
    }
    
    showNotification(item, 'added');
  }, [isInWatchlist, showNotification, isGuest]);

  const handleRemoveFromWatchlist = useCallback((mediaId: number) => {
    const itemToRemove = watchlist.find(item => item.id === mediaId);
    if (!itemToRemove) return;
    
    // This function from userData handles both guest and logged-in cases
    removeFromWatchlist(mediaId);

    // For guests, we need to manually update state
    if (isGuest) {
      setGuestWatchlist(prev => prev.filter(item => item.id !== mediaId));
    }
  }, [watchlist, isGuest]);
  
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
