import type { Media } from "@/types/tmdb";

const WATCHLIST_KEY = "willow-watchlist";

// Placeholder for Firebase authentication check
const isUserLoggedIn = () => false;

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


// --- Public API ---

export const getWatchlist = (): Media[] => {
  if (isUserLoggedIn()) {
    // TODO: Implement Firestore logic
    return [];
  } else {
    return getLocalWatchlist();
  }
};

export const addToWatchlist = (item: Media) => {
  if (isUserLoggedIn()) {
    // TODO: Implement Firestore logic
  } else {
    addToLocalWatchlist(item);
  }
};

export const removeFromWatchlist = (itemId: number) => {
  if (isUserLoggedIn()) {
    // TODO: Implement Firestore logic
  } else {
    removeFromLocalWatchlist(itemId);
  }
};
