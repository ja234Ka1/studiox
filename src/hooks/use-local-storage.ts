
'use client'

import { useState, useEffect, useCallback } from 'react';

// Custom hook for managing state with localStorage
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = (value: T | ((val: T) => T)) => {
    if (typeof window == 'undefined') {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`
      );
    }

    try {
      const newValue = value instanceof Function ? value(storedValue) : value;
      window.localStorage.setItem(key, JSON.stringify(newValue));
      setStoredValue(newValue);
      window.dispatchEvent(new StorageEvent("storage", { key }));
      window.dispatchEvent(new CustomEvent('willow-storage-change', { detail: { key } }));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
        const detail = (e as CustomEvent).detail;
        if ((e as StorageEvent).key === key || (detail && detail.key === key)) {
            setStoredValue(readValue());
        }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("willow-storage-change", handleStorageChange);

    return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("willow-storage-change", handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue];
}
