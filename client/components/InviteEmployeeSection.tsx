import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInvite } from "@/services/firestore/invites";
import { UserRole, ROLE_LABELS } from "@/lib/permissions";

export function InviteEmployeeSection() {
  const [inviteRole, setInviteRole] = useState<UserRole>("employee");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInvite = async () => {
    setLoading(true);
    setError(null);
    try {
      const code = await createInvite(inviteRole);
      setInviteCode(code);
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
        <Select value={inviteRole} onValueChange={setInviteRole}>
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
      <Button onClick={handleGenerateInvite} disabled={loading}>
        {loading ? "Génération..." : "Générer le code d'invitation"}
      </Button>
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