import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export const useNotifications = () => {
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("recipientIds", "array-contains", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedNotifications = [];
        let currentUnreadCount = 0;
        querySnapshot.forEach((doc) => {
          const notificationData = { id: doc.id, ...doc.data() };
          fetchedNotifications.push(notificationData);
          if (!notificationData.readBy?.includes(user.uid)) {
            currentUnreadCount++;
          }
        });

        setNotifications(fetchedNotifications);
        setUnreadCount(currentUnreadCount);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching notifications:", err);
        setError(err);
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const deleteNotification = async (notificationId) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    deleteNotification,
  };
};
