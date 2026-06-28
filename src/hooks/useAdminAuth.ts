// src/hooks/useAdminAuth.ts
"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

export const useAdminAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.uid) { // <-- This check is the key
        // We have a user with a definitive UID, now check their role.
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        const isAdmin = userDoc.exists() && userDoc.data().role === 'admin';
        
        setAuthState({ user, isAdmin, loading: false });

      } else {
        // User is not logged in or auth state is not ready.
        setAuthState({ user: null, isAdmin: false, loading: false });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  return authState;
};
