// Service d'audit pour tracer toutes les modifications d'inventaire
// Permet de détecter et prévenir la fraude

import { db, auth, isFirebaseConfigured } from "./firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";
import { FirestoreInventoryLog } from "@shared/firestore-schema";
import { getCurrentUserRole } from "./permissions";

/**
 * Logger une modification d'inventaire
 */
export async function logInventoryChange(params: {
  productId: string;
  productName: string;
  action: "create" | "update" | "delete" | "restock" | "adjustment" | "sale";
  previousQuantity?: number;
  newQuantity: number;
  previousPrice?: number;
  newPrice?: number;
  reason?: string;
  source?: "manual" | "sale" | "import" | "automatic";
}): Promise<void> {
  try {
    // Récupérer les infos utilisateur
    const userId = auth?.currentUser?.uid || localStorage.getItem("bartender-user-id") || "unknown";
    const username = auth?.currentUser?.displayName || localStorage.getItem("bartender-username") || "Utilisateur inconnu";
    const userRole = getCurrentUserRole() || "employee";

    // Calculer la différence de quantité
    const difference = params.previousQuantity !== undefined 
      ? params.newQuantity - params.previousQuantity 
      : undefined;

    const logEntry: Omit<FirestoreInventoryLog, "id"> = {
      productId: params.productId,
      productName: params.productName,
      action: params.action,
      previousQuantity: params.previousQuantity,
      newQuantity: params.newQuantity,
      difference,
      previousPrice: params.previousPrice,
      newPrice: params.newPrice,
      reason: params.reason,
      userId,
      username,
      userRole,
      timestamp: serverTimestamp(),
      metadata: {
        source: params.source || "manual",
      },
    };

    // Supprimer les champs undefined (Firestore refuse les valeurs undefined)
    const sanitizedLogEntry = Object.fromEntries(
      Object.entries(logEntry).filter(([, value]) => value !== undefined)
    ) as Omit<FirestoreInventoryLog, "id">;

    // Sauvegarder dans Firestore si disponible
    if (isFirebaseConfigured() && auth?.currentUser && db) {
      const logsRef = collection(db, `users/${userId}/inventory_logs`);
      await addDoc(logsRef, sanitizedLogEntry);
    }

    // Sauvegarder aussi dans localStorage pour traçabilité locale
    const localLogs = JSON.parse(localStorage.getItem("inventory-audit-logs") || "[]");
    localLogs.push({
      ...sanitizedLogEntry,
      timestamp: new Date().toISOString(),
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    
    // Garder seulement les 1000 derniers logs localement
    if (localLogs.length > 1000) {
      localLogs.splice(0, localLogs.length - 1000);
    }
    
    localStorage.setItem("inventory-audit-logs", JSON.stringify(localLogs));

    console.log("[Audit] Modification d'inventaire enregistrée:", logEntry);
  } catch (error) {
    console.error("[Audit] Erreur lors de l'enregistrement du log:", error);
    // Ne pas bloquer l'opération si le log échoue
  }
}

/**
 * Récupérer les logs d'audit récents
 */
export async function getRecentInventoryLogs(maxResults: number = 100): Promise<FirestoreInventoryLog[]> {
  try {
    if (isFirebaseConfigured() && auth?.currentUser && db) {
      const userId = auth.currentUser.uid;
      const logsRef = collection(db, `users/${userId}/inventory_logs`);
      const q = query(logsRef, orderBy("timestamp", "desc"), limit(maxResults));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreInventoryLog[];
    }

    // Fallback sur localStorage
    const localLogs = JSON.parse(localStorage.getItem("inventory-audit-logs") || "[]");
    return localLogs.slice(-maxResults).reverse();
  } catch (error) {
    console.error("[Audit] Erreur lors de la récupération des logs:", error);
    return [];
  }
}

/**
 * Détecter des modifications suspectes (fraude potentielle)
 */
export function detectSuspiciousActivity(logs: FirestoreInventoryLog[]): {
  suspicious: boolean;
  alerts: string[];
} {
  const alerts: string[] = [];

  // Analyser les 50 derniers logs
  const recentLogs = logs.slice(0, 50);

  // 1. Vérifier les ajustements fréquents par un employé
  const employeeAdjustments = recentLogs.filter(
    log => log.userRole === "employee" && log.action === "adjustment"
  );
  if (employeeAdjustments.length > 0) {
    alerts.push(`⚠️ ${employeeAdjustments.length} ajustement(s) d'inventaire par un employé (interdit)`);
  }

  // 2. Vérifier les modifications de prix par des non-autorisés
  const unauthorizedPriceChanges = recentLogs.filter(
    log => (log.userRole === "employee" || log.userRole === "manager") 
      && log.previousPrice !== undefined 
      && log.newPrice !== undefined 
      && log.previousPrice !== log.newPrice
  );
  if (unauthorizedPriceChanges.length > 0) {
    alerts.push(`⚠️ ${unauthorizedPriceChanges.length} modification(s) de prix non autorisée(s)`);
  }

  // 3. Détecter les ajustements importants sans raison
  const largeAdjustments = recentLogs.filter(
    log => log.action === "adjustment" 
      && Math.abs(log.difference || 0) > 10 
      && !log.reason
  );
  if (largeAdjustments.length > 0) {
    alerts.push(`⚠️ ${largeAdjustments.length} ajustement(s) important(s) sans raison`);
  }

  // 4. Vérifier les suppressions suspectes
  const deletions = recentLogs.filter(
    log => log.action === "delete" && log.userRole !== "owner" && log.userRole !== "admin"
  );
  if (deletions.length > 0) {
    alerts.push(`⚠️ ${deletions.length} suppression(s) par un utilisateur non autorisé`);
  }

  // 5. Activité anormalement élevée d'un seul utilisateur
  const userActivity: Record<string, number> = {};
  recentLogs.forEach(log => {
    userActivity[log.userId] = (userActivity[log.userId] || 0) + 1;
  });
  
  Object.entries(userActivity).forEach(([userId, count]) => {
    if (count > 20) {
      const user = recentLogs.find(l => l.userId === userId);
      alerts.push(`⚠️ Activité élevée (${count} modifications) par ${user?.username || userId}`);
    }
  });

  return {
    suspicious: alerts.length > 0,
    alerts,
  };
}

/**
 * Générer un rapport d'audit
 */
export function generateAuditReport(logs: FirestoreInventoryLog[]): {
  totalChanges: number;
  byAction: Record<string, number>;
  byUser: Record<string, number>;
  byRole: Record<string, number>;
  suspiciousActivity: ReturnType<typeof detectSuspiciousActivity>;
} {
  const byAction: Record<string, number> = {};
  const byUser: Record<string, number> = {};
  const byRole: Record<string, number> = {};

  logs.forEach(log => {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
    byUser[log.username] = (byUser[log.username] || 0) + 1;
    byRole[log.userRole] = (byRole[log.userRole] || 0) + 1;
  });

  return {
    totalChanges: logs.length,
    byAction,
    byUser,
    byRole,
    suspiciousActivity: detectSuspiciousActivity(logs),
  };
}
