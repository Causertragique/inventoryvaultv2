import { getFirestore, Firestore } from "firebase/firestore";
import { app } from "./firebase";

let db: Firestore | null = null;

if (app) {
  db = getFirestore(app);
  console.log("Firestore initialisé");
}

export { db };
