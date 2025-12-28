import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInvite } from "@/services/firestore/invites";
import { useAuth } from "@/hooks/useAuth";
import { UserRole, ROLE_LABELS } from "@/lib/permissions";
import { getEmployeeLimit, PLAN_DISPLAY_NAMES, SubscriptionPlan } from "@shared/subscription-plans";
import { getUserProfile, listUsers } from "@/services/firestore/users";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function InviteEmployeeSection() {
  const [inviteRole, setInviteRole] = useState<UserRole>("employee");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>("freemium");
  const [employeesCount, setEmployeesCount] = useState(0);
  const planLimit = getEmployeeLimit(currentPlan);
  const planLabel = PLAN_DISPLAY_NAMES[currentPlan].fr;
  const slotsRemaining = planLimit === null ? null : Math.max(0, planLimit - employeesCount);

  useEffect(() => {
    const loadPlanInfo = async () => {
      if (!user?.uid || !isFirebaseConfigured()) return;
      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.subscriptionPlan) {
          setCurrentPlan(profile.subscriptionPlan);
        }
        const allUsers = await listUsers();
        setEmployeesCount(allUsers.filter((u) => (u.role || "employee") !== "owner").length);
      } catch (err) {
        console.error("[InviteEmployeeSection] Failed to load plan info", err);
      }
    };
    loadPlanInfo();
  }, [user?.uid]);

  const handleGenerateInvite = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.uid) {
        setError("Utilisateur non authentifié.");
        setLoading(false);
        return;
      }
      if (planLimit !== null && employeesCount >= planLimit) {
        const limitMessage = `La limite pour le plan ${planLabel} est atteinte (${planLimit} employé${planLimit > 1 ? "s" : ""}).`;
        setError(limitMessage);
        toast({
          title: "Limite atteinte",
          description: limitMessage,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const invite = await createInvite(inviteRole, user.uid);
      setInviteCode(invite.code);
    } catch (err: any) {
      setError("Erreur lors de la génération du code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Rôle à attribuer :</label>
        <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as UserRole)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choisir le rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">{ROLE_LABELS.employee.fr}</SelectItem>
            <SelectItem value="manager">{ROLE_LABELS.manager.fr}</SelectItem>
            <SelectItem value="admin">{ROLE_LABELS.admin.fr}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleGenerateInvite}
        disabled={loading || (planLimit !== null && employeesCount >= planLimit)}
      >
        {loading ? "Génération..." : "Générer le code d'invitation"}
      </Button>
      {slotsRemaining !== null && (
        <p
          className={`text-xs ${
            slotsRemaining === 0 ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {slotsRemaining > 0
            ? `${slotsRemaining} place${slotsRemaining > 1 ? "s" : ""} restante${slotsRemaining > 1 ? "s" : ""} dans le plan ${planLabel}.`
            : `Le plan ${planLabel} n'autorise plus d'employés supplémentaires.`}
        </p>
      )}
      {inviteCode && (
        <div className="mt-2 p-2 bg-secondary rounded text-center">
          <span className="font-mono text-lg">{inviteCode}</span>
          <div className="text-xs mt-1">À transmettre à l'employé pour inscription.</div>
        </div>
      )}
      {error && <div className="text-destructive text-sm mt-2">{error}</div>}
    </div>
  );
}
