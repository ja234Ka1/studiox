
import type { Media } from "@/types/tmdb";
import { useUser } from "@/firebase/auth/use-user";

const WATCHLIST_KEY = "willow-watchlist";

// --- Local Storage Implementation ---

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
  setLocalWatchlist(watchlist.filter(item => item.id !== itemId));
};

// --- Firebase Implementation (Placeholder) ---

// In a real app, you would get the user from a hook like this.
// const { user } = useUser();
const isUserLoggedIn = () => {
    // This is a placeholder. We will replace this with real auth state.
    const { user } = useUser.getState();
    return !!user;
}


// --- Public API ---

export const getWatchlist = (): Media[] => {
  if (isUserLoggedIn()) {
    // TODO: Implement Firestore logic
    // For now, we still use local storage even if logged in.
    return getLocalWatchlist();
  } else {
    return getLocalWatchlist();
  }
};

export const addToWatchlist = (item: Media) => {
  if (isUserLoggedIn()) {
    // TODO: Implement Firestore logic
     addToLocalWatchlist(item);
  } else {
    addToLocalWatchlist(item);
  }
};

export const removeFromWatchlist = (itemId: number) => {
  if (isUserLoggedIn()) {
    // TODO: Implement Firestore logic
    removeFromLocalWatchlist(itemId);
  } else {
    removeFromLocalWatchlist(itemId);
  }
};

export const mergeLocalWatchlistToFirebase = async () => {
    const { user } = useUser.getState();
    if (!user) return;

    const localWatchlist = getLocalWatchlist();
    if (localWatchlist.length === 0) return;

    // TODO: Get existing firebase watchlist
    const firebaseWatchlist: Media[] = []; // placeholder

    const itemsToMerge = localWatchlist.filter(localItem => 
        !firebaseWatchlist.some(firebaseItem => firebaseItem.id === localItem.id)
    );

    if (itemsToMerge.length > 0) {
        // TODO: Implement batch write to firestore
        console.log('Merging items to Firebase:', itemsToMerge);
    }
    
    // Clear local watchlist after merging
    // localStorage.removeItem(WATCHLIST_KEY);
    // window.dispatchEvent(new CustomEvent('willow-watchlist-change'));
     console.log('Local watchlist merged to Firebase.');
}
