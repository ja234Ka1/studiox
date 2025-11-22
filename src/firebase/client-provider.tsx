
'use client';

import { ReactNode, useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from '.';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseApp = useMemo(() => {
    const { app, auth, firestore } = initializeFirebase();
    return { app, auth, firestore };
  }, []);

  return <FirebaseProvider {...firebaseApp}>{children}</FirebaseProvider>;
}
