import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firestore";
import type { FirestoreProduct as Product } from "@shared/firestore-schema";

// Chemin: users/{userId}/products/{productId}

// Obtenir tous les produits d'un utilisateur
export async function getProducts(userId: string): Promise<Product[]> {
  if (!db) throw new Error("Firestore not initialized");

  const productsRef = collection(db, "users", userId, "products");
  const q = query(productsRef, orderBy("name"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

// Obtenir un produit par ID
export async function getProduct(userId: string, productId: string): Promise<Product | null> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, "users", userId, "products", productId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Product;
}

// Créer un produit
export async function createProduct(
  userId: string,
  product: Omit<Product, "id">
): Promise<Product> {
  if (!db) throw new Error("Firestore not initialized");

  const productsRef = collection(db, "users", userId, "products");
  const docRef = await addDoc(productsRef, {
    ...product,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    ...product,
  } as Product;
}

// Mettre à jour un produit (créé si manquant)
export async function updateProduct(
  userId: string,
  productId: string,
  updates: Partial<Product>,
  options?: { allowCreateIfMissing?: boolean }
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, "users", userId, "products", productId);
  const snap = await getDoc(docRef);

  // Par défaut on ne recrée pas un produit supprimé
  if (!snap.exists() && !options?.allowCreateIfMissing) {
    console.warn(`[Products] Document absent, mise à jour ignorée pour ${productId}`);
    return;
  }

  const payload: Record<string, unknown> = {
    ...updates,
    updatedAt: Timestamp.now(),
  };

  if (!snap.exists() && options?.allowCreateIfMissing) {
    payload.createdAt = Timestamp.now();
  }

  await setDoc(docRef, payload, { merge: true });
}

// Supprimer un produit
export async function deleteProduct(userId: string, productId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, "users", userId, "products", productId);
  await deleteDoc(docRef);
}

// Rechercher des produits par catégorie
export async function getProductsByCategory(
  userId: string,
  category: string
): Promise<Product[]> {
  if (!db) throw new Error("Firestore not initialized");

  const productsRef = collection(db, "users", userId, "products");
  const q = query(
    productsRef,
    where("category", "==", category),
    orderBy("name")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}
 
