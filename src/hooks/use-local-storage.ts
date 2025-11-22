
'use client'

import { useState, useEffect, useCallback } from 'react';

// Custom hook for managing state with localStorage
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value. Initialize with the initialValue.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // useEffect to safely access localStorage only on the client side after mounting
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      // If error, we'll just use the initialValue.
    }
  }, [key]);

  // useEffect to update local storage when the state changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        typeof storedValue === 'function'
          ? storedValue(storedValue)
          : storedValue;
      // Save state to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
       // Dispatch a storage event so other tabs can sync
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('willow-storage-change', { detail: { key } }));

    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  // Listen for changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key && e.newValue !== null) {
            try {
                setStoredValue(JSON.parse(e.newValue));
            } catch (error) {
                console.error(error);
            }
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    setStoredValue(value);
  }

  return [storedValue, setValue];
}
