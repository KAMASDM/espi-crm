// src/services/auth.js
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';
import { USER_ROLES } from '../utils/constants';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    let userProfile;

    if (!userSnap.exists()) {
      // New user - create profile
      let initialRole = USER_ROLES.COUNSELLOR; // Default role for new users
      let initialBranchId = '';

      // Assign Superadmin role to the specific user
      if (user.email === "anantsoftcomputing@gmail.com") {
        initialRole = USER_ROLES.SUPERADMIN;
        initialBranchId = null; // Superadmin has no specific branch initially
      }

      userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: initialRole,
        branchId: initialBranchId,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, userProfile);
      
      // Store in localStorage (without serverTimestamp which can't be serialized)
      const profileForStorage = {
        ...userProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('userProfile', JSON.stringify(profileForStorage));
      console.log('New user profile created and stored:', profileForStorage);

    } else {
      // Existing user - update if needed
      const existingData = userSnap.data();
      const updates = { updatedAt: serverTimestamp() };
      let needsUpdate = false;

      // Check if this user should be Superadmin
      if (user.email === "anantsoftcomputing@gmail.com" && existingData.role !== USER_ROLES.SUPERADMIN) {
        updates.role = USER_ROLES.SUPERADMIN;
        updates.branchId = null; // Superadmin isn't tied to a branch
        needsUpdate = true;
      }

      // Ensure role field exists
      if (!existingData.role) {
        updates.role = user.email === "anantsoftcomputing@gmail.com" ? USER_ROLES.SUPERADMIN : USER_ROLES.COUNSELLOR;
        needsUpdate = true;
      }

      // Ensure branchId field exists for non-Superadmin users
      if (existingData.role !== USER_ROLES.SUPERADMIN && !existingData.hasOwnProperty('branchId')) {
        updates.branchId = '';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await setDoc(userRef, updates, { merge: true });
        // Re-fetch the document to get the updated data
        const refreshedSnap = await getDoc(userRef);
        userProfile = { id: refreshedSnap.id, ...refreshedSnap.data() };
      } else {
        userProfile = { id: userSnap.id, ...existingData };
      }

      // Store in localStorage (convert timestamps to strings for serialization)
      const profileForStorage = {
        ...userProfile,
        createdAt: userProfile.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: userProfile.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
      localStorage.setItem('userProfile', JSON.stringify(profileForStorage));
      console.log('Existing user profile loaded and stored:', profileForStorage);
    }

    console.log('User signed in successfully:', userProfile);
    return user;

  } catch (error) {
    console.error('Error signing in with Google:', error);
    // Clear any existing profile data on error
    localStorage.removeItem('userProfile');
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    // Clear user profile from localStorage
    localStorage.removeItem('userProfile');
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Helper function to get current user profile from localStorage
export const getCurrentUserProfile = () => {
  try {
    const profile = localStorage.getItem('userProfile');
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error getting user profile from localStorage:', error);
    return null;
  }
};

// Helper function to check if current user is Superadmin
export const isSuperadmin = () => {
  const profile = getCurrentUserProfile();
  return profile?.role === USER_ROLES.SUPERADMIN;
};

// Helper function to get user's branch ID
export const getUserBranchId = () => {
  const profile = getCurrentUserProfile();
  return profile?.branchId;
};

// Helper function to get user's role
export const getUserRole = () => {
  const profile = getCurrentUserProfile();
  return profile?.role;
};