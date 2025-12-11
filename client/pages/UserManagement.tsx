import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Shield, UserCog } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { UserRole, ROLE_LABELS, hasPermission, getCurrentUserRole } from "@/lib/permissions";
import { listUsers, updateUserRole, UserProfileWithId } from "@/services/firestore/users";
import { createInvite } from "@/services/firestore/invites";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function UserManagement() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfileWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState<UserRole>("employee");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const currentRole = getCurrentUserRole();
  const canManageUsers = hasPermission(currentRole, "canManageUsers");

  const roleOptions: UserRole[] = useMemo(() => ["owner", "admin", "manager", "employee"], []);

  const getRoleLabel = (role: UserRole) => {
    const labels = ROLE_LABELS[role];
    const allowedLangs = ["fr", "en", "es", "de"] as const;
    const langKey = allowedLangs.includes(language as (typeof allowedLangs)[number])
      ? (language as (typeof allowedLangs)[number])
      : "en";
    return labels?.[langKey] || labels?.en || role;
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!isFirebaseConfigured()) {
        throw new Error("Firebase n'est pas configuré");
      }
      const data = await listUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManageUsers) {
      loadUsers();
    }
  }, [canManageUsers]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      setUpdatingId(userId);
      await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      toast({
        title: language === "fr" ? "Rôle mis à jour" : "Role updated",
        description: language === "fr" ? "Le rôle a été enregistré." : "Role saved.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: language === "fr" ? "Erreur" : "Error",
        description: err.message || (language === "fr" ? "Impossible de mettre à jour le rôle" : "Cannot update role"),
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGenerateInvite = async () => {
    if (!auth?.currentUser) {
      toast({
        title: language === "fr" ? "Non connecté" : "Not signed in",
        description: language === "fr" ? "Connectez-vous pour créer un code." : "Sign in to create a code.",
        variant: "destructive",
      });
      return;
    }
    try {
      setInviteLoading(true);
      setInviteCode(null);
      const invite = await createInvite(inviteRole, auth.currentUser.uid);
      setInviteCode(invite.code);
      toast({
        title: language === "fr" ? "Code créé" : "Code created",
        description: language === "fr"
          ? "Partagez ce code avec votre employé."
          : "Share this code with your employee.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: language === "fr" ? "Erreur" : "Error",
        description: err.message || (language === "fr" ? "Impossible de créer le code" : "Cannot create code"),
        variant: "destructive",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  if (!canManageUsers) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                {language === "fr" ? "Accès restreint" : "Restricted access"}
              </CardTitle>
              <CardDescription>
                {language === "fr"
                  ? "Seuls les propriétaires ou administrateurs peuvent gérer les rôles."
                  : "Only owners or admins can manage roles."}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UserCog className="h-6 w-6" />
              {language === "fr" ? "Gestion des rôles" : "Role management"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === "fr"
                ? "Assignez des rôles pour contrôler les permissions."
                : "Assign roles to control permissions."}
            </p>
          </div>
          <Button variant="outline" onClick={loadUsers} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === "fr" ? "Rafraîchir" : "Refresh"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{language === "fr" ? "Inviter un employé" : "Invite an employee"}</CardTitle>
            <CardDescription>
              {language === "fr"
                ? "Générez un code à partager. L'employé le saisira lors de sa connexion pour prendre ce rôle."
                : "Generate a code to share. The employee enters it on login to receive this role."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={language === "fr" ? "Choisir un rôle" : "Choose role"} />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {getRoleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleGenerateInvite} disabled={inviteLoading}>
                {inviteLoading ? (language === "fr" ? "Création..." : "Creating...") : (language === "fr" ? "Générer" : "Generate")}
              </Button>
            </div>
            {inviteCode && (
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Badge variant="secondary">{inviteCode}</Badge>
                <span className="text-muted-foreground">
                  {language === "fr" ? "Partager ce code" : "Share this code"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{language === "fr" ? "Utilisateurs" : "Users"}</CardTitle>
            <CardDescription>
              {language === "fr"
                ? "Sélectionnez un rôle dans la liste déroulante pour mettre à jour."
                : "Select a role from the dropdown to update."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-medium">{language === "fr" ? "Erreur" : "Error"}</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
            {loading ? (
              <p className="text-sm text-muted-foreground">{language === "fr" ? "Chargement..." : "Loading..."}</p>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground">{language === "fr" ? "Aucun utilisateur." : "No users."}</p>
            ) : (
              <div className="divide-y rounded-md border">
                {users.map((user) => (
                  <div key={user.id} className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] items-center gap-3 px-4 py-3">
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user.displayName || user.email || user.id}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email || user.id}</p>
                      <Badge variant="secondary">{getRoleLabel((user.role as UserRole) || "employee")}</Badge>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Select
                        value={(user.role as UserRole) || "employee"}
                        onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                        disabled={updatingId === user.id}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={language === "fr" ? "Choisir un rôle" : "Choose role"} />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {getRoleLabel(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
