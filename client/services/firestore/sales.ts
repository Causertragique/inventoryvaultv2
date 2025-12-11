import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  orderBy,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "../../lib/firestore";
import type { FirestoreSale as Sale } from "@shared/firestore-schema";

// Chemin: users/{userId}/sales/{saleId}

// Obtenir toutes les ventes d'un utilisateur
export async function getSales(
  userId: string,
  limitCount?: number
): Promise<Sale[]> {
  if (!db) throw new Error("Firestore not initialized");

  const salesRef = collection(db, "users", userId, "sales");
  let q = query(salesRef, orderBy("timestamp", "desc"));

  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Sale[];
}

// Créer une vente
export async function createSale(
  userId: string,
  sale: Omit<Sale, "id" | "timestamp">
): Promise<Sale> {
  if (!db) throw new Error("Firestore not initialized");

  const salesRef = collection(db, "users", userId, "sales");
  
  // Nettoyer récursivement tous les undefined car Firestore ne les accepte pas
  const cleanData = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(item => cleanData(item));
    }
    if (obj !== null && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, cleanData(value)])
      );
    }
    return obj;
  };
  
  const cleanSale = cleanData(sale);
  
  // Retirer userId du document car il est déjà dans le chemin
  const { userId: _, ...saleWithoutUserId } = cleanSale;
  
  const docRef = await addDoc(salesRef, {
    ...saleWithoutUserId,
    timestamp: Timestamp.now(),
  });

  return {
    id: docRef.id,
    ...sale,
    timestamp: new Date(),
  } as Sale;
}
