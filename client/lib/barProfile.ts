// Utilitaire pour récupérer le profil du bar depuis localStorage et l'utiliser dans les prompts AI

export interface BarProfile {
  // Informations de base
  barName: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  taxRegion: string;
  taxRate: number;
  
  // Profil AI
  barType: string;
  barAmbiance: string;
  primaryClientele: string;
  priceRange: string;
  businessStage: string;
  yearsFounded: number;
  seatingCapacity: number;
  servingStyle: string;
  specialties: string;
  targetMarket: string;
}

// Récupère le profil du bar depuis localStorage (tous les champs sont optionnels)
export function getBarProfile(): BarProfile | null {
  try {
    const savedSettings = localStorage.getItem("bartender-settings");
    if (!savedSettings) return null;
    
    const settings = JSON.parse(savedSettings);
    
    // Retourner le profil avec les valeurs réelles ou vides (pas de defaults sauf pour les essentiels)
    return {
      // Informations de base (toujours remplies par défaut)
      barName: settings.barName || "La Réserve",
      address: settings.address || "",
      phone: settings.phone || "",
      email: settings.email || "",
      currency: settings.currency || "USD",
      taxRegion: settings.taxRegion || "custom",
      taxRate: settings.taxRate !== undefined ? settings.taxRate : 0.08,
      
      // Profil AI (tous optionnels - retourner la valeur réelle ou vide)
      barType: settings.barType || "",
      barAmbiance: settings.barAmbiance || "",
      primaryClientele: settings.primaryClientele || "",
      priceRange: settings.priceRange || "",
      businessStage: settings.businessStage || "",
      yearsFounded: settings.yearsFounded || new Date().getFullYear(),
      seatingCapacity: settings.seatingCapacity || 0,
      servingStyle: settings.servingStyle || "",
      specialties: settings.specialties || "",
      targetMarket: settings.targetMarket || "",
    };
  } catch (error) {
    console.error("Error loading bar profile:", error);
    return null;
  }
}

// Génère une description contextuelle complète pour les prompts AI
export function getBarContextForAI(): string {
  const profile = getBarProfile();
  if (!profile) return "";

  const barTypeLabels: Record<string, string> = {
    casual: "bar casual",
    upscale: "bar haut de gamme",
    dive: "bar populaire",
    sports: "bar sportif",
    "wine-bar": "bar à vin",
    "cocktail-lounge": "lounge à cocktails",
    nightclub: "boîte de nuit",
    pub: "pub",
    bistro: "bistro",
    "restaurant-bar": "restaurant-bar",
  };

  const ambianceLabels: Record<string, string> = {
    relaxed: "décontractée",
    lively: "animée",
    intimate: "intime",
    sophisticated: "sophistiquée",
    casual: "casual",
    energetic: "énergique",
    quiet: "calme",
    romantic: "romantique",
  };

  const clienteleLabels: Record<string, string> = {
    "young-professionals": "jeunes professionnels",
    students: "étudiants",
    families: "familles",
    tourists: "touristes",
    locals: "habitués locaux",
    mixed: "clientèle mixte",
    seniors: "clientèle senior",
    business: "clientèle d'affaires",
  };

  const priceLabels: Record<string, string> = {
    budget: "économique ($)",
    moderate: "modéré ($$)",
    upscale: "haut de gamme ($$$)",
    luxury: "luxe ($$$$)",
  };

  const stageLabels: Record<string, string> = {
    new: "nouveau (moins d'1 an)",
    growing: "en croissance (1-3 ans)",
    established: "établi (3-10 ans)",
    mature: "mature (10+ ans)",
  };

  const serviceLabels: Record<string, string> = {
    "table-service": "service aux tables",
    "bar-only": "au bar uniquement",
    mixed: "mixte (table + bar)",
    "fast-casual": "casual rapide",
  };

  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "C$",
    AUD: "A$",
    MXN: "Mex$",
    ARS: "$",
    CLP: "$",
    COP: "$",
    PEN: "S/",
    UYU: "$U",
    NZD: "NZ$",
    CHF: "CHF",
  };

  const yearsInBusiness = profile.yearsFounded ? new Date().getFullYear() - profile.yearsFounded : 0;

  let context = `\n\n=== CONTEXTE DE L'ÉTABLISSEMENT ===\n`;
  
  // Informations d'identification
  context += `\n📍 IDENTIFICATION :`;
  context += `\n- Nom commercial : ${profile.barName}`;
  if (profile.address) {
    context += `\n- Adresse : ${profile.address}`;
  }

  // Configuration financière
  context += `\n\n💰 CONFIGURATION FINANCIÈRE :`;
  context += `\n- Devise : ${profile.currency} (${currencySymbols[profile.currency] || profile.currency})`;
  if (profile.taxRegion && profile.taxRegion !== "custom") {
    context += `\n- Région fiscale : ${profile.taxRegion}`;
  }
  context += `\n- Taux de taxe : ${(profile.taxRate * 100).toFixed(2)}%`;

  // Profil de l'établissement (ajouter seulement si rempli)
  const profileInfos: string[] = [];
  if (profile.barType) {
    profileInfos.push(`Type : ${barTypeLabels[profile.barType] || profile.barType}`);
  }
  if (profile.barAmbiance) {
    profileInfos.push(`Ambiance : ${ambianceLabels[profile.barAmbiance] || profile.barAmbiance}`);
  }
  if (profile.primaryClientele) {
    profileInfos.push(`Clientèle cible : ${clienteleLabels[profile.primaryClientele] || profile.primaryClientele}`);
  }
  if (profile.priceRange) {
    profileInfos.push(`Positionnement prix : ${priceLabels[profile.priceRange] || profile.priceRange}`);
  }

  if (profileInfos.length > 0) {
    context += `\n\n🏢 PROFIL DE L'ÉTABLISSEMENT :`;
    profileInfos.forEach(info => {
      context += `\n- ${info}`;
    });
  }

  // Caractéristiques opérationnelles
  const operationInfos: string[] = [];
  if (profile.businessStage) {
    operationInfos.push(`Stade de maturité : ${stageLabels[profile.businessStage] || profile.businessStage} (${yearsInBusiness} ans d'expérience)`);
  }
  if (profile.seatingCapacity > 0) {
    operationInfos.push(`Capacité d'accueil : ${profile.seatingCapacity} places assises`);
  }
  if (profile.servingStyle) {
    operationInfos.push(`Mode de service : ${serviceLabels[profile.servingStyle] || profile.servingStyle}`);
  }

  if (operationInfos.length > 0) {
    context += `\n\n⚙️ OPÉRATIONS :`;
    operationInfos.forEach(info => {
      context += `\n- ${info}`;
    });
  }

  // Identité et spécialisation
  if (profile.specialties || profile.targetMarket) {
    context += `\n\n🎯 IDENTITÉ & SPÉCIALISATION :`;
    if (profile.specialties) {
      context += `\n- Spécialités maison : ${profile.specialties}`;
    }
    if (profile.targetMarket) {
      context += `\n- Marché/Occasions cibles : ${profile.targetMarket}`;
    }
  }

  context += `\n\n⚠️ IMPORTANT : Adapte tes recommandations (produits, prix, quantités, style) en tenant compte du contexte fourni. Utilise la devise ${currencySymbols[profile.currency] || profile.currency} pour tous les montants.`;
  context += `\n=====================================\n`;

  return context;
}
