import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXG1iiO038lZV_TTvnbdmLxRgHWwDIwXQ",
  authDomain: "healthbuddy-e02cc.firebaseapp.com",
  projectId: "healthbuddy-e02cc",
  storageBucket: "healthbuddy-e02cc.appspot.com",
  messagingSenderId: "1008902694832",
  appId: "1:1008902694832:web:9d2ceac8709eb1f7451875",
  measurementId: "G-M7Z24Q9YWM",
  databaseURL: "https://healthbuddy-e02cc-default-rtdb.europe-west1.firebasedatabase.app",  // Update this line
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);

export const FIREBASE_DATABASE = getDatabase(FIREBASE_APP);  
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP); 

