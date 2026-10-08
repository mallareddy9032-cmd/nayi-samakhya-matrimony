'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyC2YzTV9rx-LDO5n7eLQ3YI1uMOF07eQjI',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'nayi-samakhya-matrimony.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nayi-samakhya-matrimony',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'nayi-samakhya-matrimony.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '118883571200',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:118883571200:web:f35096fe372cea43176ae5',
};

// Singleton initialization for browser
let app: FirebaseApp | undefined;
let auth: Auth | undefined;

export function getFirebaseAuth(): { app: FirebaseApp; auth: Auth } {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth is only available on client side');
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  if (!auth) {
    auth = getAuth(app);
  }

  return { app, auth };
}

export { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult };
