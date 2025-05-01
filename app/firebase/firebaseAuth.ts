import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getIdToken } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export const registerUser = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };
  
export const loginUser = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};
  
export const logoutUser = async () => {
    return await signOut(auth);
};

export const getToken = async () => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No user signed in");
    }
    try {
        return await getIdToken(user);
    } catch (error) {
        throw new Error("Failed to fetch token");
    }
}

