import { collection, addDoc, getDocs, serverTimestamp, query, where, onSnapshot, doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import emailjs from "emailjs-com";
import { db } from "./firebase";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

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
      console.error("Error creating document:", error);
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
      console.error("Error getting all documents:", error);
      throw error;
    }
  },

  async getById(collectionName, id) {
    try {
      if (!id) {
        console.error("Document ID is undefined.");
        return null;
      }
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error("Error getting document by ID:", error);
      throw error;
    }
  },

  async update(collectionName, id, data) {
    try {
      if (!id) {
        throw new Error("Document ID is undefined for update operation.");
      }
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  },

  async delete(collectionName, id) {
    try {
      if (!id) {
        throw new Error("Document ID is undefined for delete operation.");
      }
      await deleteDoc(doc(db, collectionName, id));
    } catch (error)
{
      console.error("Error deleting document:", error);
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
          console.error("Error in subscription:", error);
          if (onErrorCallback) {
            onErrorCallback(error);
          }
        }
      );
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up subscription:", error);
      if (onErrorCallback) {
        onErrorCallback(error);
      }
      return () => {};
    }
  },
};

export const serviceService = {
    create: (data) => firestoreService.create("services", data),
    update: (id, data) => firestoreService.update("services", id, data),
    delete: (id) => firestoreService.delete("services", id),
    getAll: (constraints = []) =>
        firestoreService.getAll("services", constraints),
    getById: (id) => firestoreService.getById("services", id),
    subscribe: (callback, constraints = [], onError) =>
        firestoreService.subscribe("services", callback, constraints, onError),
};

export const getActiveServices = () => {
    const constraints = [where("isActive", "==", true)];
    return firestoreService.getAll("services", constraints);
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
      console.error("Error sending notification:", error);
      throw error;
    }
  },
};

export const userService = {
    getAll: () => firestoreService.getAll("users"),
};


export const submitEnquiry = async (data) => {
    try {
        const enquiryData = {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            branchId: "public_form_branch", // Default branch
            assignedUserId: "default_user_id", // Default user
        };

        const docRef = await addDoc(collection(db, "enquiries"), enquiryData);

        // --- Notification Logic ---
        const studentFullName = `${data.student_First_Name} ${data.student_Last_Name}`.trim();

        // Fetch users to notify
        const users = await userService.getAll();
        const admins = users.filter(user => user.role === 'Superadmin' || user.role === 'Branch Admin');
        const recipientIds = admins.map(admin => admin.id);

        // 1. Send Push Notification
        if (recipientIds.length > 0) {
            await notificationService.send(
                "New Enquiry Received",
                `A new enquiry has been submitted by ${studentFullName}.`,
                recipientIds,
                "enquiry",
                `/enquiries/${docRef.id}`
            );
        }

        // 2. Send Email Notification
        if (admins.length > 0) {
            const templateParams = {
                studentName: studentFullName,
                studentEmail: data.student_email,
                studentPhone: data.student_phone,
                countryInterested: Array.isArray(data.country_interested) ? data.country_interested.join(", ") : data.country_interested,
                servicesInterested: Array.isArray(data.Interested_Services) ? data.Interested_Services.join(", ") : data.Interested_Services,
                recipient_email: admins.map(admin => admin.email).join(','), // Assuming your template can handle multiple recipients or you loop through them
            };
            await sendEmailNotification(templateParams);
        }
        // --- End of Notification Logic ---

        return docRef.id;
    } catch (error) {
        console.error("Error submitting enquiry:", error);
        throw error;
    }
};

const sendEmailNotification = async (templateParams) => {
    if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        console.warn("EmailJS is not configured. Skipping email notification.");
        return;
    }

    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
    } catch (error) {
        console.error("Failed to send email notification:", error);
    }
};