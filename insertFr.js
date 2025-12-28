const fs = require('fs');
const path = 'client/lib/i18n.ts';
let text = fs.readFileSync(path, 'utf8');
const start = text.indexOf('      salesReport: {', 1000);
if (start === -1) {
  throw new Error('start not found');
}
const close = text.indexOf('    },', start);
if (close === -1) {
  throw new Error('close not found');
}
const block = `      aiTools: {
        title: "Outils IA",
        refreshLabel: "Actualiser les résultats IA",
        toolOptions: {
          insights: {
            title: "Insights intelligents",
            description: "Analyse des ventes récentes pour dégager des tendances clés.",
          },
          "sales-prediction": {
            title: "Prévision des ventes",
            description: "Estimez les meilleurs vendeurs et anticipez les stocks.",
          },
          "food-wine-pairing": {
            title: "Accords mets-vins",
            description: "Générez des accords entre vos vins et vos plats.",
          },
          "sales-report": {
            title: "Rapport de ventes",
            description: "Obtenez un rapport détaillé avec statistiques et taxes.",
          },
        },
        insights: {
          errorTitle: "Erreur lors de la génération",
          retrying: "Réessai en cours...",
          retryButton: "Réessayer",
          intro: "Générez des insights intelligents basés sur vos données de vente.",
          generateButton: "Générer des insights",
          generating: "Génération en cours...",
          noDataTitle: "Pas encore de données d'analyse",
          noDataDescription: "Les insights IA apparaîtront après quelques ventes.",
          comparativesTitle: "📊 Comparatifs",
          comparativesTimeframes: {
            weekly: "Hebdomadaire",
            monthly: "Mensuel",
            yearly: "Annuel",
          },
          trendLabels: {
            positive: "Positif",
            negative: "Négatif",
            warning: "Attention",
            neutral: "Neutre",
          },
        },
        foodWinePairing: {
          errorTitle: "Erreur lors de la génération",
          retrying: "Réessai en cours...",
          retryButton: "Réessayer",
          emptyMessage: "Cliquez sur le bouton pour générer des accords mets-vins.",
          buttonLabel: "Générer des accords",
          title: "Accord mets-vin",
        },
        salesReport: {
          errorTitle: "Erreur lors de la génération",
          retrying: "Chargement...",
          retryButton: "Réessayer",
          loading: "Chargement...",
          emptyMessage: "Cliquez sur le bouton pour générer un rapport détaillé de ventes.",
          buttonLabel: "Générer le rapport",
          statsLabels: {
            totalSales: "Total de ventes",
            revenue: "Revenu total",
            tps: "TPS",
            tvq: "TVQ",
            tips: "Pourboires",
            averageValue: "Valeur moyenne",
          },
        },
      },
`;
text = text.slice(0, close) + block + text.slice(close);
fs.writeFileSync(path, text);
