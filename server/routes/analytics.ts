import { RequestHandler } from 'express';
import { callOpenAIJSON } from '../services/openai';

// Fonction pour mapper les taxRegions à des régions géographiques lisibles
const mapTaxRegionToRegion = (taxRegion: string): string => {
  const regionMap: Record<string, string> = {
    // Canada - Provinces
    "quebec": "Quebec",
    "ontario": "Ontario",
    "british-columbia": "British Columbia",
    "alberta": "Alberta",
    "manitoba": "Manitoba",
    "saskatchewan": "Saskatchewan",
    "nova-scotia": "Nova Scotia",
    "new-brunswick": "New Brunswick",
    "newfoundland": "Newfoundland",
    "prince-edward-island": "Prince Edward Island",
    "northwest-territories": "Northwest Territories",
    "nunavut": "Nunavut",
    "yukon": "Yukon",
    // USA - States
    "new-york": "New York",
    "california": "California",
    "texas": "Texas",
    "florida": "Florida",
    "illinois": "Illinois",
    "nevada": "Nevada",
    "washington": "Washington",
    "oregon": "Oregon",
    "new-hampshire": "New Hampshire",
    "montana": "Montana",
    // Europe
    "france": "France",
    "spain": "Spain",
    "germany": "Germany",
    "italy": "Italy",
    "uk": "United Kingdom",
    "belgium": "Belgium",
    "netherlands": "Netherlands",
    "portugal": "Portugal",
    "sweden": "Sweden",
    "denmark": "Denmark",
    "poland": "Poland",
    // Latin America
    "mexico": "Mexico",
    "argentina": "Argentina",
    "chile": "Chile",
    "colombia": "Colombia",
    "peru": "Peru",
    "ecuador": "Ecuador",
    "uruguay": "Uruguay",
    "panama": "Panama",
    "dominican-republic": "Dominican Republic",
    // Other
    "australia": "Australia",
    "new-zealand": "New Zealand",
    "switzerland": "Switzerland",
  };
  
  return regionMap[taxRegion.toLowerCase()] || taxRegion || "Quebec";
};

