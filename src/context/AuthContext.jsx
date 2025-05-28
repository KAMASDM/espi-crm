import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { getCurrentUserProfile } from "../services/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);

          let profile = getCurrentUserProfile();

          if (!profile || profile.uid !== firebaseUser.uid) {
            const userRef = doc(db, "users", firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              profile = { id: userSnap.id, ...userSnap.data() };

              const profileForStorage = {
                ...profile,
                createdAt:
                  profile.createdAt?.toDate?.()?.toISOString() ||
                  new Date().toISOString(),
                updatedAt:
                  profile.updatedAt?.toDate?.()?.toISOString() ||
                  new Date().toISOString(),
              };
              localStorage.setItem(
                "userProfile",
                JSON.stringify(profileForStorage)
              );
            } else {
              console.warn("User profile not found in Firestore");
              profile = null;
            }
          }

          setUserProfile(profile);
          console.log("User profile loaded:", profile);
        } else {
          setUser(null);
          setUserProfile(null);
          localStorage.removeItem("userProfile");
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const isSuperadmin = () => userProfile?.role === "Superadmin";
  const isBranchAdmin = () => userProfile?.role === "Branch Admin";
  const isBranchManager = () => userProfile?.role === "Branch Manager";
  const isAgent = () => userProfile?.role === "Agent";
  const isAccountant = () => userProfile?.role === "Accountant";
  const isReception = () => userProfile?.role === "Reception";
  const isCounsellor = () => userProfile?.role === "Counsellor";
  const isProcessor = () => userProfile?.role === "Processor";

  const hasPermission = (requiredRoles) => {
    if (!userProfile) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(userProfile.role);
    }
    return userProfile.role === requiredRoles;
  };

  const canAccessAllBranches = () => {
    return isSuperadmin();
  };

  const getUserBranchId = () => userProfile?.branchId;

  const value = {
    user,
    userProfile,
    loading,
    isSuperadmin,
    isBranchAdmin,
    isBranchManager,
    isAgent,
    isAccountant,
    isReception,
    isCounsellor,
    isProcessor,
    hasPermission,
    canAccessAllBranches,
    getUserBranchId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
