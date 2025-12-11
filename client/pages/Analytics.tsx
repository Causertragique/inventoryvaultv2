import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useI18n } from "@/contexts/I18nContext";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firestore";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Lightbulb,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Eye,
  UtensilsCrossed,
  RefreshCw,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SalesPrediction {
  date: string;
  predictedRevenue: number;
  confidence: number;
}

interface Insight {
  type: string;
  title: string;
  value: string;
  trend: "positive" | "negative" | "neutral" | "warning";
  description: string;
}

type AITool = 
  | "insights"
  | "sales-prediction"
  | "food-wine-pairing"
  | "sales-report";

export default function Analytics() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<AITool>("insights");
  const [salesPrediction, setSalesPrediction] = useState<{
    topSellers: Array<{
      product: string;
      category: string;
      reason: string;
      estimatedDailyUnits: number;
      estimatedUnitPrice: number;
      estimatedDailyRevenue: number;
      profitMargin: number;
      region: string;
    }>;
    totalPotentialWeeklyRevenue: number;
    regionInsight: string;
    region: string;
  } | null>(null);
  const [insights, setInsights] = useState<{
    metrics?: Array<{
      name: string;
      value: string | number;
      trend: 'positive' | 'negative' | 'neutral' | 'warning';
      description: string;
    }>;
    comparatives?: {
      weekly?: string;
      monthly?: string;
      yearly?: string;
    };
    summary?: any;
  } | null>(null);
  const [foodWinePairing, setFoodWinePairing] = useState<any>(null);
  const [salesReport, setSalesReport] = useState<any>(null);
    // États de chargement individuels pour chaque outil
  const [loadingTools, setLoadingTools] = useState<Record<AITool, boolean>>({
    "insights": false,
    "sales-prediction": false,
    "food-wine-pairing": false,
    "sales-report": false,
  });

  // États d'erreur pour chaque outil
  const [errors, setErrors] = useState<Record<AITool, string | null>>({
    "insights": null,
    "sales-prediction": null,
    "food-wine-pairing": null,
    "sales-report": null,
  });

  // Clé de stockage avec le userId pour isolation par utilisateur
  const getStorageKey = (tool: AITool) => {
    const userId = localStorage.getItem("bartender-user-id") || "default";
    return `analytics-cache-${userId}-${tool}`;
  };

  // Sauvegarder les résultats dans localStorage
  const saveToCache = (tool: AITool, data: any) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(getStorageKey(tool), JSON.stringify(cacheData));
      console.log(`[Analytics] Cache sauvegardé pour ${tool}`);
    } catch (error) {
      console.warn(`[Analytics] Impossible de sauvegarder le cache pour ${tool}:`, error);
    }
  };

  // Charger les résultats depuis localStorage
  const loadFromCache = (tool: AITool) => {
    try {
      const cached = localStorage.getItem(getStorageKey(tool));
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        console.log(`[Analytics] Cache chargé pour ${tool}, timestamp:`, new Date(timestamp));
        return data;
      }
    } catch (error) {
      console.warn(`[Analytics] Impossible de charger le cache pour ${tool}:`, error);
    }
    return null;
  };

  // Nettoyer tout le cache (appelé à la déconnexion)
  const clearAllCache = () => {
    const userId = localStorage.getItem("bartender-user-id") || "default";
    const tools: AITool[] = [
      "insights", "sales-prediction", "food-wine-pairing"
    ];
    tools.forEach(tool => {
      localStorage.removeItem(`analytics-cache-${userId}-${tool}`);
    });
    console.log("[Analytics] Cache nettoyé pour tous les outils");
  };

  // Restaurer les données au chargement du composant
  useEffect(() => {
    const cachedInsights = loadFromCache("insights");
    if (cachedInsights) setInsights(cachedInsights);
    
    const cachedSalesPrediction = loadFromCache("sales-prediction");
    if (cachedSalesPrediction) setSalesPrediction(cachedSalesPrediction);
    
    const cachedFoodWine = loadFromCache("food-wine-pairing");
    if (cachedFoodWine) setFoodWinePairing(cachedFoodWine);
    
    const cachedSalesReport = loadFromCache("sales-report");
    if (cachedSalesReport) setSalesReport(cachedSalesReport);
    
    console.log("[Analytics] Données restaurées depuis le cache");
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem("bartender-auth");
  };

  const getHeaders = (): HeadersInit => {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
    const token = getAuthToken();
    console.log("[Analytics] Token présent:", !!token);
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        const username = localStorage.getItem("bartender-username");
        const userId = localStorage.getItem("bartender-user-id");
        if (username) {
          headers["x-username"] = username;
        }
        if (userId) {
          headers["x-user-id"] = userId;
        }
      }
    console.log("[Analytics] Headers:", Object.keys(headers));
    return headers;
  };

  // Fonctions pour déclencher chaque appel API
  const fetchSalesPrediction = async () => {
    console.log("[Analytics] fetchSalesPrediction appelé");
    setLoadingTools(prev => ({ ...prev, "sales-prediction": true }));
    setErrors(prev => ({ ...prev, "sales-prediction": null }));
    try {
      if (!db) {
        setErrors(prev => ({ ...prev, "sales-prediction": "Firestore non initialisé" }));
        return;
      }

      const userId = localStorage.getItem("bartender-user-id");
      if (!userId) {
        setErrors(prev => ({ ...prev, "sales-prediction": "Utilisateur non connecté" }));
        return;
      }

      // Récupérer les produits/inventaire
      const productsRef = collection(db, `users/${userId}/products`);
      const productsSnapshot = await getDocs(productsRef);
      const inventory = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Récupérer le profil complet du bar depuis localStorage
      let barProfile: any = {};
      const settingsStr = localStorage.getItem("bartender-settings");
      if (settingsStr) {
        try {
          barProfile = JSON.parse(settingsStr);
        } catch (error) {
          console.error("[Analytics] Erreur parsing settings:", error);
        }
      }

      const region = barProfile?.taxRegion || "quebec";
      console.log("[Analytics] Envoi requête POST à /api/analytics/sales-prediction avec région:", region, "profil:", barProfile?.barName);
      const res = await fetch("/api/analytics/sales-prediction", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          inventory,
          barProfile,
          region
        })
      });
      console.log("[Analytics] Réponse reçue:", res.status, res.ok);
      if (res.ok) {
        const data = await res.json();
        if (data && data.topSellers && data.topSellers.length > 0) {
          setSalesPrediction(data);
          saveToCache("sales-prediction", data);
        } else {
          setErrors(prev => ({ ...prev, "sales-prediction": "Aucune donnée générée. Vérifiez que vous avez des produits dans votre inventaire." }));
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: `Erreur ${res.status} du serveur` }));
        console.error("[Analytics] Erreur serveur:", errorData);
        setErrors(prev => ({ ...prev, "sales-prediction": errorData.error || errorData.message || `Erreur ${res.status} lors de la génération` }));
      }
    } catch (error: any) {
      console.error("Error fetching sales prediction:", error);
      setErrors(prev => ({ ...prev, "sales-prediction": error.message || "Erreur de connexion" }));
    } finally {
      setLoadingTools(prev => ({ ...prev, "sales-prediction": false }));
    }
  };

  const fetchInsights = async () => {
    console.log("[Analytics] fetchInsights appelé");
    setLoadingTools(prev => ({ ...prev, "insights": true }));
    setErrors(prev => ({ ...prev, "insights": null }));
    try {
      if (!db) {
        setErrors(prev => ({ ...prev, "insights": "Firestore non initialisé" }));
        return;
      }

      const userId = localStorage.getItem("bartender-user-id");
      if (!userId) {
        setErrors(prev => ({ ...prev, "insights": "Utilisateur non connecté" }));
        return;
      }

      // Récupérer les ventes récentes depuis Firestore
      console.log("[Analytics] Récupération des ventes depuis Firestore...");
      const salesRef = collection(db, `users/${userId}/sales`);
      const salesQuery = query(salesRef, orderBy("timestamp", "desc"), limit(100));
      const salesSnapshot = await getDocs(salesQuery);
      const sales = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (sales.length === 0) {
        setErrors(prev => ({ ...prev, "insights": "Aucune vente enregistrée. Ajoutez des ventes pour générer des insights." }));
        return;
      }

      // Récupérer les produits/inventaire
      const productsRef = collection(db, `users/${userId}/products`);
      const productsSnapshot = await getDocs(productsRef);
      const inventory = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log("[Analytics] Envoi requête à /api/analytics/insights avec", sales.length, "ventes et", inventory.length, "produits");
      const res = await fetch("/api/analytics/insights", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          sales,
          inventory,
          barProfile: {} // TODO: récupérer le profil du bar depuis Firestore
        })
      });
      console.log("[Analytics] Réponse reçue:", res.status, res.ok);
      if (res.ok) {
        const data = await res.json();
        console.log("[Analytics] Données reçues:", data);
        console.log("[Analytics] Structure:", { hasMetrics: !!data.metrics, metricsLength: data.metrics?.length, hasInsights: !!data.insights });
        if (data && (data.metrics || data.insights) && (data.metrics?.length > 0 || data.insights?.length > 0)) {
          setInsights(data);
          saveToCache("insights", data);
          console.log("[Analytics] Insights sauvegardés, state mis à jour");
        } else {
          console.log("[Analytics] Pas de métriques/insights trouvées");
          setErrors(prev => ({ ...prev, "insights": "Aucun insight généré. Vérifiez que votre clé OpenAI est configurée." }));
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: `Erreur ${res.status} du serveur` }));
        console.error("[Analytics] Erreur serveur:", errorData);
        setErrors(prev => ({ ...prev, "insights": errorData.error || errorData.message || `Erreur ${res.status} lors de la génération` }));
      }
    } catch (error: any) {
      console.error("Error fetching insights:", error);
      setErrors(prev => ({ ...prev, "insights": error.message || "Erreur de connexion" }));
    } finally {
      setLoadingTools(prev => ({ ...prev, "insights": false }));
    }
  };

  const fetchFoodWinePairing = async () => {
    console.log("[Analytics] fetchFoodWinePairing appelé");
    setLoadingTools(prev => ({ ...prev, "food-wine-pairing": true }));
    setErrors(prev => ({ ...prev, "food-wine-pairing": null }));
    try {
      if (!db) {
        setErrors(prev => ({ ...prev, "food-wine-pairing": "Firestore non initialisé" }));
        return;
      }

      const userId = localStorage.getItem("bartender-user-id");
      if (!userId) {
        setErrors(prev => ({ ...prev, "food-wine-pairing": "Utilisateur non connecté" }));
        return;
      }

      // Récupérer les produits (vins) de l'inventaire
      const productsRef = collection(db, `users/${userId}/products`);
      const productsSnapshot = await getDocs(productsRef);
      const wines = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (wines.length === 0) {
        setErrors(prev => ({ ...prev, "food-wine-pairing": "Aucun produit (vin) trouvé dans votre inventaire. Ajoutez des vins pour générer des accords mets-vins." }));
        return;
      }

      // Récupérer le profil complet du bar depuis localStorage
      let barProfile: any = {};
      const settingsStr = localStorage.getItem("bartender-settings");
      if (settingsStr) {
        try {
          barProfile = JSON.parse(settingsStr);
        } catch (error) {
          console.error("[Analytics] Erreur parsing settings:", error);
        }
      }

      console.log("[Analytics] Envoi requête POST à /api/analytics/food-wine-pairing avec", wines.length, "vins");
      const res = await fetch("/api/analytics/food-wine-pairing", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          wines,
          barProfile
        })
      });
      console.log("[Analytics] Réponse reçue:", res.status, res.ok);
      if (res.ok) {
        const data = await res.json();
        if (data && data.pairings && data.pairings.length > 0) {
          setFoodWinePairing(data);
          saveToCache("food-wine-pairing", data);
        } else {
          setErrors(prev => ({ ...prev, "food-wine-pairing": "Aucun accord généré. Vérifiez que votre clé OpenAI est configurée dans .env" }));
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: `Erreur ${res.status} du serveur` }));
        console.error("[Analytics] Erreur serveur:", errorData);
        setErrors(prev => ({ ...prev, "food-wine-pairing": errorData.error || errorData.message || `Erreur ${res.status} lors de la génération` }));
        }
    } catch (error: any) {
      console.error("Error fetching food-wine pairing:", error);
      setErrors(prev => ({ ...prev, "food-wine-pairing": error.message || "Erreur de connexion" }));
    } finally {
      setLoadingTools(prev => ({ ...prev, "food-wine-pairing": false }));
    }
  };

  const fetchSalesReport = async () => {
    console.log("[Analytics] fetchSalesReport appelé");
    setLoadingTools(prev => ({ ...prev, "sales-report": true }));
    setErrors(prev => ({ ...prev, "sales-report": null }));
    try {
      if (!db) {
        setErrors(prev => ({ ...prev, "sales-report": "Firestore non initialisé" }));
        return;
      }

      const userId = localStorage.getItem("bartender-user-id");
      if (!userId) {
        setErrors(prev => ({ ...prev, "sales-report": "Utilisateur non connecté" }));
        return;
      }

      // Récupérer toutes les ventes depuis Firestore
      const salesRef = collection(db, `users/${userId}/sales`);
      const salesQuery = query(salesRef, orderBy("timestamp", "desc"));
      const salesSnapshot = await getDocs(salesQuery);
      const sales = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (sales.length === 0) {
        setErrors(prev => ({ ...prev, "sales-report": "Aucune vente enregistrée." }));
        return;
      }

      // Récupérer les produits/inventaire
      const productsRef = collection(db, `users/${userId}/products`);
      const productsSnapshot = await getDocs(productsRef);
      const inventory = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Construire le rapport
      const report = generateSalesReport(sales, inventory);
      setSalesReport(report);
      saveToCache("sales-report", report);
    } catch (error: any) {
      console.error("Error fetching sales report:", error);
      setErrors(prev => ({ ...prev, "sales-report": error.message || "Erreur de connexion" }));
    } finally {
      setLoadingTools(prev => ({ ...prev, "sales-report": false }));
    }
  };

  const formatPaymentMethod = (sale: any): string => {
    const method = sale.paymentMethod?.toLowerCase() || "unknown";
    
    if (method === "cash") return "Espèce";
    if (method === "card") {
      if (sale.cardType === "debit") return "Carte débit";
      if (sale.cardType === "credit") return "Carte crédit";
      return "Carte";
    }
    if (method === "stripe") return "Stripe";
    if (method === "other") return "Autre";
    
    return "Inconnu";
  };

  // Fonction pour générer le rapport détaillé
  const generateSalesReport = (sales: any[], inventory: any[]) => {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum: number, sale: any) => sum + (Number(sale.total) || 0), 0);
    const totalTips = sales.reduce((sum: number, sale: any) => sum + (Number(sale.tip) || 0), 0);
    
    // Calculer les taxes correctement
    let totalTax = 0;
    let totalTPS = 0;
    let totalTVQ = 0;
    sales.forEach((sale: any) => {
      if (sale.breakdown) {
        // Si les taxes sont détaillées dans breakdown
        const tps = Number(sale.breakdown.tps) || 0;
        const tvq = Number(sale.breakdown.tvq) || 0;
        totalTPS += tps;
        totalTVQ += tvq;
        totalTax += tps + tvq;
      } else if (sale.tax) {
        // Sinon utiliser le champ tax (singulier)
        totalTax += Number(sale.tax) || 0;
      } else if (sale.taxes) {
        // Ou taxes (pluriel)
        totalTax += Number(sale.taxes) || 0;
      }
    });

    // Détail complet de chaque vente avec ses produits
    const detailedSales = sales.map((sale: any) => {
      const saleItems = (sale.items || []).map((item: any) => {
        const product = inventory.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: product?.name || item.name || item.productName || "Produit inconnu",
          category: item.category || product?.category || "other",
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.price) || 0,
          totalPrice: (Number(item.price) || 0) * (Number(item.quantity) || 1),
        };
      });

      let saleTax = 0;
      let saleTPS = 0;
      let saleTVQ = 0;
      
      if (sale.breakdown) {
        saleTPS = Number(sale.breakdown.tps) || 0;
        saleTVQ = Number(sale.breakdown.tvq) || 0;
        saleTax = saleTPS + saleTVQ;
      } else if (sale.tax) {
        saleTax = Number(sale.tax) || 0;
      } else if (sale.taxes) {
        saleTax = Number(sale.taxes) || 0;
      }

      return {
        id: sale.id,
        timestamp: sale.timestamp?.toDate?.() || sale.timestamp || new Date(),
        items: saleItems,
        subtotal: saleItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0),
        taxes: saleTax,
        tps: saleTPS,
        tvq: saleTVQ,
        tip: Number(sale.tip) || 0,
        total: Number(sale.total) || 0,
        paymentMethod: sale.paymentMethod || "Unknown",
        cardType: sale.cardType,
        breakdown: sale.breakdown || {},
      };
    });

    const averageSaleValue = totalRevenue / totalSales;
    const avgTipPercentage = totalSales > 0 ? (totalTips / totalRevenue) * 100 : 0;

    return {
      totalSales,
      totalRevenue,
      totalTips,
      totalTax,
      totalTPS,
      totalTVQ,
      averageSaleValue,
      avgTipPercentage,
      detailedSales: detailedSales.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    };
  };

  // Mapping des fonctions de fetch par outil
  const fetchFunctions: Record<AITool, () => Promise<void>> = {
    "insights": fetchInsights,
    "sales-prediction": fetchSalesPrediction,
    "food-wine-pairing": fetchFoodWinePairing,
    "sales-report": fetchSalesReport,
  };

  // Vérifier que toutes les fonctions sont définies
  console.log("[Analytics] Fonctions disponibles:", Object.keys(fetchFunctions));

  // Composant helper pour afficher un état vide avec bouton
  const EmptyStateWithButton = ({ 
    icon: Icon, 
    message, 
    toolId, 
    buttonLabel 
  }: { 
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; 
    message: string; 
    toolId: AITool; 
    buttonLabel: string;
  }) => (
    <Card className="border-2 border-foreground/20">
      <CardContent className="py-12 text-center">
        <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground mb-4">{message}</p>
        <Button onClick={() => {
          console.log("[Analytics] Bouton cliqué pour:", toolId);
          console.log("[Analytics] Fonction disponible:", !!fetchFunctions[toolId]);
          if (fetchFunctions[toolId]) {
            try {
              fetchFunctions[toolId]();
            } catch (error) {
              console.error("[Analytics] Erreur lors de l'appel de la fonction:", error);
              setErrors(prev => ({ ...prev, [toolId]: "Erreur lors de l'appel de la fonction" }));
            }
          } else {
            console.error("[Analytics] Fonction non trouvée pour:", toolId);
            setErrors(prev => ({ ...prev, [toolId]: "Fonction non disponible" }));
          }
        }} disabled={loadingTools[toolId]}>
          {loadingTools[toolId] ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Génération...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {buttonLabel}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const RefreshButton = ({ toolId }: { toolId: AITool }) => (
    <div className="flex justify-end mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (fetchFunctions[toolId]) {
            fetchFunctions[toolId]();
          }
        }}
        disabled={loadingTools[toolId]}
      >
        <RefreshCw className={cn("h-4 w-4 mr-2", loadingTools[toolId] && "animate-spin")} />
        Régénérer
      </Button>
    </div>
  );

  const getTrendLabel = (trend: string): string => {
    if (trend === "positive") return "↑ Positif";
    if (trend === "negative") return "↓ Négatif";
    if (trend === "warning") return "⚠ Attention";
    if (trend === "neutral") return "→ Neutre";
    return trend;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "positive") return <TrendingUp className="h-4 w-4" />;
    if (trend === "negative") return <TrendingDown className="h-4 w-4" />;
    if (trend === "warning") return <AlertTriangle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const aiTools: Array<{ id: AITool; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = [
    { id: "insights", label: "Insights généraux", icon: Eye },
    { id: "sales-prediction", label: "Meilleurs vendeurs", icon: TrendingUp },
    { id: "food-wine-pairing", label: "Accord mets-vin", icon: UtensilsCrossed },
    { id: "sales-report", label: "Rapport de ventes", icon: BarChart3 },
  ];

  return (
    <Layout>
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <div
          className={cn(
            "bg-card rounded-lg flex flex-col flex-shrink-0",
            "h-fit", // S'adapte à la hauteur du contenu
            "w-64"
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b-2 border-foreground/20">
            <div className="flex items-center gap-2 mt-2">
              <Brain className="h-7 w-7 text-primary" />
              <h2 className="text-2xl sm:text-2xl font-bold text-foreground">Outils IA</h2>
              </div>
        </div>

          {/* Tools List */}
          <div className="p-2 border-b-2 border-foreground/20">
            <div className="space-y-1">
              {aiTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setSelectedTool(tool.id);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                    selectedTool === tool.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  <tool.icon className="h-4 w-4" />
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
          </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pt-16">

          {selectedTool === "insights" ? (
            <>
              {/* Insights Cards */}
              {errors["insights"] ? (
                <Card className="border-2 border-destructive/50 bg-destructive/5">
                  <CardContent className="py-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-semibold mb-2">Erreur lors de la génération</p>
                    <p className="text-muted-foreground text-sm mb-4">{errors["insights"]}</p>
                    <Button 
                      onClick={() => {
                        setErrors(prev => ({ ...prev, "insights": null }));
                        fetchInsights();
                      }} 
                      disabled={loadingTools["insights"]}
                      variant="outline"
                    >
                      {loadingTools["insights"] ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Réessai en cours...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Réessayer
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : !insights ? (
                <Card className="border-2 border-foreground/20">
                  <CardContent className="py-12 text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      Générez des insights intelligents basés sur vos données de vente.
                    </p>
                    <Button onClick={() => {
                      console.log("[Analytics] Bouton insights cliqué directement");
                      fetchInsights();
                    }} disabled={loadingTools["insights"]}>
                      {loadingTools["insights"] ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Générer des insights
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : insights && insights.metrics && insights.metrics.length > 0 ? (
                <>
                  {console.log("[Analytics] Affichage des métriques, count:", insights.metrics?.length)}
                  <RefreshButton toolId="insights" />
                  
                  {/* Tableau des métriques */}
                  <div className="overflow-x-auto border border-foreground/20 rounded-lg mb-6">
                    <table className="w-full text-sm">
                      <thead className="bg-foreground/5 border-b border-foreground/20">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Métrique</th>
                          <th className="px-4 py-3 text-left font-semibold">Valeur</th>
                          <th className="px-4 py-3 text-left font-semibold">Tendance</th>
                          <th className="px-4 py-3 text-left font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {insights.metrics.map((metric, index) => (
                          <tr key={index} className="border-b border-foreground/10 hover:bg-foreground/5">
                            <td className="px-4 py-3 font-semibold text-foreground">{metric.name}</td>
                            <td className={cn(
                              "px-4 py-3 font-bold text-base",
                              metric.trend === "positive" && "text-green-600 dark:text-green-400",
                              metric.trend === "negative" && "text-red-600 dark:text-red-400",
                              metric.trend === "warning" && "text-orange-600 dark:text-orange-400",
                              metric.trend === "neutral" && "text-foreground"
                            )}>
                              {metric.value}
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                                metric.trend === "positive" && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
                                metric.trend === "negative" && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
                                metric.trend === "warning" && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
                                metric.trend === "neutral" && "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"
                              )}>
                                {getTrendLabel(metric.trend)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{metric.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Summary Section si disponible */}
                  {insights.summary && (
                    <Card className="border-2 border-primary/20 bg-primary/5 mt-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-primary" />
                          Résumé de l'analyse
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {insights.summary.totalSalesAnalyzed && (
                          <p className="text-sm text-foreground">
                            <span className="font-semibold">Ventes analysées:</span> {insights.summary.totalSalesAnalyzed}
                          </p>
                        )}
                        {insights.summary.topCategory && (
                          <p className="text-sm text-foreground">
                            <span className="font-semibold">Produit vedette:</span> {insights.summary.topCategory}
                          </p>
                        )}
                        {insights.summary.keyRecommendation && (
                          <p className="text-sm text-foreground leading-relaxed">
                            <span className="font-semibold">Recommandation clé:</span> {insights.summary.keyRecommendation}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Comparatives Section si disponible */}
                  {insights.comparatives && (
                    <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 mt-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                          📊 Comparatifs
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {insights.comparatives.weekly && (
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-2">Hebdomadaire:</p>
                            <pre className="text-xs bg-foreground/5 p-2 rounded overflow-auto max-h-32 text-foreground/70">
                              {insights.comparatives.weekly}
                            </pre>
                          </div>
                        )}
                        {insights.comparatives.monthly && (
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-2">Mensuel:</p>
                            <pre className="text-xs bg-foreground/5 p-2 rounded overflow-auto max-h-32 text-foreground/70">
                              {insights.comparatives.monthly}
                            </pre>
                          </div>
                        )}
                        {insights.comparatives.yearly && (
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-2">Annuel:</p>
                            <pre className="text-xs bg-foreground/5 p-2 rounded overflow-auto max-h-32 text-foreground/70">
                              {insights.comparatives.yearly}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                </>
              ) : (
                <Card className="border-2 border-foreground/20">
                  <CardContent className="py-12 text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-2">
                      Pas encore de données d'analyse disponibles.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Les insights IA apparaîtront après quelques ventes.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : selectedTool === "sales-prediction" ? (
            <>
              {/* Sales Prediction */}
              {errors["sales-prediction"] ? (
                <Card className="border-2 border-destructive/50 bg-destructive/5">
                  <CardContent className="py-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-semibold mb-2">Erreur lors de l'analyse</p>
                    <p className="text-muted-foreground text-sm mb-4">{errors["sales-prediction"]}</p>
                    <Button 
                      onClick={() => {
                        setErrors(prev => ({ ...prev, "sales-prediction": null }));
                        fetchSalesPrediction();
                      }} 
                      disabled={loadingTools["sales-prediction"]}
                      variant="outline"
                    >
                      {loadingTools["sales-prediction"] ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Réessai en cours...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Réessayer
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : !salesPrediction ? (
                <EmptyStateWithButton
                  icon={TrendingUp}
                  message="Cliquez sur le bouton pour analyser les meilleurs vendeurs."
                  toolId="sales-prediction"
                  buttonLabel="Analyser les ventes"
                />
              ) : (
                <>
                  <RefreshButton toolId="sales-prediction" />
                  <div className="space-y-4">
                    <Card className="border-2 border-foreground/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          Meilleurs vendeurs par région
                          {salesPrediction.region && (
                            <span className="text-sm font-normal text-muted-foreground">
                              • {salesPrediction.region}
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Revenu prévu hebdomadaire */}
                          <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                            <div className="text-sm text-muted-foreground">
                              Revenu prévu (7 jours)
                            </div>
                            <div className="text-3xl font-bold text-foreground mt-1">
                              ${(salesPrediction.totalPotentialWeeklyRevenue || 0).toFixed(2)}
                            </div>
                            {salesPrediction.regionInsight && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {salesPrediction.regionInsight}
                              </p>
                            )}
                          </div>

                          {/* Liste des meilleurs vendeurs */}
                          {salesPrediction.topSellers && salesPrediction.topSellers.length > 0 && (
                            <div className="space-y-3">
                              {salesPrediction.topSellers.map((seller, index) => (
                                <div
                                  key={index}
                                  className="flex items-start justify-between p-4 bg-secondary/30 rounded-lg border border-foreground/10"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="font-semibold text-foreground text-lg">
                                        {seller.product}
                                      </div>
                                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                                        {seller.category}
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-3">
                                      {seller.reason}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Unités/jour:</span>
                                        <div className="font-semibold">
                                          {seller.estimatedDailyUnits}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Prix unitaire:</span>
                                        <div className="font-semibold">
                                          ${seller.estimatedUnitPrice.toFixed(2)}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Revenu/jour:</span>
                                        <div className="font-semibold text-green-600 dark:text-green-400">
                                          ${seller.estimatedDailyRevenue.toFixed(2)}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Marge:</span>
                                        <div className="font-semibold">
                                          {seller.profitMargin}%
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </>
          ) : selectedTool === "food-wine-pairing" ? (
            <>
              {/* Food-Wine Pairing */}
              {errors["food-wine-pairing"] ? (
                <Card className="border-2 border-destructive/50 bg-destructive/5">
                  <CardContent className="py-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-semibold mb-2">Erreur lors de la génération</p>
                    <p className="text-muted-foreground text-sm mb-4">{errors["food-wine-pairing"]}</p>
                    <Button 
                      onClick={() => {
                        setErrors(prev => ({ ...prev, "food-wine-pairing": null }));
                        fetchFoodWinePairing();
                      }} 
                      disabled={loadingTools["food-wine-pairing"]}
                      variant="outline"
                    >
                      {loadingTools["food-wine-pairing"] ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Réessai en cours...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Réessayer
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : !foodWinePairing || !foodWinePairing.pairings || foodWinePairing.pairings.length === 0 ? (
                <EmptyStateWithButton
                  icon={UtensilsCrossed}
                  message="Cliquez sur le bouton pour générer des accords mets-vin."
                  toolId="food-wine-pairing"
                  buttonLabel="Générer des accords"
                />
              ) : (
                <>
                  <RefreshButton toolId="food-wine-pairing" />
                  <Card className="border-2 border-foreground/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UtensilsCrossed className="h-5 w-5 text-primary" />
                        Accord mets-vin
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {foodWinePairing.pairings.slice(0, 5).map((pairing: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 bg-secondary/30 rounded-lg border-2 border-foreground/10"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-foreground">{pairing.food || pairing.dish}</div>
                              <div className="text-sm text-primary font-medium">{pairing.wine || pairing.recommendedWine}</div>
                            </div>
                            {pairing.reason && (
                              <div className="text-sm text-muted-foreground">{pairing.reason}</div>
                            )}
                            {pairing.description && (
                              <div className="text-xs text-muted-foreground mt-1">{pairing.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          ) : selectedTool === "sales-report" ? (
            <>
              {/* Sales Report */}
              {errors["sales-report"] ? (
                <Card className="border-2 border-destructive/50 bg-destructive/5">
                  <CardContent className="py-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-semibold mb-2">Erreur lors de la génération</p>
                    <p className="text-muted-foreground text-sm mb-4">{errors["sales-report"]}</p>
                    <Button 
                      onClick={() => {
                        setErrors(prev => ({ ...prev, "sales-report": null }));
                        fetchSalesReport();
                      }} 
                      disabled={loadingTools["sales-report"]}
                      variant="outline"
                    >
                      {loadingTools["sales-report"] ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Chargement...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Réessayer
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : !salesReport ? (
                <EmptyStateWithButton
                  icon={BarChart3}
                  message="Cliquez sur le bouton pour générer un rapport détaillé de ventes."
                  toolId="sales-report"
                  buttonLabel="Générer le rapport"
                />
              ) : (
                <>
                  <RefreshButton toolId="sales-report" />
                  <div className="space-y-4">
                    {/* Statistiques principales */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                      <Card className="border-2 border-foreground/20">
                        <CardContent className="pt-6">
                          <div className="text-xs text-muted-foreground mb-1">Total de ventes</div>
                          <div className="text-2xl font-bold text-foreground">{salesReport.totalSales}</div>
                        </CardContent>
                      </Card>
                      <Card className="border-2 border-foreground/20">
                        <CardContent className="pt-6">
                          <div className="text-xs text-muted-foreground mb-1">Revenu total</div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ${salesReport.totalRevenue?.toFixed(2) || "0.00"}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-2 border-foreground/20">
                        <CardContent className="pt-6">
                          <div className="text-xs text-muted-foreground mb-1">TPS</div>
                          <div className="text-2xl font-bold text-foreground">${salesReport.totalTPS?.toFixed(2) || "0.00"}</div>
                        </CardContent>
                      </Card>
                      <Card className="border-2 border-foreground/20">
                        <CardContent className="pt-6">
                          <div className="text-xs text-muted-foreground mb-1">TVQ</div>
                          <div className="text-2xl font-bold text-foreground">${salesReport.totalTVQ?.toFixed(2) || "0.00"}</div>
                        </CardContent>
                      </Card>
                      <Card className="border-2 border-foreground/20">
                        <CardContent className="pt-6">
                          <div className="text-xs text-muted-foreground mb-1">Pourboires</div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">${salesReport.totalTips?.toFixed(2) || "0.00"}</div>
                        </CardContent>
                      </Card>
                      <Card className="border-2 border-foreground/20">
                        <CardContent className="pt-6">
                          <div className="text-xs text-muted-foreground mb-1">Valeur moyenne</div>
                          <div className="text-2xl font-bold text-foreground">${salesReport.averageSaleValue?.toFixed(2) || "0.00"}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Détail des ventes - Format Tableau */}
                    <Card className="border-2 border-foreground/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          Détail des ventes ({salesReport.detailedSales?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b-2 border-foreground/20 bg-secondary/50">
                                <th className="text-left px-4 py-3 font-semibold text-foreground">Heure</th>
                                <th className="text-left px-4 py-3 font-semibold text-foreground">Produit</th>
                                <th className="text-right px-4 py-3 font-semibold text-foreground">Quantité</th>
                                <th className="text-right px-4 py-3 font-semibold text-foreground">Prix unitaire</th>
                                <th className="text-right px-4 py-3 font-semibold text-foreground">Sous-total</th>
                                <th className="text-right px-4 py-3 font-semibold text-foreground">TPS</th>
                                <th className="text-right px-4 py-3 font-semibold text-foreground">TVQ</th>
                                <th className="text-right px-4 py-3 font-semibold text-foreground">Pourboire</th>
                                <th className="text-right px-4 py-3 font-semibold text-foreground">Total</th>
                                <th className="text-left px-4 py-3 font-semibold text-foreground">Paiement</th>
                              </tr>
                            </thead>
                            <tbody>
                              {salesReport.detailedSales && salesReport.detailedSales.map((sale: any, saleIndex: number) => {
                                const saleDate = new Date(sale.timestamp).toLocaleString('fr-FR', {
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });

                                return sale.items && sale.items.length > 0 ? (
                                  sale.items.map((item: any, itemIndex: number) => (
                                    <tr 
                                      key={`${saleIndex}-${itemIndex}`}
                                      className={`border-b border-foreground/10 hover:bg-secondary/30 transition ${itemIndex === 0 ? 'bg-secondary/10' : ''}`}
                                    >
                                      {itemIndex === 0 ? (
                                        <>
                                          <td className="px-4 py-3 text-muted-foreground font-medium">{saleDate}</td>
                                          <td className="px-4 py-3 text-foreground">{item.productName}</td>
                                          <td className="px-4 py-3 text-right text-foreground">{item.quantity}</td>
                                          <td className="px-4 py-3 text-right text-foreground">${item.unitPrice.toFixed(2)}</td>
                                          <td className="px-4 py-3 text-right text-foreground">${item.totalPrice.toFixed(2)}</td>
                                          <td className="px-4 py-3 text-right font-semibold text-foreground">${sale.tps?.toFixed(2) || "0.00"}</td>
                                          <td className="px-4 py-3 text-right font-semibold text-foreground">${sale.tvq?.toFixed(2) || "0.00"}</td>
                                          <td className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">${sale.tip?.toFixed(2) || "0.00"}</td>
                                          <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">${sale.total?.toFixed(2) || "0.00"}</td>
                                          <td className="px-4 py-3 text-foreground">{formatPaymentMethod(sale)}</td>
                                        </>
                                      ) : (
                                        <>
                                          <td colSpan={1}></td>
                                          <td className="px-4 py-3 text-foreground">{item.productName}</td>
                                          <td className="px-4 py-3 text-right text-foreground">{item.quantity}</td>
                                          <td className="px-4 py-3 text-right text-foreground">${item.unitPrice.toFixed(2)}</td>
                                          <td className="px-4 py-3 text-right text-foreground">${item.totalPrice.toFixed(2)}</td>
                                          <td colSpan={5}></td>
                                        </>
                                      )}
                                    </tr>
                                  ))
                                ) : (
                                  <tr key={saleIndex} className="border-b border-foreground/10 bg-secondary/10 hover:bg-secondary/30 transition">
                                    <td className="px-4 py-3 text-muted-foreground font-medium">{saleDate}</td>
                                    <td colSpan={4} className="px-4 py-3 text-muted-foreground italic">Aucun produit</td>
                                    <td className="px-4 py-3 text-right font-semibold text-foreground">${sale.tps?.toFixed(2) || "0.00"}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-foreground">${sale.tvq?.toFixed(2) || "0.00"}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">${sale.tip?.toFixed(2) || "0.00"}</td>
                                    <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">${sale.total?.toFixed(2) || "0.00"}</td>
                                    <td className="px-4 py-3 text-foreground">{formatPaymentMethod(sale)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Sélectionnez un outil IA dans la barre latérale
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

