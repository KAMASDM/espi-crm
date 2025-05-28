import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export const useChats = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("members", "array-contains", user.uid),
      orderBy("lastMessageTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const userChats = [];
        querySnapshot.forEach((doc) => {
          userChats.push({ id: doc.id, ...doc.data() });
        });
        setChats(userChats);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching chats:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { chats, loading, error };
};

export const useMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(50)); 

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const chatMessages = [];
        querySnapshot.forEach((doc) => {
          chatMessages.push({ id: doc.id, ...doc.data() });
        });
        setMessages(chatMessages);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching messages for chat ${chatId}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  return { messages, loading, error };
};

export const useChatUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const usersRef = collection(db, "users");
    const q = query(usersRef); 

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const userList = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentUser.uid) {
            userList.push({ id: doc.id, ...doc.data() });
          }
        });
        setUsers(userList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching users for chat:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return { users, loading, error };
};
