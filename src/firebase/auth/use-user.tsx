
'use client';

import { useFirebase } from '@/firebase/provider';
import type { UserAuthHookResult } from '@/firebase/provider';
import { authState } from '@/firebase/provider';

// This is a simple hook that just grabs the user state from the main FirebaseContext
export const useUser = (): UserAuthHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};

// This allows us to access the user state non-reactively outside of components.
// It reads from a simple state object managed by the FirebaseProvider.
// This DOES NOT use any hooks and is safe to call from regular functions.
useUser.getState = (): UserAuthHookResult => {
    return authState.current;
}
