import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
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

  const markAsRead = async (notificationId) => {
    if (!user || !notificationId) return;
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        readBy: [
          ...(notifications.find((n) => n.id === notificationId)?.readBy || []),
          user.uid,
        ],
      });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const unreadNotifications = notifications.filter(
        (n) => !n.readBy?.includes(user.uid)
      );
      const batch = db.batch();
      unreadNotifications.forEach((n) => {
        const notificationRef = doc(db, "notifications", n.id);
        batch.update(notificationRef, {
          readBy: [...(n.readBy || []), user.uid],
        });
      });
      await batch.commit();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  };
};
