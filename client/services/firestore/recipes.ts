import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firestore";
import type { FirestoreRecipe as Recipe } from "@shared/firestore-schema";

// Chemin: users/{userId}/recipes/{recipeId}

// Obtenir toutes les recettes d'un utilisateur
export async function getRecipes(userId: string): Promise<Recipe[]> {
  if (!db) throw new Error("Firestore not initialized");

  const recipesRef = collection(db, "users", userId, "recipes");
  const q = query(recipesRef, orderBy("name"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Recipe[];
}

// Obtenir une recette par ID
export async function getRecipe(userId: string, recipeId: string): Promise<Recipe | null> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, "users", userId, "recipes", recipeId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Recipe;
}

// Créer une recette
export async function createRecipe(
  userId: string,
  recipe: Omit<Recipe, "id">
): Promise<Recipe> {
  if (!db) throw new Error("Firestore not initialized");

  const recipesRef = collection(db, "users", userId, "recipes");
  const docRef = await addDoc(recipesRef, {
    ...recipe,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    ...recipe,
  } as Recipe;
}

// Mettre à jour une recette
export async function updateRecipe(
  userId: string,
  recipeId: string,
  updates: Partial<Recipe>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, "users", userId, "recipes", recipeId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

// Supprimer une recette
export async function deleteRecipe(userId: string, recipeId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, "users", userId, "recipes", recipeId);
  await deleteDoc(docRef);
}
