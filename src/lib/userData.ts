
'use client'

import type { Media } from "@/types/tmdb";
import { getSdks } from "@/firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  writeBatch,
  setDoc,
  deleteDoc
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

export const addToFirebaseWatchlist = (userId: string, item: Media) => {
    const { firestore } = getSdks();
    const watchlistItemRef = doc(firestore, 'users', userId, 'watchlists', String(item.id));
    
    const itemWithUser = { ...item, userId: userId };

    setDoc(watchlistItemRef, itemWithUser).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: watchlistItemRef.path,
            operation: 'create',
            requestResourceData: itemWithUser,
        }));
    });
};

export const removeFromFirebaseWatchlist = (userId: string, itemId: number) => {
    const { firestore } = getSdks();
    const watchlistItemRef = doc(firestore, 'users', userId, 'watchlists', String(itemId));

    deleteDoc(watchlistItemRef).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: watchlistItemRef.path,
            operation: 'delete'
        }));
    });
};

export const mergeLocalWatchlistToFirebase = (userId: string) => {
    if (!userId) return;

    const localWatchlist = getLocalWatchlist();
    if (localWatchlist.length === 0) return;

    console.log('Checking for local watchlist to merge to Firebase...');

    const { firestore } = getSdks();
    const watchlistColRef = collection(firestore, 'users', userId, 'watchlists');

    getDocs(watchlistColRef).then(firebaseWatchlistSnapshot => {
        const firebaseIds = new Set(firebaseWatchlistSnapshot.docs.map(d => d.id));
        const itemsToMerge = localWatchlist.filter(localItem => !firebaseIds.has(String(localItem.id)));

        if (itemsToMerge.length > 0) {
            const batch = writeBatch(firestore);
            itemsToMerge.forEach(item => {
                const docRef = doc(firestore, 'users', userId, 'watchlists', String(item.id));
                const itemWithUser = { ...item, userId: userId };
                batch.set(docRef, itemWithUser);
            });
            
            batch.commit().then(() => {
                console.log(`${itemsToMerge.length} items merged to Firebase.`);
                setLocalWatchlist([]); // Clear local watchlist
            }).catch(error => {
                console.error("Error committing batch to Firebase:", error);
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: watchlistColRef.path,
                    operation: 'write',
                    requestResourceData: { note: `${itemsToMerge.length} items in a batch write.` }
                }));
            });
        } else {
            console.log('Local watchlist was already in sync. Clearing local data.');
            setLocalWatchlist([]); // Clear local watchlist
        }
    }).catch(error => {
        console.error("Error reading Firebase watchlist for merge:", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: watchlistColRef.path,
            operation: 'list'
        }));
    });
};
