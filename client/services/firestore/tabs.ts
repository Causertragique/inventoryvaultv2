import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firestore";
import type { FirestoreTab } from "@shared/firestore-schema";

const cleanData = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanData(item));
  }
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, cleanData(value)]),
    );
  }
  return obj;
};

const mapDocToTab = (docSnap: any): FirestoreTab & { id: string } => {
  const data = docSnap.data() as FirestoreTab;
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : data.createdAt
      ? new Date(data.createdAt)
      : new Date();
  const updatedAt =
    data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate()
      : data.updatedAt
      ? new Date(data.updatedAt)
      : undefined;
  return {
    id: docSnap.id,
    ...data,
    createdAt,
    updatedAt,
  };
};

export async function fetchOpenTabs(userId: string): Promise<Array<FirestoreTab & { id: string }>> {
  if (!db) throw new Error("Firestore not initialized");

  const tabsRef = collection(db, "users", userId, "tabs");
  const tabsQuery = query(
    tabsRef,
    where("status", "==", "open"),
    orderBy("createdAt", "asc"),
  );
  const snapshot = await getDocs(tabsQuery);
  return snapshot.docs.map(mapDocToTab);
}

export async function createTabRecord(
  userId: string,
  tab: Omit<FirestoreTab, "id" | "createdAt" | "updatedAt">,
): Promise<FirestoreTab & { id: string }> {
  if (!db) throw new Error("Firestore not initialized");

  const tabsRef = collection(db, "users", userId, "tabs");
  const now = Timestamp.now();
  const cleanTab = cleanData(tab);
  const docRef = await addDoc(tabsRef, {
    ...cleanTab,
    createdAt: now,
    updatedAt: now,
  });
  return {
    id: docRef.id,
    ...cleanTab,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };
}

export async function updateTabRecord(
  userId: string,
  tabId: string,
  tab: Omit<FirestoreTab, "id" | "createdAt" | "updatedAt">,
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const tabRef = doc(db, "users", userId, "tabs", tabId);
  await updateDoc(tabRef, {
    ...cleanData(tab),
    updatedAt: Timestamp.now(),
  });
}

export async function deleteTabRecord(userId: string, tabId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const tabRef = doc(db, "users", userId, "tabs", tabId);
  await deleteDoc(tabRef);
}
