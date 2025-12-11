// Système de permissions basé sur les rôles
// Empêche les employés de frauder l'inventaire

export type UserRole = "owner" | "admin" | "manager" | "employee";

const USER_ROLE_VALUES: readonly UserRole[] = ["owner", "admin", "manager", "employee"] as const;

export function normalizeUserRole(role: unknown): UserRole | null {
  if (typeof role !== "string") return null;
  const normalized = role.trim().toLowerCase() as UserRole;
  return USER_ROLE_VALUES.includes(normalized) ? normalized : null;
}

export interface Permission {
  canViewInventory: boolean;
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canAdjustQuantity: boolean;
  canEditPrices: boolean;
  canViewSales: boolean;
  canProcessSales: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
  canExportData: boolean;
  canManageSettings: boolean;
}

// Définition des permissions par rôle
const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  owner: {
    canViewInventory: true,
    canAddProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canAdjustQuantity: true,
    canEditPrices: true,
    canViewSales: true,
    canProcessSales: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canViewAuditLogs: true,
    canExportData: true,
    canManageSettings: true,
  },
  admin: {
    canViewInventory: true,
    canAddProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canAdjustQuantity: true,
    canEditPrices: true,
    canViewSales: true,
    canProcessSales: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canViewAuditLogs: true,
    canExportData: true,
    canManageSettings: true,
  },
  manager: {
    canViewInventory: true,
    canAddProducts: true,
    canEditProducts: true,
    canDeleteProducts: false, // Les managers ne peuvent pas supprimer
    canAdjustQuantity: true,
    canEditPrices: false, // Les managers ne peuvent pas modifier les prix
    canViewSales: true,
    canProcessSales: true,
    canViewAnalytics: true,
    canManageUsers: false,
    canViewAuditLogs: true,
    canExportData: true,
    canManageSettings: false,
  },
  employee: {
    canViewInventory: true,
    canAddProducts: false, // Les employés ne peuvent pas ajouter de produits
    canEditProducts: false, // Les employés ne peuvent pas modifier les produits
    canDeleteProducts: false,
    canAdjustQuantity: false, // CRITIQUE: Les employés ne peuvent pas ajuster l'inventaire
    canEditPrices: false,
    canViewSales: true,
    canProcessSales: true, // Les employés peuvent faire des ventes
    canViewAnalytics: false, // Les employés ne voient pas les analytics
    canManageUsers: false,
    canViewAuditLogs: false,
    canExportData: false,
    canManageSettings: false,
  },
};

/**
 * Obtenir les permissions d'un utilisateur selon son rôle
 */
export function getUserPermissions(role?: UserRole): Permission {
  if (!role) {
    // Par défaut, considérer comme employee si pas de rôle défini
    return ROLE_PERMISSIONS.employee;
  }
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.employee;
}

/**
 * Vérifier si un utilisateur a une permission spécifique
 */
export function hasPermission(
  role: UserRole | undefined,
  permission: keyof Permission
): boolean {
  const permissions = getUserPermissions(role);
  return permissions[permission];
}

/**
 * Obtenir le rôle depuis le localStorage
 */
export function getCurrentUserRole(): UserRole | undefined {
  try {
    // 1. D'abord vérifier bartender-user-role (source principale)
    const directRole = localStorage.getItem("bartender-user-role");
    if (directRole && (directRole === "owner" || directRole === "admin" || directRole === "manager" || directRole === "employee")) {
      return directRole as UserRole;
    }

    // 2. Vérifier dans bartender-auth (si c'est un objet JSON avec role)
    const authData = localStorage.getItem("bartender-auth");
    if (authData && authData !== "authenticated") {
      const parsed = JSON.parse(authData);
      if (parsed.role) return parsed.role;
    }
    
    // 3. Fallback : chercher dans les settings
    const settings = localStorage.getItem("bartender-settings");
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      if (parsedSettings.userRole) return parsedSettings.userRole;
    }
  } catch (error) {
    console.error("Error getting user role:", error);
  }
  return undefined;
}

/**
 * Labels de rôles traduits
 */
export const ROLE_LABELS: Record<UserRole, { fr: string; en: string; es: string; de: string }> = {
  owner: {
    fr: "Propriétaire",
    en: "Owner",
    es: "Propietario",
    de: "Eigentümer",
  },
  admin: {
    fr: "Administrateur",
    en: "Administrator",
    es: "Administrador",
    de: "Administrator",
  },
  manager: {
    fr: "Gérant",
    en: "Manager",
    es: "Gerente",
    de: "Manager",
  },
  employee: {
    fr: "Employé",
    en: "Employee",
    es: "Empleado",
    de: "Mitarbeiter",
  },
};

/**
 * Descriptions de rôles
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, { fr: string; en: string }> = {
  owner: {
    fr: "Accès complet à toutes les fonctionnalités",
    en: "Full access to all features",
  },
  admin: {
    fr: "Accès complet à toutes les fonctionnalités",
    en: "Full access to all features",
  },
  manager: {
    fr: "Gestion de l'inventaire et des ventes, sans modification des prix",
    en: "Inventory and sales management, no price editing",
  },
  employee: {
    fr: "Ventes uniquement, lecture seule pour l'inventaire",
    en: "Sales only, read-only inventory access",
  },
};
