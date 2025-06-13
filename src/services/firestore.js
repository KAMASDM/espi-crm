import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";

const getUserProfile = () => {
  try {
    const profile = localStorage.getItem("userProfile");
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export const firestoreService = {
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },

  async getAll(collectionName, constraints = []) {
    try {
      let q = collection(db, collectionName);

      const validConstraints = constraints.filter(
        (constraint) => constraint != null && typeof constraint === "object"
      );

      if (validConstraints.length > 0) {
        q = query(q, ...validConstraints);
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },

  async getById(collectionName, id) {
    try {
      if (!id) {
        console.log("undefined ID.");
        return null;
      }
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },

  async update(collectionName, id, data) {
    try {
      if (!id) {
        console.log("undefined ID.");
        throw new Error("Document ID is undefined for update operation.");
      }
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },

  async delete(collectionName, id) {
    try {
      if (!id) {
        console.log("undefined ID.");
        throw new Error("Document ID is undefined for delete operation.");
      }
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },

  subscribe(collectionName, callback, constraints = [], onErrorCallback) {
    try {
      let qRef = collection(db, collectionName);

      const validConstraints = constraints.filter(
        (constraint) => constraint != null && typeof constraint === "object"
      );

      if (validConstraints.length > 0) {
        qRef = query(qRef, ...validConstraints);
      }

      const unsubscribe = onSnapshot(
        qRef,
        (querySnapshot) => {
          const documents = querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          callback(documents);
        },
        (error) => {
          console.log("error", error);
          if (onErrorCallback) {
            onErrorCallback(error);
          }
        }
      );
      return unsubscribe;
    } catch (error) {
      console.log("error", error);
      if (onErrorCallback) {
        onErrorCallback(error);
      }
      return () => {};
    }
  },
};

export const enquiryService = {
  create: (data) => {
    const currentUser = auth.currentUser;
    const userProfile = getUserProfile();
    return firestoreService.create("enquiries", {
      ...data,
      createdBy: currentUser?.uid,
      branchId: data.branchId || userProfile?.branchId || null,
    });
  },

  update: (id, data) => firestoreService.update("enquiries", id, data),

  delete: (id) => firestoreService.delete("enquiries", id),
  getAll: (constraints = []) =>
    firestoreService.getAll("enquiries", constraints),

  getById: (id) => firestoreService.getById("enquiries", id),

  subscribe: (callback, constraints = [], onError) =>
    firestoreService.subscribe("enquiries", callback, constraints, onError),
};

export const detailEnquiryService = {
  create: async (data) => {
    const currentUser = auth.currentUser;

    return firestoreService.create("detailEnquiries", {
      ...data,
      createdBy: currentUser?.uid,
    });
  },

  update: (id, data) => firestoreService.update("detailEnquiries", id, data),

  delete: (id) => firestoreService.delete("detailEnquiries", id),

  getAll: (constraints = []) =>
    firestoreService.getAll("detailEnquiries", constraints),

  getById: (id) => firestoreService.getById("detailEnquiries", id),

  subscribe: (callback, constraints = [], onError) =>
    firestoreService.subscribe(
      "detailEnquiries",
      callback,
      constraints,
      onError
    ),
};

export const universityService = {
  create: (data) => {
    const currentUser = auth.currentUser;
    return firestoreService.create("universities", {
      ...data,
      createdBy: currentUser?.uid,
    });
  },

  update: (id, data) => firestoreService.update("universities", id, data),

  delete: (id) => firestoreService.delete("universities", id),

  getAll: (constraints = []) =>
    firestoreService.getAll("universities", constraints),

  getById: (id) => firestoreService.getById("universities", id),

  subscribe: (callback, constraints = [], onError) =>
    firestoreService.subscribe("universities", callback, constraints, onError),
};

export const courseService = {
  create: (data) => {
    const currentUser = auth.currentUser;
    return firestoreService.create("courses", {
      ...data,
      createdBy: currentUser?.uid,
    });
  },

  update: (id, data) => firestoreService.update("courses", id, data),

  delete: (id) => firestoreService.delete("courses", id),

  getAll: (constraints = []) => firestoreService.getAll("courses", constraints),

  getById: (id) => firestoreService.getById("courses", id),

  subscribe: (callback, constraints = [], onError) =>
    firestoreService.subscribe("courses", callback, constraints, onError),
};

export const assessmentService = {
  create: (data) => {
    const currentUser = auth.currentUser;
    const userProfile = getUserProfile();
    return firestoreService.create("assessments", {
      ...data,
      createdBy: currentUser?.uid,
      branchId: userProfile.branchId || null,
    });
  },

  update: (id, data) => firestoreService.update("assessments", id, data),

  delete: (id) => firestoreService.delete("assessments", id),

  getAll: (constraints = []) =>
    firestoreService.getAll("assessments", constraints),
  getById: (id) => firestoreService.getById("assessments", id),

  subscribe: (callback, constraints = [], onError) =>
    firestoreService.subscribe("assessments", callback, constraints, onError),
};

export const applicationService = {
  create: (data) => {
    const currentUser = auth.currentUser;
    const userProfile = getUserProfile();
    return firestoreService.create("applications", {
      ...data,
      createdBy: currentUser?.uid,
      branchId: data.branchId || userProfile?.branchId || null,
    });
  },

  update: (id, data) => firestoreService.update("applications", id, data),

  delete: (id) => firestoreService.delete("applications", id),

  getAll: (constraints = []) =>
    firestoreService.getAll("applications", constraints),

  getById: (id) => firestoreService.getById("applications", id),

  subscribe: (callback, constraints = [], onError) =>
    firestoreService.subscribe("applications", callback, constraints, onError),
};

export const paymentService = {
  create: (data) => {
    const currentUser = auth.currentUser;
    const userProfile = getUserProfile();
    return firestoreService.create("payments", {
      ...data,
      createdBy: currentUser?.uid,
      payment_received_by: currentUser?.uid,
      branchId: data.branchId || userProfile?.branchId || null,
    });
  },

  update: (id, data) => firestoreService.update("payments", id, data),

  delete: (id) => firestoreService.delete("payments", id),

  getAll: (constraints = []) =>
    firestoreService.getAll("payments", constraints),

  getById: (id) => firestoreService.getById("payments", id),

  subscribe: (callback, constraints = [], onError) =>
    firestoreService.subscribe("payments", callback, constraints, onError),
};

export const userService = {
  create: (data) => {
    const currentUser = auth.currentUser;
    return firestoreService.create("users", {
      ...data,
      createdBy: currentUser?.uid,
    });
  },

  update: (id, data) => firestoreService.update("users", id, data),

  delete: (id) => firestoreService.delete("users", id),

  getAll: (constraints = []) => firestoreService.getAll("users", constraints),

  getById: (id) => firestoreService.getById("users", id),

  subscribe: (callback, constraints = [], onError) =>
    firestoreService.subscribe("users", callback, constraints, onError),
};

export const branchService = {
  create: (data) => {
    const currentUser = auth.currentUser;
    return firestoreService.create("branches", {
      ...data,
      createdBy: currentUser?.uid,
    });
  },

  update: (id, data) => firestoreService.update("branches", id, data),

  delete: (id) => firestoreService.delete("branches", id),

  getAll: (constraints = []) =>
    firestoreService.getAll("branches", constraints),

  getById: (id) => firestoreService.getById("branches", id),

  subscribe: (callback, constraints = [], onError) =>
    firestoreService.subscribe("branches", callback, constraints, onError),
};

export const serviceService = {
  create: (data) => {
    const currentUser = auth.currentUser;
    return firestoreService.create("services", {
      ...data,
      createdBy: currentUser?.uid,
    });
  },

  update: (id, data) => firestoreService.update("services", id, data),

  delete: (id) => firestoreService.delete("services", id),

  getAll: (constraints = []) =>
    firestoreService.getAll("services", constraints),

  getById: (id) => firestoreService.getById("services", id),

  subscribe: (callback, constraints = [], onError) =>
    firestoreService.subscribe("services", callback, constraints, onError),
};

export const chatService = {
  async sendMessage(chatId, messageText) {
    const currentUser = auth.currentUser;
    if (!currentUser || !chatId || !messageText?.trim()) {
      throw new Error("User chat ID or message missing.");
    }

    const messagesRef = collection(db, "chats", chatId, "messages");
    const chatDocRef = doc(db, "chats", chatId);

    try {
      await addDoc(messagesRef, {
        chatId: chatId,
        text: messageText.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        senderPhotoURL: currentUser.photoURL,
        timestamp: serverTimestamp(),
      });

      const chatSnap = await getDoc(chatDocRef);
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        const newUnreadCount = { ...(chatData.unreadCount || {}) };

        if (chatData.members && Array.isArray(chatData.members)) {
          chatData.members.forEach((memberId) => {
            if (memberId !== currentUser.uid) {
              newUnreadCount[memberId] = (newUnreadCount[memberId] || 0) + 1;
            } else {
              newUnreadCount[memberId] = 0;
            }
          });
        }

        await updateDoc(chatDocRef, {
          lastMessageText: messageText.trim(),
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSenderId: currentUser.uid,
          unreadCount: newUnreadCount,
        });
      }
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },

  async createChat(chatData) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated.");

    const { type, name, members, memberInfo } = chatData;

    if (
      !type ||
      !members ||
      !Array.isArray(members) ||
      members.length < (type === "direct" ? 2 : 1)
    ) {
      throw new Error("Invalid chat data: type or members missing/invalid.");
    }

    if (type === "direct" && members.length === 2) {
      const sortedMembers = [...members].sort();
      try {
        const q = query(
          collection(db, "chats"),
          where("type", "==", "direct"),
          where("members", "==", sortedMembers)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const existingChatDoc = querySnapshot.docs[0];
          return {
            id: existingChatDoc.id,
            ...existingChatDoc.data(),
            existing: true,
          };
        }
      } catch (error) {
        console.log("error", error);
      }
    }

    const initialUnreadCount = {};
    members.forEach((memberId) => {
      initialUnreadCount[memberId] = 0;
    });

    try {
      const docRef = await addDoc(collection(db, "chats"), {
        name: type === "group" ? name || "New Group" : "",
        type: type,
        members: type === "direct" ? [...members].sort() : members,
        memberInfo: memberInfo,
        lastMessageText: type === "group" ? "Group created" : "Chat started",
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: currentUser.uid,
        unreadCount: initialUnreadCount,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      const newChatSnap = await getDoc(docRef);
      return { id: newChatSnap.id, ...newChatSnap.data(), created: true };
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },

  async markChatAsRead(chatId) {
    const currentUser = auth.currentUser;
    if (!currentUser || !chatId) return;

    const chatDocRef = doc(db, "chats", chatId);
    try {
      const chatSnap = await getDoc(chatDocRef);
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        const newUnreadCount = { ...(chatData.unreadCount || {}) };
        newUnreadCount[currentUser.uid] = 0;

        await updateDoc(chatDocRef, {
          unreadCount: newUnreadCount,
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  },

  subscribeToUserChats(userId, callback, onError) {
    if (!userId) {
      if (onError)
        onError(new Error("User ID is required for chat subscription."));
      return () => {};
    }
    try {
      const q = query(
        collection(db, "chats"),
        where("members", "array-contains", userId),
        orderBy("lastMessageTimestamp", "desc")
      );
      return onSnapshot(q, callback, onError);
    } catch (error) {
      console.log("error", error);
      if (onError) onError(error);
      return () => {};
    }
  },

  subscribeToMessages(chatId, callback, onError) {
    if (!chatId) {
      if (onError)
        onError(new Error("Chat ID is required for message subscription."));
      return () => {};
    }
    try {
      const q = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("timestamp", "asc")
      );
      return onSnapshot(
        q,
        (querySnapshot) => {
          const messages = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(messages);
        },
        onError
      );
    } catch (error) {
      console.log("error", error);
      if (onError) onError(error);
      return () => {};
    }
  },
};

export const notificationService = {
  async send(title, body, recipientIds, type = "system", link = "") {
    try {
      await firestoreService.create("notifications", {
        title,
        body,
        recipientIds,
        type,
        link,
        readBy: [],
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },
};
