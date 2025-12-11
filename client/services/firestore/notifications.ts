import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface StockAlert {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  currentStock: number;
  thresholdLevel: number;
  alertType: "low_stock" | "out_of_stock";
  createdAt: Date;
  dismissedAt?: Date;
  isDismissed: boolean;
}

export interface RemoteNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "stock_alert" | "reminder" | "info";
  scheduledFor: Date;
  createdAt: Date;
  isRead: boolean;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description: string;
  scheduledFor: Date;
  createdAt: Date;
  completed: boolean;
  priority: "low" | "medium" | "high";
  relatedProductId?: string;
}

// Stock Alerts
export const stockAlertsService = {
  create: async (
    userId: string,
    alert: Omit<StockAlert, "id" | "createdAt" | "dismissedAt" | "userId">
  ): Promise<StockAlert> => {
    const docRef = await addDoc(collection(db!, "stock_alerts"), {
      ...alert,
      userId,
      createdAt: Timestamp.now(),
    });
    return { ...alert, userId, id: docRef.id, createdAt: new Date(), dismissedAt: undefined } as StockAlert;
  },

  getByUserId: async (userId: string): Promise<StockAlert[]> => {
    const q = query(
      collection(db!, "stock_alerts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      dismissedAt: doc.data().dismissedAt?.toDate(),
    })) as StockAlert[];
  },

  dismiss: async (alertId: string): Promise<void> => {
    await updateDoc(doc(db!, "stock_alerts", alertId), {
      isDismissed: true,
      dismissedAt: Timestamp.now(),
    });
  },

  delete: async (alertId: string): Promise<void> => {
    await deleteDoc(doc(db!, "stock_alerts", alertId));
  },
};

// Reminders
export const remindersService = {
  create: async (
    userId: string,
    reminder: Omit<Reminder, "id" | "createdAt" | "userId">
  ): Promise<Reminder> => {
    const docRef = await addDoc(collection(db!, "reminders"), {
      ...reminder,
      userId,
      createdAt: Timestamp.now(),
      scheduledFor: Timestamp.fromDate(reminder.scheduledFor),
    });
    return {
      ...reminder,
      userId,
      id: docRef.id,
      createdAt: new Date(),
      scheduledFor: reminder.scheduledFor,
    } as Reminder;
  },

  getByUserId: async (userId: string): Promise<Reminder[]> => {
    const q = query(
      collection(db!, "reminders"),
      where("userId", "==", userId),
      orderBy("scheduledFor", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      scheduledFor: doc.data().scheduledFor?.toDate() || new Date(),
    })) as Reminder[];
  },

  getUpcoming: async (userId: string, days: number = 7): Promise<Reminder[]> => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const q = query(
      collection(db!, "reminders"),
      where("userId", "==", userId),
      where("completed", "==", false),
      where("scheduledFor", ">=", Timestamp.fromDate(now)),
      where("scheduledFor", "<=", Timestamp.fromDate(futureDate)),
      orderBy("scheduledFor", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      scheduledFor: doc.data().scheduledFor?.toDate() || new Date(),
    })) as Reminder[];
  },

  markAsCompleted: async (reminderId: string): Promise<void> => {
    await updateDoc(doc(db!, "reminders", reminderId), {
      completed: true,
    });
  },

  delete: async (reminderId: string): Promise<void> => {
    await deleteDoc(doc(db!, "reminders", reminderId));
  },

  update: async (
    reminderId: string,
    updates: Partial<Reminder>
  ): Promise<void> => {
    const data: any = { ...updates };
    if (updates.scheduledFor) {
      data.scheduledFor = Timestamp.fromDate(updates.scheduledFor);
    }
    await updateDoc(doc(db!, "reminders", reminderId), data);
  },
};

// Remote Notifications (for user alerts)
export const notificationsService = {
  create: async (
    userId: string,
    notification: Omit<RemoteNotification, "id" | "createdAt" | "userId">
  ): Promise<RemoteNotification> => {
    const docRef = await addDoc(collection(db!, "notifications"), {
      ...notification,
      userId,
      createdAt: Timestamp.now(),
      scheduledFor: Timestamp.fromDate(notification.scheduledFor),
    });
    return {
      ...notification,
      userId,
      id: docRef.id,
      createdAt: new Date(),
    } as RemoteNotification;
  },

  getByUserId: async (userId: string): Promise<RemoteNotification[]> => {
    const q = query(
      collection(db!, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      scheduledFor: doc.data().scheduledFor?.toDate() || new Date(),
    })) as RemoteNotification[];
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await updateDoc(doc(db!, "notifications", notificationId), {
      isRead: true,
    });
  },

  delete: async (notificationId: string): Promise<void> => {
    await deleteDoc(doc(db!, "notifications", notificationId));
  },
};
