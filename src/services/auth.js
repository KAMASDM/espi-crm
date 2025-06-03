import { signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";
import { USER_ROLES } from "../utils/constants";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let userProfile;

    if (!userSnap.exists()) {
      userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (user.email === "anantsoftcomputing@gmail.com") {
        userProfile.role = USER_ROLES.SUPERADMIN;
        userProfile.branchId = null;
      } else {
        userProfile.role = null;
        userProfile.branchId = null;
      }

      await setDoc(userRef, userProfile);

      const profileForStorage = {
        ...userProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("userProfile", JSON.stringify(profileForStorage));
      console.log("New user profile created and stored:", profileForStorage);
    } else {
      const existingData = userSnap.data();
      const updates = { updatedAt: serverTimestamp() };
      let needsUpdate = false;

      if (
        user.email === "anantsoftcomputing@gmail.com" &&
        (existingData.role !== USER_ROLES.SUPERADMIN ||
          existingData.branchId !== null)
      ) {
        updates.role = USER_ROLES.SUPERADMIN;
        updates.branchId = null;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await setDoc(userRef, updates, { merge: true });
        const refreshedSnap = await getDoc(userRef);
        userProfile = { id: refreshedSnap.id, ...refreshedSnap.data() };
      } else {
        userProfile = { id: userSnap.id, ...existingData };
      }

      const profileForStorage = {
        ...userProfile,
        createdAt:
          userProfile.createdAt?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
        updatedAt:
          userProfile.updatedAt?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
      };
      localStorage.setItem("userProfile", JSON.stringify(profileForStorage));
      console.log(
        "Existing user profile loaded and stored:",
        profileForStorage
      );
    }

    return user;
  } catch (error) {
    console.log("Error signing in with Google:", error);
    localStorage.removeItem("userProfile");
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("userProfile");
  } catch (error) {
    console.log("Error signing out:", error);
    throw error;
  }
};

export const getCurrentUserProfile = () => {
  try {
    const profile = localStorage.getItem("userProfile");
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.log("Error getting user profile from localStorage:", error);
    return null;
  }
};

export const isSuperadmin = () => {
  const profile = getCurrentUserProfile();
  return profile?.role === USER_ROLES.SUPERADMIN;
};

export const getUserBranchId = () => {
  const profile = getCurrentUserProfile();
  return profile?.branchId;
};

export const getUserRole = () => {
  const profile = getCurrentUserProfile();
  return profile?.role;
};
