import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, User, Clock, Package, TrendingUp, TrendingDown } from "lucide-react";
import { getRecentInventoryLogs, generateAuditReport } from "@/lib/audit";
import { getUserPermissions, getCurrentUserRole, ROLE_LABELS } from "@/lib/permissions";
import { FirestoreInventoryLog } from "@shared/firestore-schema";
import { useI18n } from "@/contexts/I18nContext";

export default function AuditLogs() {
  const { t, language } = useI18n();
  const [logs, setLogs] = useState<FirestoreInventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const userRole = getCurrentUserRole();
  const permissions = getUserPermissions(userRole);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const auditLogs = await getRecentInventoryLogs(200);
      setLogs(auditLogs);
      setReport(generateAuditReport(auditLogs));
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!permissions.canViewAuditLogs) {
    return (
      <Layout>
        <div className="container mx-auto p-6 max-w-7xl">
          <Card className="border-2 border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-destructive" />
                <CardTitle>{t.auditLogs.accessDenied}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t.auditLogs.accessDeniedDesc}
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create": return <Package className="h-4 w-4 text-green-600" />;
      case "update": return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "delete": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "restock": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "adjustment": return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case "sale": return <CheckCircle className="h-4 w-4 text-purple-600" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: t.auditLogs.actions.create,
      update: t.auditLogs.actions.update,
      delete: t.auditLogs.actions.delete,
      restock: t.auditLogs.actions.restock,
      adjustment: t.auditLogs.actions.adjustment,
      sale: t.auditLogs.actions.sale,
    };
    return labels[action] || action;
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "—";
    
    try {
      // Firestore Timestamp
      if (timestamp.toDate) {
        return new Date(timestamp.toDate()).toLocaleString();
      }
      // ISO String
      return new Date(timestamp).toLocaleString();
    } catch {
      return "—";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8" />
              {t.auditLogs.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t.auditLogs.subtitle}
            </p>
          </div>
          <Button onClick={loadAuditLogs} disabled={loading}>
            <Clock className="h-4 w-4 mr-2" />
            {loading ? "Chargement..." : "Actualiser"}
          </Button>
        </div>

        {/* Alertes de sécurité */}
        {report?.suspiciousActivity.suspicious && (
          <Card className="border-2 border-destructive bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-destructive">
                  {t.auditLogs.suspiciousActivity}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.suspiciousActivity.alerts.map((alert: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Statistiques */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t.auditLogs.totalChanges}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{report.totalChanges}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t.auditLogs.byAction}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {Object.entries(report.byAction).map(([action, count]: [string, any]) => (
                    <div key={action} className="flex justify-between">
                      <span>{getActionLabel(action)}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t.auditLogs.byRole}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {Object.entries(report.byRole).map(([role, count]: [string, any]) => (
                    <div key={role} className="flex justify-between">
                      <span>{ROLE_LABELS[role as keyof typeof ROLE_LABELS]?.[language] || role}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t.auditLogs.activeUsers}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{Object.keys(report.byUser).length}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Liste des logs */}
        <Card>
          <CardHeader>
            <CardTitle>{t.auditLogs.recentChanges}</CardTitle>
            <CardDescription>
              {logs.length} enregistrements récents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border-2 border-foreground/10 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getActionIcon(log.action)}</div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{log.productName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {getActionLabel(log.action)}
                            {log.difference !== undefined && (
                              <span className={log.difference > 0 ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
                                {log.difference > 0 ? "+" : ""}{log.difference}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {log.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ROLE_LABELS[log.userRole]?.[language] || log.userRole}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(log.timestamp)}
                        </span>
                        
                        {log.previousQuantity !== undefined && (
                          <span>
                            Quantité: {log.previousQuantity} → {log.newQuantity}
                          </span>
                        )}
                        
                        {log.previousPrice !== undefined && log.newPrice !== undefined && (
                          <span className="text-orange-600">
                            Prix: ${log.previousPrice} → ${log.newPrice}
                          </span>
                        )}
                      </div>

                      {log.reason && (
                        <p className="text-sm bg-secondary/50 p-2 rounded">
                          <strong>Raison:</strong> {log.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {logs.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun log d'audit disponible</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
