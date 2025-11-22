
'use client'

import type { Media } from "@/types/tmdb";
import { getSdks, useUser } from "@/firebase";
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

const getLocalWatchlist = (): Media[] => {
  if (typeof window === "undefined") return [];
  try {
    const watchlistJson = localStorage.getItem(WATCHLIST_KEY);
    return watchlistJson ? JSON.parse(watchlistJson) : [];
  } catch (error) {
    console.error("Error reading watchlist from localStorage:", error);
    return [];
  }
};

const setLocalWatchlist = (watchlist: Media[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    window.dispatchEvent(new CustomEvent('willow-watchlist-change'));
  } catch (error) {
    console.error("Error writing watchlist to localStorage:", error);
  }
};

const addToLocalWatchlist = (item: Media) => {
  const watchlist = getLocalWatchlist();
  if (!watchlist.some(i => i.id === item.id)) {
    setLocalWatchlist([item, ...watchlist]);
  }
};

const removeFromLocalWatchlist = (itemId: number) => {
  const watchlist = getLocalWatchlist();
  const updatedWatchlist = watchlist.filter(item => item.id !== itemId);
  setLocalWatchlist(updatedWatchlist);
  // Fire a specific event for removals for optimistic UI updates
  window.dispatchEvent(new CustomEvent('willow-watchlist-change', { detail: { removed: itemId } }));
};

// --- Firebase Implementation (for logged-in users) ---

const getFirebaseWatchlist = async (userId: string): Promise<Media[]> => {
    const { firestore } = getSdks();
    const watchlistCol = collection(firestore, 'users', userId, 'watchlists');
    const snapshot = await getDocs(watchlistCol);
    return snapshot.docs.map(doc => doc.data() as Media);
}

const addToFirebaseWatchlist = (userId: string, item: Media) => {
    const { firestore } = getSdks();
    const watchlistItemRef = doc(firestore, 'users', userId, 'watchlists', String(item.id));
    
    // Add userId to the item data to be stored. This is important for security rules.
    const itemWithUser = { ...item, userId: userId };

    // Non-blocking write
    setDoc(watchlistItemRef, itemWithUser).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: watchlistItemRef.path,
            operation: 'create',
            requestResourceData: itemWithUser,
        }));
    });
};

const removeFromFirebaseWatchlist = (userId: string, itemId: number) => {
    const { firestore } = getSdks();
    const watchlistItemRef = doc(firestore, 'users', userId, 'watchlists', String(itemId));

    // Non-blocking delete
    deleteDoc(watchlistItemRef).then(() => {
        // Fire a specific event for removals for optimistic UI updates
        window.dispatchEvent(new CustomEvent('willow-watchlist-change', { detail: { removed: itemId } }));
    }).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: watchlistItemRef.path,
            operation: 'delete'
        }));
    });
};


// --- Public API ---

export const getWatchlist = (): Media[] => {
  const { user } = useUser.getState();
  if (user) {
    // This function is now mostly for local state, as firebase data is fetched via useCollection.
    // However, it could be used for an initial server-side fetch if needed.
    // For now, we return empty array, relying on the hook.
    return [];
  } else {
    return getLocalWatchlist();
  }
};

export const addToWatchlist = (item: Media) => {
  const { user } = useUser.getState();
  if (user) {
    addToFirebaseWatchlist(user.uid, item);
  } else {
    addToLocalWatchlist(item);
  }
};

export const removeFromWatchlist = (itemId: number) => {
  const { user } = useUser.getState();
  if (user) {
    removeFromFirebaseWatchlist(user.uid, itemId);
  } else {
    removeFromLocalWatchlist(itemId);
  }
};

export const mergeLocalWatchlistToFirebase = () => {
    const { user } = useUser.getState();
    if (!user) return;

    const localWatchlist = getLocalWatchlist();
    if (localWatchlist.length === 0) return;

    console.log('Merging local watchlist to Firebase...');

    const { firestore } = getSdks();
    const watchlistColRef = collection(firestore, 'users', user.uid, 'watchlists');

    // This operation is now non-blocking and uses the error handling architecture
    getDocs(watchlistColRef).then(firebaseWatchlistSnapshot => {
        const firebaseWatchlist = firebaseWatchlistSnapshot.docs.map(d => d.data() as Media);
        const itemsToMerge = localWatchlist.filter(localItem => 
            !firebaseWatchlist.some(firebaseItem => firebaseItem.id === localItem.id)
        );

        if (itemsToMerge.length > 0) {
            const batch = writeBatch(firestore);
            itemsToMerge.forEach(item => {
                const docRef = doc(firestore, 'users', user.uid, 'watchlists', String(item.id));
                const itemWithUser = { ...item, userId: user.uid };
                batch.set(docRef, itemWithUser);
            });
            
            // Commit the batch and handle potential errors
            batch.commit().then(() => {
                console.log(`${itemsToMerge.length} items merged to Firebase.`);
                // Clear local watchlist after successful merge
                localStorage.removeItem(WATCHLIST_KEY);
                window.dispatchEvent(new CustomEvent('willow-watchlist-change'));
                console.log('Local watchlist cleared after merge.');
            }).catch(error => {
                console.error("Error committing batch to Firebase:", error);
                // Although we can't get per-document data, we can emit a general error.
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: watchlistColRef.path,
                    operation: 'write',
                    requestResourceData: { note: `${itemsToMerge.length} items in a batch write.` }
                }));
            });
        } else {
             // If there is nothing to merge, we can still clear the local list.
            localStorage.removeItem(WATCHLIST_KEY);
            window.dispatchEvent(new CustomEvent('willow-watchlist-change'));
            console.log('Local watchlist was already in sync. Cleared.');
        }
    }).catch(error => {
        // This will catch permission errors on the initial getDocs call
        console.error("Error reading Firebase watchlist for merge:", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: watchlistColRef.path,
            operation: 'list'
        }));
    });
};
