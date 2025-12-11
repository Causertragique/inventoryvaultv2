import type { Firestore } from "firebase/firestore";
import { db as firebaseDb } from "./firebase";

const db: Firestore | null = firebaseDb;

if (db) {
  console.log("Firestore initialised");
}

export { db };
