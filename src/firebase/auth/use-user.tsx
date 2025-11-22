
'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// This is a global state that can be used anywhere in the app
// We are using a basic form of state management here to avoid
// depending on a library.
let globalUser: User | null = null;
let globalLoading = true;
const listeners: ((state: AuthContextType) => void)[] = [];

const updateState = (user: User | null, loading: boolean) => {
    globalUser = user;
    globalLoading = loading;
    const newState = { user, loading };
    for (const listener of listeners) {
        listener(newState);
    }
}


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const [state, setState] = useState({ user: globalUser, loading: globalLoading });

  useEffect(() => {
    const callback = (newState: AuthContextType) => setState(newState);
    listeners.push(callback);
    return () => {
        const index = listeners.indexOf(callback);
        if (index >= 0) {
            listeners.splice(index, 1);
        }
    }
  }, []);


  useEffect(() => {
    if (!auth) return;

    // Set initial loading state. This is important to avoid a flash of
    // unauthenticated content.
    if (!globalUser) {
        updateState(null, true);
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      updateState(user, false);
    });

    return () => unsubscribe();
  }, [auth]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useUser = () => {
  return useContext(AuthContext);
};

// This allows us to access the user state outside of React components.
// NOTE: This will not be reactive. For reactive updates, use the `useUser` hook.
useUser.getState = () => ({ user: globalUser, loading: globalLoading });

