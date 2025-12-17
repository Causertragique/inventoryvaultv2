import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firestore";
import type { FirestoreProductSale } from "@shared/firestore-schema";

// Chemin: users/{userId}/products_sales/{saleId}
export async function logProductSale(
  userId: string,
  productSale: Omit<FirestoreProductSale, "id" | "timestamp">
): Promise<FirestoreProductSale> {
  if (!db) throw new Error("Firestore not initialized");

  const salesRef = collection(db, "users", userId, "products_sales");
  const docRef = await addDoc(salesRef, {
    ...productSale,
    timestamp: Timestamp.now(),
  });

  return {
    id: docRef.id,
    ...productSale,
    timestamp: new Date(),
  };
}
