'use client'

import type { Media } from "@/types/tmdb";
import { 
  collection, 
  doc, 
  getDocs, 
  writeBatch,
  setDoc,
  deleteDoc,
  Firestore
} from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

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

// --- Firebase Implementation (for logged-in users) ---

export const addToFirebaseWatchlist = (firestore: Firestore, userId: string, item: Media) => {
    if (!firestore) return;
    const watchlistItemRef = doc(firestore, 'users', userId, 'watchlists', String(item.id));
    
    const itemWithUser = { ...item, userId: userId };

    setDoc(watchlistItemRef, itemWithUser, { merge: true }).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: watchlistItemRef.path,
            operation: 'create',
            requestResourceData: itemWithUser,
        }));
    });
};

export const removeFromFirebaseWatchlist = (firestore: Firestore, userId: string, itemId: number) => {
    if (!firestore) return;
    const watchlistItemRef = doc(firestore, 'users', userId, 'watchlists', String(itemId));

    deleteDoc(watchlistItemRef).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: watchlistItemRef.path,
            operation: 'delete'
        }));
    });
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
        const itemWithUser = { ...item, userId: userId };
        batch.set(docRef, itemWithUser);
      });

      await batch.commit();
      console.log(`${itemsToMerge.length} items merged to Firebase.`);
    }
    
    // Always clear local data after attempting a merge
    setLocalWatchlist([]);

  } catch (error) {
    console.error("Error merging watchlist:", error);
    if (error instanceof FirestorePermissionError) {
      errorEmitter.emit('permission-error', error);
    } else {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: watchlistColRef.path,
        operation: 'list' // or 'write' if it's a batch commit issue
      }));
    }
  }
};