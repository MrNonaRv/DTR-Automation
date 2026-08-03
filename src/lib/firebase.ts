import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "automatic-climate-zgxqk",
  appId: "1:557160494463:web:61726a040bf3571277964a",
  apiKey: "AIzaSyDdkUg7F-3rd028W8BbdTU9ZTki8-NESR0",
  authDomain: "automatic-climate-zgxqk.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-mambusaodtrautom-9a917564-d016-4340-a407-1131e70b9e00",
  storageBucket: "automatic-climate-zgxqk.firebasestorage.app",
  messagingSenderId: "557160494463",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
