
'use client';

import { useContext } from 'react';
import { useFirebase, FirebaseContext } from '@/firebase/provider';
import type { UserAuthHookResult } from '@/firebase/provider';

// This is a simple hook that just grabs the user state from the main FirebaseContext
export const useUser = (): UserAuthHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};

// This allows us to access the user state non-reactively outside of components.
// It depends on the main FirebaseContext being available.
useUser.getState = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        // This might happen if called very early, before provider is mounted.
        // Return a default "loading" state.
        return { user: null, isUserLoading: true, userError: null };
    }
    return {
        user: context.user,
        isUserLoading: context.isUserLoading,
        userError: context.userError
    };
}