// Implementation de getSalesPrediction pour obtenir les meilleurs produits à vendre pour augmenter CA
export const getSalesPrediction: RequestHandler = async (req, res) => {
  try {
    // Récupérer la région depuis le body (sent by client from barProfile.taxRegion)
    let region = req.body.region || (req.query.region as string) || "Quebec";
    // Mapper taxRegion (ex: "quebec") à région lisible (ex: "Quebec")
    if (region.includes("-") || region.length < 5) {
      region = mapTaxRegionToRegion(region);
    }
    const barProfile = req.body.barProfile || {}; // Profil du bar envoyé par le client
    // Construire le contexte complet du bar si disponible
    let barContext = "";
    if (barProfile && Object.keys(barProfile).length > 0) {
      const currencySymbols: Record<string, string> = {
        USD: "$", EUR: "€", GBP: "£", CAD: "$", AUD: "A$", MXN: "Mex$",
        ARS: "$", CLP: "$", COP: "$", PEN: "S/", UYU: "$U", NZD: "NZ$", CHF: "CHF",
      };
      
      const currency = currencySymbols[barProfile.currency] || barProfile.currency || "$";
      const yearsInBusiness = barProfile.yearsFounded ? new Date().getFullYear() - barProfile.yearsFounded : 0;
      
      barContext = `\n\n=== CONTEXTE COMPLET DE L'ÉTABLISSEMENT ===`;
      barContext += `\n📍 ${barProfile.barName || 'Bar'}`;
      if (barProfile.address) barContext += ` - ${barProfile.address}`;
      
      barContext += `\n\n💰 CONFIGURATION :`;
      barContext += `\n- Devise : ${currency}`;
      barContext += `\n- Taux de taxe : ${((barProfile.taxRate || 0.08) * 100).toFixed(2)}%`;
      barContext += `\n- Positionnement prix : ${barProfile.priceRange || 'modéré'}`;
      
      barContext += `\n\n🏢 PROFIL :`;
      barContext += `\n- Type : ${barProfile.barType || 'bar casual'}`;
      barContext += `\n- Ambiance : ${barProfile.barAmbiance || 'décontractée'}`;
      barContext += `\n- Clientèle : ${barProfile.primaryClientele || 'mixte'}`;
      barContext += `\n- Capacité : ${barProfile.seatingCapacity || 50} places`;
      barContext += `\n- Expérience : ${yearsInBusiness} ans (${barProfile.businessStage || 'établi'})`;
      
      if (barProfile.specialties) {
        barContext += `\n- Spécialités : ${barProfile.specialties}`;
      }
      if (barProfile.targetMarket) {
        barContext += `\n- Marché cible : ${barProfile.targetMarket}`;
      }
      
      barContext += `\n\n⚠️ IMPORTANT : Recommande des produits qui correspondent EXACTEMENT à ce profil. Utilise ${currency} pour les prix.`;
      barContext += `\n==========================================`;
    }
    
    const prompt = `Tu es consultant en affaires pour bars au ${region}, Canada. Ta tâche est d'analyser les boissons et de recommander les 3 à 5 MEILLEURS produits qui génèrent le PLUS de REVENUS pour un bar.
${barContext}

INSTRUCTIONS CRITIQUES :
1. Tu DOIS retourner du JSON valide avec EXACTEMENT ces champs pour chaque produit
2. Chaque champ doit avoir une valeur numérique (pas de null, pas de chaînes pour les nombres)
3. Tous les calculs doivent utiliser des valeurs réalistes de bar
4. Tiens compte du profil de l'établissement pour personnaliser les recommandations (type, clientèle, prix, spécialités)

Pour CHAQUE produit dans le tableau topSellers, fournis :
- product (string) : Nom de la boisson
- category (string) : Un de : spirits, wine, beer, cocktails, non-alcoholic, mixers
- reason (string) : Pourquoi ça génère des revenus au ${region} pour CE type d'établissement
- estimatedDailyUnits (number) : Unités vendues quotidiennement réalistes (ex: 8)
- estimatedUnitPrice (number) : Prix client par unité en $ (ex: 35.00)
- estimatedDailyRevenue (number) : Unités × Prix (ex: 280)
- profitMargin (number) : Marge en pourcentage, typiquement 35-50 pour les bars (ex: 40)
- region (string) : "${region}"

Retourne UNIQUEMENT cette structure JSON, sans autre texte :

{
  "topSellers": [
    {
      "product": "Scotch Single Malt Premium",
      "category": "spirits",
      "reason": "Marge élevée, populaire auprès des professionnels au ${region}",
      "estimatedDailyUnits": 6,
      "estimatedUnitPrice": 45.00,
      "estimatedDailyRevenue": 270,
      "profitMargin": 45,
      "region": "${region}"
    },
    {
      "product": "Bière Artisanale IPA",
      "category": "beer",
      "reason": "Forte demande pour les bières locales et artisanales au ${region}",
      "estimatedDailyUnits": 12,
      "estimatedUnitPrice": 8.50,
      "estimatedDailyRevenue": 102,
      "profitMargin": 40,
      "region": "${region}"
    }
  ],
  "totalPotentialWeeklyRevenue": 2604,
  "regionInsight": "Analyse de marché pour ${region}"
}`;

    const response = await callOpenAIJSON(prompt);
    
    if (!response) {
      console.error('[getSalesPrediction] OpenAI API returned null - check OPENAI_API_KEY in .env');
      return res.status(503).json({
        error: 'OpenAI API unavailable',
        message: 'La clé API OpenAI n\'est pas configurée. Vérifiez OPENAI_API_KEY dans .env'
      });
    }
    
    if (!response.topSellers || response.topSellers.length === 0) {
      return res.status(400).json({
        error: 'Invalid response from AI',
        message: 'Could not generate revenue recommendations'
      });
    }

    // Validate and ensure all numeric fields are present
    const validatedSellers = response.topSellers.map((seller: any) => ({
      product: seller.product || 'Unknown Product',
      category: seller.category || 'other',
      reason: seller.reason || 'Popular in the region',
      estimatedDailyUnits: Number(seller.estimatedDailyUnits) || 5,
      estimatedUnitPrice: Number(seller.estimatedUnitPrice) || 25,
      estimatedDailyRevenue: Number(seller.estimatedDailyRevenue) || 125,
      profitMargin: Number(seller.profitMargin) || 40,
      region: region
    }));

    // Calculate weekly revenue
    const totalPotentialWeeklyRevenue = validatedSellers.reduce(
      (sum: number, seller: any) => sum + (seller.estimatedDailyRevenue * 7),
      0
    );

    res.json({
      topSellers: validatedSellers,
      totalPotentialWeeklyRevenue,
      regionInsight: response.regionInsight || `Key beverage trends in ${region}`,
      region
    });
  } catch (error) {
    console.error('Error in getSalesPrediction:', error);
    res.status(500).json({
      error: 'Failed to generate revenue prediction',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const analyticsNotImplemented: RequestHandler = async (req, res) => {
  return res.status(501).json({
    error: 'Not implemented',
    message: 'Analytics routes require Firestore migration. Data must be sent from client via POST body.',
    route: req.path
  });
};

// Implementation de getFoodWinePairing pour suggérer des accords mets-vins basés sur l'inventaire
export const getFoodWinePairing: RequestHandler = async (req, res) => {
  try {
    const wines = req.body.wines || []; // Vins de l'inventaire envoyés par le client
    const barProfile = req.body.barProfile || {}; // Profil du bar
    
    if (!wines || wines.length === 0) {
      return res.status(400).json({
        error: 'No wines provided',
        message: 'Veuillez envoyer la liste des vins de votre inventaire'
      });
    }

    // Créer une liste des vins disponibles pour l'IA
    const wineList = wines
      .map((w: any) => `${w.name || w.productName} (${w.category || 'vin'}, Stock: ${w.stock || w.quantity || 0})`)
      .join('\n');

    // Construire le contexte complet du bar si disponible
    let barContext = "";
    if (barProfile && Object.keys(barProfile).length > 0) {
      const currencySymbols: Record<string, string> = {
        USD: "$", EUR: "€", GBP: "£", CAD: "$", AUD: "A$", MXN: "Mex$",
        ARS: "$", CLP: "$", COP: "$", PEN: "S/", UYU: "$U", NZD: "NZ$", CHF: "CHF",
      };
      
      const currency = currencySymbols[barProfile.currency] || barProfile.currency || "$";
      
      barContext = `\n\n=== CONTEXTE DE L'ÉTABLISSEMENT ===`;
      barContext += `\n📍 ${barProfile.barName || 'Bar'}`;
      if (barProfile.address) barContext += ` - ${barProfile.address}`;
      
      barContext += `\n\n🏢 PROFIL :`;
      barContext += `\n- Type : ${barProfile.barType || 'bar casual'}`;
      barContext += `\n- Ambiance : ${barProfile.barAmbiance || 'décontractée'}`;
      barContext += `\n- Clientèle : ${barProfile.primaryClientele || 'mixte'}`;
      barContext += `\n- Positionnement : ${barProfile.priceRange || 'modéré'}`;
      barContext += `\n- Service : ${barProfile.servingStyle || 'table-service'}`;
      
      if (barProfile.specialties) {
        barContext += `\n- Spécialités : ${barProfile.specialties}`;
      }
      if (barProfile.targetMarket) {
        barContext += `\n- Marché cible : ${barProfile.targetMarket}`;
      }
      
      barContext += `\n\n⚠️ Adapte les suggestions de plats au style, clientèle et positionnement de cet établissement.`;
      barContext += `\n===================================`;
    }

    const prompt = `Tu es sommelier expert en accords mets-vins. Voici les vins disponibles dans l'inventaire du bar :

${wineList}
${barContext}

Ta tâche est de créer des accords mets-vins en utilisant UNIQUEMENT les vins de cet inventaire.

INSTRUCTIONS :
1. Pour chaque accord, choisis un vin de la liste ci-dessus
2. Suggère un plat qui s'accorde parfaitement avec ce vin ET qui convient au profil de l'établissement
3. Tiens compte du type d'établissement, de la clientèle et du positionnement prix
4. Explique pourquoi cet accord fonctionne
5. Crée 5-8 accords variés (entrées, plats principaux, desserts)
6. Retourne du JSON valide

Structure JSON attendue :

{
  "pairings": [
    {
      "wine": "Nom exact du vin de l'inventaire",
      "wineCategory": "rouge|blanc|rosé|mousseux|fortifié",
      "dish": "Nom du plat suggéré",
      "dishCategory": "entrée|plat principal|dessert|fromage",
      "reason": "Pourquoi cet accord fonctionne (arômes, texture, etc.)",
      "servingTemp": "Température de service recommandée",
      "glassType": "Type de verre recommandé"
    }
  ],
  "suggestions": [
    {
      "wineType": "Type de vin manquant dans l'inventaire",
      "reason": "Pourquoi l'ajouter améliorerait les options d'accords pour ce type d'établissement",
      "examples": "Exemples de vins à ajouter"
    }
  ],
  "tip": "Conseil général sur les accords mets-vins pour ce type de bar"
}

Retourne UNIQUEMENT le JSON, sans autre texte.`;

    const response = await callOpenAIJSON(prompt);
    
    if (!response || !response.pairings || response.pairings.length === 0) {
      return res.status(400).json({
        error: 'Invalid response from AI',
        message: 'Could not generate wine pairings'
      });
    }

    res.json({
      pairings: response.pairings || [],
      suggestions: response.suggestions || [],
      tip: response.tip || 'Les accords mets-vins rehaussent l\'expérience culinaire de vos clients.',
      totalWinesAnalyzed: wines.length
    });
  } catch (error) {
    console.error('Error in getFoodWinePairing:', error);
    res.status(500).json({
      error: 'Failed to generate wine pairings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Implementation de getInsights pour fournir des insights business généraux
export const getInsights: RequestHandler = async (req, res) => {
  try {
    const sales = req.body.sales || []; // Ventes envoyées par le client
    const inventory = req.body.inventory || []; // Inventaire envoyé par le client
    const barProfile = req.body.barProfile || {}; // Profil du bar
    
    if (!sales || sales.length === 0) {
      return res.status(400).json({
        error: 'No sales data provided',
        message: 'Veuillez envoyer les données de ventes pour générer des insights'
      });
    }

    // Construire le contexte du bar
    let barContext = "";
    if (barProfile && Object.keys(barProfile).length > 0) {
      const currencySymbols: Record<string, string> = {
        USD: "$", EUR: "€", GBP: "£", CAD: "$", AUD: "A$", MXN: "Mex$",
        ARS: "$", CLP: "$", COP: "$", PEN: "S/", UYU: "$U", NZD: "NZ$", CHF: "CHF",
      };
      
      const currency = currencySymbols[barProfile.currency] || barProfile.currency || "$";
      
      barContext = `\n\n=== CONTEXTE DE L'ÉTABLISSEMENT ===`;
      barContext += `\n📍 ${barProfile.barName || 'Bar'}`;
      barContext += `\n💰 Devise : ${currency}`;
      barContext += `\n🏢 Type : ${barProfile.barType || 'bar casual'}`;
      barContext += `\n👥 Clientèle : ${barProfile.primaryClientele || 'mixte'}`;
      barContext += `\n===================================`;
    }
    // Calculer les métriques clés stables
    let totalRevenue = 0;
    let totalTax = 0;
    let totalTip = 0;
    const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    sales.forEach((sale: any) => {
      totalRevenue += sale.total || 0;
      totalTax += sale.tax || 0;
      totalTip += sale.tip || 0;
      
      const items = Array.isArray(sale.items) ? sale.items : [];
      items.forEach((item: any) => {
        const name = item.name || 'Produit inconnu';
        if (!productStats[name]) {
          productStats[name] = { name, quantity: 0, revenue: 0 };
        }
        productStats[name].quantity += item.quantity || 1;
        productStats[name].revenue += (item.quantity || 1) * (item.price || 0);
      });
    });
    
    // Trouver le produit vedette (meilleure revenue)
    const topProduct = Object.values(productStats).sort((a, b) => b.revenue - a.revenue)[0];
    const topProductName = topProduct?.name || 'N/A';
    const topProductRevenue = topProduct?.revenue || 0;
    
    // Calculer la marge nette
    const netRevenue = totalRevenue - totalTax;
    const marginPercentage = sales.length > 0 ? ((netRevenue / totalRevenue) * 100).toFixed(2) : '0';

    // Préparer un résumé des ventes pour l'IA
    const salesSummary = sales.slice(0, 50).flatMap((sale: any) => {
      // Extraire les items de la vente (structure: { items: [...] })
      const items = Array.isArray(sale.items) ? sale.items : [];
      return items.map((item: any) => 
        `${item.name || 'Produit inconnu'}: ${item.quantity || 1} unités à ${item.price || 0} $`
      );
    }).join('\n');

    // Calculer les comparatifs par semaine, mois et année
    const weeklyStats: Record<string, { sales: number; revenue: number }> = {};
    const monthlyStats: Record<string, { sales: number; revenue: number }> = {};
    const yearlyStats: Record<string, { sales: number; revenue: number }> = {};
    
    sales.forEach((sale: any) => {
      // Convertir le timestamp Firestore correctement
      let timestamp: Date;
      if (sale.timestamp?.toDate) {
        // C'est un Firestore Timestamp côté client
        timestamp = sale.timestamp.toDate();
      } else if (sale.timestamp instanceof Date) {
        timestamp = sale.timestamp;
      } else if (typeof sale.timestamp === 'number') {
        timestamp = new Date(sale.timestamp);
      } else if (typeof sale.timestamp === 'string') {
        timestamp = new Date(sale.timestamp);
      } else {
        timestamp = new Date(); // Fallback
      }
      
      // Hebdomadaire
      const weekStart = new Date(timestamp);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = `Semaine du ${weekStart.toLocaleDateString('fr-CA')}`;
      if (!weeklyStats[weekKey]) {
        weeklyStats[weekKey] = { sales: 0, revenue: 0 };
      }
      weeklyStats[weekKey].sales += 1;
      weeklyStats[weekKey].revenue += sale.total || 0;
      
      // Mensuel
      const monthKey = `${timestamp.toLocaleString('fr-CA', { month: 'long' })} ${timestamp.getFullYear()}`;
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { sales: 0, revenue: 0 };
      }
      monthlyStats[monthKey].sales += 1;
      monthlyStats[monthKey].revenue += sale.total || 0;
      
      // Annuel
      const yearKey = timestamp.getFullYear().toString();
      if (!yearlyStats[yearKey]) {
        yearlyStats[yearKey] = { sales: 0, revenue: 0 };
      }
      yearlyStats[yearKey].sales += 1;
      yearlyStats[yearKey].revenue += sale.total || 0;
    });
    
    const weeklyComparison = Object.entries(weeklyStats)
      .sort((a, b) => {
        const dateA = new Date(a[0].replace('Semaine du ', ''));
        const dateB = new Date(b[0].replace('Semaine du ', ''));
        return dateA.getTime() - dateB.getTime();
      })
      .map(([week, stats]) => `${week}: ${stats.sales} ventes, ${stats.revenue.toFixed(2)} $`)
      .join('\n');
    
    const monthlyComparison = Object.entries(monthlyStats)
      .sort((a, b) => {
        const monthOrder: Record<string, number> = {
          'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
          'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
        };
        const [monthA, yearA] = a[0].split(' ');
        const [monthB, yearB] = b[0].split(' ');
        const yearDiff = parseInt(yearB) - parseInt(yearA);
        if (yearDiff !== 0) return yearDiff;
        return (monthOrder[monthA.toLowerCase()] || 0) - (monthOrder[monthB.toLowerCase()] || 0);
      })
      .map(([month, stats]) => `${month}: ${stats.sales} ventes, ${stats.revenue.toFixed(2)} $`)
      .join('\n');
    
    const yearlyComparison = Object.entries(yearlyStats)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([year, stats]) => `${year}: ${stats.sales} ventes, ${stats.revenue.toFixed(2)} $`)
      .join('\n');

    const prompt = `Tu es consultant business expert pour bars et liquor stores. 

MÉTRIQUES ACTUELLES :
- Marge nette: ${marginPercentage}%
- Revenu total: ${totalRevenue.toFixed(2)} $
- Taxes totales: ${totalTax.toFixed(2)} $
- Pourboires totaux: ${totalTip.toFixed(2)} $
- Produit vedette: ${topProductName} (${topProductRevenue.toFixed(2)} $)

VENTES RÉCENTES :
${salesSummary}

COMPARATIFS :
Hebdomadaire: ${weeklyComparison || 'N/A'}
Mensuel: ${monthlyComparison || 'N/A'}
Annuel: ${yearlyComparison || 'N/A'}

TÂCHE : Pour chaque métrique, détermine la tendance (positive/negative/neutral/warning) et écris une courte description (1-2 phrases) évaluant cette métrique.

Structure JSON attendue :

{
  "metrics": [
    {
      "name": "Marge nette",
      "value": "${marginPercentage}%",
      "trend": "positive|negative|neutral|warning",
      "description": "Évaluation courte et actionnable"
    },
    {
      "name": "Revenu total",
      "value": "${totalRevenue.toFixed(2)} $",
      "trend": "positive|negative|neutral|warning",
      "description": "Évaluation courte et actionnable"
    },
    {
      "name": "Taxes totales",
      "value": "${totalTax.toFixed(2)} $",
      "trend": "neutral",
      "description": "Information informative"
    },
    {
      "name": "Pourboires totaux",
      "value": "${totalTip.toFixed(2)} $",
      "trend": "positive|negative|neutral|warning",
      "description": "Évaluation courte et actionnable"
    },
    {
      "name": "Produit vedette",
      "value": "${topProductName}",
      "trend": "positive|negative|neutral|warning",
      "description": "Évaluation du produit vedette"
    }
  ],
  "summary": {
    "totalSalesAnalyzed": ${sales.length},
    "topCategory": "${topProductName}",
    "keyRecommendation": "Recommandation principale basée sur les données"
  }
}

Retourne UNIQUEMENT le JSON, sans autre texte.`;

    const response = await callOpenAIJSON(prompt);
    
    console.log('[getInsights] Réponse OpenAI:', JSON.stringify(response).substring(0, 200));
    
    if (!response) {
      console.error('[getInsights] OpenAI API returned null - check OPENAI_API_KEY in .env');
      // Retourner les métriques brutes si OpenAI échoue
      return res.json({
        metrics: [
          { name: 'Marge nette', value: `${marginPercentage}%`, trend: 'neutral' as const, description: 'Évaluation en cours...' },
          { name: 'Revenu total', value: `${totalRevenue.toFixed(2)} $`, trend: 'neutral' as const, description: 'Évaluation en cours...' },
          { name: 'Taxes totales', value: `${totalTax.toFixed(2)} $`, trend: 'neutral' as const, description: 'Information' },
          { name: 'Pourboires totaux', value: `${totalTip.toFixed(2)} $`, trend: 'neutral' as const, description: 'Évaluation en cours...' },
          { name: 'Produit vedette', value: topProductName, trend: 'positive' as const, description: `Produit le plus rentable avec ${topProductRevenue.toFixed(2)} $` }
        ],
        comparatives: {
          weekly: weeklyComparison,
          monthly: monthlyComparison,
          yearly: yearlyComparison
        },
        summary: {
          totalSalesAnalyzed: sales.length,
          topCategory: topProductName,
          keyRecommendation: "Vérifiez que votre clé OpenAI est configurée pour des évaluations détaillées"
        }
      });
    }
    
    if (!response.metrics || response.metrics.length === 0) {
      console.error('[getInsights] Pas de métriques reçues:', response);
      // Retourner les métriques brutes même si OpenAI n'en retourne pas
      return res.json({
        metrics: [
          { name: 'Marge nette', value: `${marginPercentage}%`, trend: 'neutral' as const, description: 'Évaluation IA non disponible' },
          { name: 'Revenu total', value: `${totalRevenue.toFixed(2)} $`, trend: 'neutral' as const, description: 'Évaluation IA non disponible' },
          { name: 'Taxes totales', value: `${totalTax.toFixed(2)} $`, trend: 'neutral' as const, description: 'Information' },
          { name: 'Pourboires totaux', value: `${totalTip.toFixed(2)} $`, trend: 'neutral' as const, description: 'Évaluation IA non disponible' },
          { name: 'Produit vedette', value: topProductName, trend: 'positive' as const, description: `Produit le plus rentable` }
        ],
        comparatives: {
          weekly: weeklyComparison,
          monthly: monthlyComparison,
          yearly: yearlyComparison
        },
        summary: {
          totalSalesAnalyzed: sales.length,
          topCategory: topProductName,
          keyRecommendation: "Données stables retournées"
        }
      });
    }

    res.json({
      metrics: response.metrics || [],
      comparatives: {
        weekly: weeklyComparison,
        monthly: monthlyComparison,
        yearly: yearlyComparison
      },
      summary: response.summary || {
        totalSalesAnalyzed: sales.length,
        topCategory: topProductName,
        keyRecommendation: "Continuez à enregistrer vos ventes pour plus d'insights"
      }
    });
  } catch (error) {
    console.error('Error in getInsights:', error);
    res.status(500).json({
      error: 'Failed to generate insights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getReorderRecommendations: RequestHandler = analyticsNotImplemented;
export const getProfitabilityAnalysis: RequestHandler = analyticsNotImplemented;
export const getPriceOptimization: RequestHandler = analyticsNotImplemented;
export const getRecipeRecommendations: RequestHandler = analyticsNotImplemented;
export const getAnomalyDetection: RequestHandler = analyticsNotImplemented;
export const getPromotionRecommendations: RequestHandler = analyticsNotImplemented;
export const getStockoutPrediction: RequestHandler = analyticsNotImplemented;
export const getMenuOptimization: RequestHandler = analyticsNotImplemented;
export const getTemporalTrends: RequestHandler = analyticsNotImplemented;
export const getDynamicPricing: RequestHandler = analyticsNotImplemented;

// Implementation de getRevenueForecast pour prévoir les revenus futurs
export const getRevenueForecast: RequestHandler = async (req, res) => {
  try {
    const sales = req.body.sales || []; // Ventes historiques envoyées par le client
    const barProfile = req.body.barProfile || {}; // Profil du bar
    
    if (!sales || sales.length === 0) {
      return res.status(400).json({
        error: 'No sales data provided',
        message: 'Veuillez envoyer les données de ventes historiques pour générer des prévisions'
      });
    }

    // Construire le contexte du bar
    let barContext = "";
    if (barProfile && Object.keys(barProfile).length > 0) {
      const currencySymbols: Record<string, string> = {
        USD: "$", EUR: "€", GBP: "£", CAD: "$", AUD: "A$", MXN: "Mex$",
        ARS: "$", CLP: "$", COP: "$", PEN: "S/", UYU: "$U", NZD: "NZ$", CHF: "CHF",
      };
      
      const currency = currencySymbols[barProfile.currency] || barProfile.currency || "$";
      
      barContext = `\n\n=== CONTEXTE DE L'ÉTABLISSEMENT ===`;
      barContext += `\n📍 ${barProfile.barName || 'Bar'}`;
      barContext += `\n💰 Devise : ${currency}`;
      barContext += `\n🏢 Type : ${barProfile.barType || 'bar casual'}`;
      barContext += `\n📊 Capacité : ${barProfile.seatingCapacity || 50} places`;
      barContext += `\n===================================`;
    }

    // Calculer le revenu total historique
    const totalRevenue = sales.reduce((sum: number, sale: any) => 
      sum + (Number(sale.total) || Number(sale.price) * Number(sale.quantity) || 0), 0
    );
    
    const avgDailyRevenue = totalRevenue / Math.max(1, sales.length);

    const prompt = `Tu es analyste financier expert pour l'industrie de l'hospitalité. Analyse ces ventes historiques et génère des prévisions de revenus.
${barContext}

DONNÉES HISTORIQUES :
- Total des ventes analysées : ${sales.length}
- Revenu total : ${totalRevenue.toFixed(2)} $
- Revenu quotidien moyen : ${avgDailyRevenue.toFixed(2)} $

INSTRUCTIONS :
1. Analyse la tendance de croissance
2. Prévois les revenus pour les 4 prochains trimestres
3. Calcule le revenu annuel prévu
4. Tiens compte de la saisonnalité typique pour un bar
5. Fournis une moyenne mensuelle
6. Retourne du JSON valide avec tous les champs numériques

Structure JSON attendue :

{
  "annualForecast": 125000.00,
  "averageMonthlyRevenue": 10416.67,
  "trend": 5.5,
  "quarterlyForecast": [
    {
      "quarter": "Q1 2026",
      "predictedRevenue": 28000.00,
      "confidence": 0.85
    },
    {
      "quarter": "Q2 2026",
      "predictedRevenue": 32000.00,
      "confidence": 0.80
    },
    {
      "quarter": "Q3 2026",
      "predictedRevenue": 35000.00,
      "confidence": 0.75
    },
    {
      "quarter": "Q4 2026",
      "predictedRevenue": 30000.00,
      "confidence": 0.70
    }
  ],
  "insight": "Explication de la prévision et facteurs clés"
}

Retourne UNIQUEMENT le JSON, sans autre texte.`;

    const response = await callOpenAIJSON(prompt);
    
    if (!response) {
      console.error('[getRevenueForecast] OpenAI API returned null - check OPENAI_API_KEY in .env');
      return res.status(503).json({
        error: 'OpenAI API unavailable',
        message: 'La clé API OpenAI n\'est pas configurée. Vérifiez OPENAI_API_KEY dans .env'
      });
    }
    
    res.json({
      annualForecast: Number(response.annualForecast) || 0,
      averageMonthlyRevenue: Number(response.averageMonthlyRevenue) || 0,
      trend: Number(response.trend) || 0,
      quarterlyForecast: response.quarterlyForecast || [],
      insight: response.insight || "Prévisions basées sur l'historique des ventes",
      basedOnSales: sales.length
    });
  } catch (error) {
    console.error('Error in getRevenueForecast:', error);
    res.status(500).json({
      error: 'Failed to generate revenue forecast',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSalesReport: RequestHandler = analyticsNotImplemented;
export const getTaxReport: RequestHandler = analyticsNotImplemented;
