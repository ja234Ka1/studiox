
'use client'

import type { Media } from "@/types/tmdb";
import { 
  collection, 
  doc, 
  getDocs, 
  writeBatch,
  setDoc,
  deleteDoc,
  getDoc,
  Firestore
} from "firebase/firestore";
import { getApp } from "firebase/app";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useUser } from "@/firebase/auth/use-user";

const WATCHLIST_KEY = "willow-watchlist";

// --- Local Storage Implementation (for guest users) ---

export const getLocalWatchlist = (): Media[] => {
  if (typeof window === "undefined") return [];
  try {
    const watchlistJson = localStorage.getItem(WATCHLIST_KEY);
    return watchlistJson ? JSON.parse(watchlistJson) : [];
  } catch (error) {
    console.error("Error reading watchlist from localStorage:", error);
    return [];
  }
};

export const setLocalWatchlist = (watchlist: Media[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    // Dispatch event for other hooks/tabs to listen to
    window.dispatchEvent(new CustomEvent('willow-storage-change', { detail: { key: WATCHLIST_KEY } }));
  } catch (error) {
    console.error("Error writing watchlist to localStorage:", error);
  }
};

// --- Firebase & Combined Logic ---

const getAuthAndDb = () => {
    const { user } = useUser.getState();
    if (!user) return { user: null, firestore: null };

    const firebase = require('@/firebase');
    const { firestore } = firebase.getSdks(getApp());
    return { user, firestore };
};


export const addToWatchlist = (item: Media): void => {
    const { user, firestore } = getAuthAndDb();
    
    if (user && !user.isAnonymous && firestore) {
        const watchlistItemRef = doc(firestore, 'users', user.uid, 'watchlists', String(item.id));
        const itemWithUser = { ...item, userId: user.uid, media_type: item.media_type || 'movie' };
        
        // Use non-blocking write and handle errors with the emitter
        setDoc(watchlistItemRef, itemWithUser, { merge: true }).catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: watchlistItemRef.path,
                operation: 'create',
                requestResourceData: itemWithUser,
            }));
        });
    } else {
        const localWatchlist = getLocalWatchlist();
        if (!localWatchlist.some(i => i.id === item.id)) {
            const newWatchlist = [item, ...localWatchlist];
            setLocalWatchlist(newWatchlist);
        }
    }
};


export const removeFromWatchlist = (mediaId: number): void => {
    const { user, firestore } = getAuthAndDb();

    if (user && !user.isAnonymous && firestore) {
        const watchlistItemRef = doc(firestore, 'users', user.uid, 'watchlists', String(mediaId));
        // Use non-blocking delete
        deleteDoc(watchlistItemRef).catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: watchlistItemRef.path,
                operation: 'delete'
            }));
        });
    } else {
        let localWatchlist = getLocalWatchlist();
        const newWatchlist = localWatchlist.filter(item => item.id !== mediaId);
        setLocalWatchlist(newWatchlist);
    }
};


export const mergeLocalWatchlistToFirebase = async (firestore: Firestore, userId: string) => {
  if (typeof window === "undefined" || !firestore || !userId) return;

  const localWatchlist = getLocalWatchlist();
  if (localWatchlist.length === 0) return;

  const watchlistColRef = collection(firestore, 'users', userId, 'watchlists');

  try {
    const firebaseWatchlistSnapshot = await getDocs(watchlistColRef);
    const firebaseIds = new Set(firebaseWatchlistSnapshot.docs.map(d => d.id));
    
    const itemsToMerge = localWatchlist.filter(localItem => !firebaseIds.has(String(localItem.id)));

    if (itemsToMerge.length > 0) {
      const batch = writeBatch(firestore);
      itemsToMerge.forEach(item => {
        const docRef = doc(firestore, 'users', userId, 'watchlists', String(item.id));
        const itemWithUser = { ...item, userId: userId, media_type: item.media_type || 'movie' };
        batch.set(docRef, itemWithUser);
      });

      await batch.commit();
    }
    
    // Clear the local watchlist after merging
    setLocalWatchlist([]);

  } catch (error) {
    console.error("Error merging watchlist:", error);
    if (error instanceof FirestorePermissionError) {
      errorEmitter.emit('permission-error', error);
    } else {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: watchlistColRef.path,
        operation: 'list'
      }));
    }
  }
};
