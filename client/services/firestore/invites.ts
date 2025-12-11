import { db } from "@/lib/firestore";
import { collection, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { UserRole } from "@/lib/permissions";

const isValidRole = (role: unknown): role is UserRole =>
  role === "owner" || role === "admin" || role === "manager" || role === "employee";

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export interface InviteDoc {
  code: string;
  role: UserRole;
  createdAt: Timestamp;
  createdBy: string;
  used: boolean;
  usedBy?: string;
  usedAt?: Timestamp;
  expiresAt?: Timestamp;
}

export async function createInvite(role: UserRole, createdBy: string, ttlHours = 72): Promise<InviteDoc> {
  if (!db) throw new Error("Firestore not initialized");
  if (!isValidRole(role)) throw new Error("Invalid role");

  const code = generateCode();
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(now.toMillis() + ttlHours * 60 * 60 * 1000);

  const invite: InviteDoc = {
    code,
    role,
    createdAt: now,
    createdBy,
    used: false,
    expiresAt,
  };

  await setDoc(doc(collection(db, "invites"), code), invite);
  return invite;
}

export async function consumeInvite(code: string, userId: string): Promise<UserRole | null> {
  if (!db) throw new Error("Firestore not initialized");
  const snap = await getDoc(doc(db, "invites", code));
  if (!snap.exists()) return null;

  const data = snap.data() as InviteDoc;
  if (data.used) return null;
  if (data.expiresAt && data.expiresAt.toMillis() < Date.now()) return null;
  if (!isValidRole(data.role)) return null;

  await setDoc(doc(db, "invites", code), {
    used: true,
    usedBy: userId,
    usedAt: Timestamp.now(),
  }, { merge: true });

  return data.role;
}
