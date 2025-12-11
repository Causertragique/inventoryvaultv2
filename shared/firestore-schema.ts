// Structure des catégories et données de référence pour Firestore
export const PRODUCT_CATEGORIES = {
  spirits: {
    id: "spirits",
    name: "Spiritueux",
    nameEn: "Spirits",
    icon: "🥃",
    color: "slate",
    subcategories: {
      whisky: { id: "whisky", name: "Whisky", icon: "🥃" },
      vodka: { id: "vodka", name: "Vodka", icon: "🍸" },
      gin: { id: "gin", name: "Gin", icon: "🍸" },
      rum: { id: "rum", name: "Rhum", nameEn: "Rum", icon: "🍹" },
      tequila: { id: "tequila", name: "Tequila", icon: "🌵" },
      cognac: { id: "cognac", name: "Cognac", icon: "🥃" },
      liqueur: { id: "liqueur", name: "Liqueur", icon: "🍷" },
      other: { id: "other", name: "Autre", nameEn: "Other", icon: "🍾" },
    },
  },
  wine: {
    id: "wine",
    name: "Vin",
    nameEn: "Wine",
    icon: "🍷",
    color: "red",
    subcategories: {
      red: { id: "red", name: "Rouge", nameEn: "Red", icon: "🍷" },
      white: { id: "white", name: "Blanc", nameEn: "White", icon: "🥂" },
      rose: { id: "rose", name: "Rosé", icon: "🌸" },
      sparkling: { id: "sparkling", name: "Mousseux", nameEn: "Sparkling", icon: "🍾" },
      fortified: { id: "fortified", name: "Fortifié", nameEn: "Fortified", icon: "🍷" },
    },
  },
  beer: {
    id: "beer",
    name: "Bière",
    nameEn: "Beer",
    icon: "🍺",
    color: "amber",
    subcategories: {
      lager: { id: "lager", name: "Lager", icon: "🍺" },
      ale: { id: "ale", name: "Ale", icon: "🍺" },
      ipa: { id: "ipa", name: "IPA", icon: "🍺" },
      stout: { id: "stout", name: "Stout", icon: "🍺" },
      wheat: { id: "wheat", name: "Blanche", nameEn: "Wheat", icon: "🍺" },
      sour: { id: "sour", name: "Sure", nameEn: "Sour", icon: "🍺" },
      local: { id: "local", name: "Locale (Qc)", nameEn: "Local (Qc)", icon: "🍁" },
    },
  },
  cocktail: {
    id: "cocktail",
    name: "Cocktail",
    nameEn: "Cocktail",
    icon: "🍹",
    color: "indigo",
    subcategories: {
      classic: { id: "classic", name: "Classique", nameEn: "Classic", icon: "🍸" },
      tropical: { id: "tropical", name: "Tropical", icon: "🍹" },
      signature: { id: "signature", name: "Signature", icon: "✨" },
      seasonal: { id: "seasonal", name: "Saisonnier", nameEn: "Seasonal", icon: "🍂" },
      mocktail: { id: "mocktail", name: "Sans alcool", nameEn: "Mocktail", icon: "🥤" },
    },
  },
  soda: {
    id: "soda",
    name: "Boisson gazeuse",
    nameEn: "Soda",
    icon: "🥤",
    color: "cyan",
    subcategories: {
      cola: { id: "cola", name: "Cola", icon: "🥤" },
      lemon: { id: "lemon", name: "Citron", nameEn: "Lemon", icon: "🍋" },
      ginger: { id: "ginger", name: "Gingembre", nameEn: "Ginger", icon: "🥤" },
      tonic: { id: "tonic", name: "Tonic", icon: "🥤" },
      energy: { id: "energy", name: "Énergisante", nameEn: "Energy", icon: "⚡" },
    },
  },
  juice: {
    id: "juice",
    name: "Jus",
    nameEn: "Juice",
    icon: "🧃",
    color: "orange",
    subcategories: {
      orange: { id: "orange", name: "Orange", icon: "🍊" },
      apple: { id: "apple", name: "Pomme", nameEn: "Apple", icon: "🍎" },
      cranberry: { id: "cranberry", name: "Canneberge", nameEn: "Cranberry", icon: "🫐" },
      pineapple: { id: "pineapple", name: "Ananas", nameEn: "Pineapple", icon: "🍍" },
      tomato: { id: "tomato", name: "Tomate", nameEn: "Tomato", icon: "🍅" },
    },
  },
  mixer: {
    id: "mixer",
    name: "Mélangeur",
    nameEn: "Mixer",
    icon: "🧊",
    color: "blue",
    subcategories: {
      syrup: { id: "syrup", name: "Sirop", nameEn: "Syrup", icon: "🍯" },
      bitters: { id: "bitters", name: "Amer", nameEn: "Bitters", icon: "💧" },
      cream: { id: "cream", name: "Crème", nameEn: "Cream", icon: "🥛" },
      garnish: { id: "garnish", name: "Garniture", nameEn: "Garnish", icon: "🍋" },
    },
  },
  other: {
    id: "other",
    name: "Autre",
    nameEn: "Other",
    icon: "📦",
    color: "green",
    subcategories: {
      snack: { id: "snack", name: "Grignotines", nameEn: "Snack", icon: "🥜" },
      ice: { id: "ice", name: "Glace", nameEn: "Ice", icon: "🧊" },
      supply: { id: "supply", name: "Fourniture", nameEn: "Supply", icon: "📦" },
    },
  },
} as const;

// Helper pour obtenir toutes les catégories principales
export const getMainCategories = () => Object.values(PRODUCT_CATEGORIES);

// Helper pour obtenir les sous-catégories d'une catégorie
export const getSubcategories = (categoryId: string) => {
  const category = PRODUCT_CATEGORIES[categoryId as keyof typeof PRODUCT_CATEGORIES];
  return category ? Object.values(category.subcategories) : [];
};

// Type pour les produits
export interface FirestoreProduct {
  id?: string;
  name: string;
  category: keyof typeof PRODUCT_CATEGORIES;
  subcategory?: string;
  price: number;
  quantity: number;
  unit?: "bouteille" | "litre" | "ml" | "unité" | "kg" | "g";
  imageUrl?: string;
  description?: string;
  supplier?: string;
  barcode?: string;
  alcoholContent?: number; // % alcool
  volume?: number; // ml
  origin?: string; // Pays/région
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

// Type pour les recettes
export interface FirestoreRecipe {
  id?: string;
  name: string;
  category: "cocktail" | "mocktail";
  subcategory?: string;
  ingredients: {
    productId?: string;
    productName: string;
    quantity: number;
    unit: string;
  }[];
  instructions: string[];
  glassware?: string;
  garnish?: string;
  imageUrl?: string;
  prepTime?: number; // minutes
  difficulty?: "facile" | "moyen" | "difficile";
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

// Type pour les ventes
export interface FirestoreSale {
  id?: string;
  items: {
    productId?: string;
    recipeId?: string;
    name: string;
    quantity: number;
    price: number;
    category: string;
  }[];
  subtotal: number;
  tax: number;
  tip?: number;
  total: number;
  paymentMethod: "cash" | "card" | "stripe" | "other";
  cardType?: "debit" | "credit" | "espece"; // Type de carte si paymentMethod === "card"
  stripePaymentIntentId?: string;
  tableNumber?: string;
  serverName?: string;
  userId?: string; // optionnel car on l'utilise dans le chemin
  timestamp: any;
}

// Type pour le profil utilisateur (document dans la collection users)
export interface FirestoreUserProfile {
  // Informations de base (obligatoires)
  userId: string;
  email?: string;
  username?: string;
  role?: "owner" | "admin" | "manager" | "employee"; // Rôle pour contrôler les permissions
  createdAt?: any;
  updatedAt?: any;

  // Informations générales du bar
  barName?: string;
  address?: string;
  phone?: string;
  currency?: string;
  taxRegion?: string;
  taxRate?: number;

  // Profil AI - Personnalisation de l'établissement
  barType?: "casual" | "upscale" | "dive" | "sports" | "wine-bar" | "cocktail-lounge" | "nightclub" | "pub" | "bistro" | "restaurant-bar";
  barAmbiance?: "relaxed" | "lively" | "intimate" | "sophisticated" | "casual" | "energetic" | "quiet" | "romantic";
  primaryClientele?: "young-professionals" | "students" | "families" | "tourists" | "locals" | "mixed" | "seniors" | "business";
  priceRange?: "budget" | "moderate" | "upscale" | "luxury";
  businessStage?: "new" | "growing" | "established" | "mature";
  yearsFounded?: number;
  seatingCapacity?: number;
  servingStyle?: "table-service" | "bar-only" | "mixed" | "fast-casual";
  specialties?: string;
  targetMarket?: string;

  // Préférences de notifications
  lowStockAlerts?: boolean;
  salesReports?: boolean;
  weeklySummary?: boolean;

  // Préférences d'inventaire
  lowStockThreshold?: number;
  autoReorder?: boolean;
  reorderQuantity?: number;
}

// Type pour les logs d'audit d'inventaire (traçabilité anti-fraude)
export interface FirestoreInventoryLog {
  id?: string;
  productId: string;
  productName: string;
  action: "create" | "update" | "delete" | "restock" | "adjustment" | "sale";
  previousQuantity?: number;
  newQuantity: number;
  difference?: number;
  previousPrice?: number;
  newPrice?: number;
  reason?: string; // Raison de la modification
  userId: string;
  username: string;
  userRole: "owner" | "admin" | "manager" | "employee";
  timestamp: any;
  metadata?: {
    source?: "manual" | "sale" | "import" | "automatic";
    ipAddress?: string;
    deviceInfo?: string;
  };
}

// Données de démonstration pour tester
export const DEMO_PRODUCTS: Omit<FirestoreProduct, "id" | "userId" | "createdAt" | "updatedAt">[] = [
  {
    name: "Jack Daniel's",
    category: "spirits",
    subcategory: "whisky",
    price: 45.99,
    quantity: 8,
    unit: "bouteille",
    volume: 750,
    alcoholContent: 40,
    origin: "États-Unis",
    description: "Whisky Tennessee classique",
  },
  {
    name: "Tito's Vodka",
    category: "spirits",
    subcategory: "vodka",
    price: 38.50,
    quantity: 12,
    unit: "bouteille",
    volume: 750,
    alcoholContent: 40,
    origin: "États-Unis",
  },
  {
    name: "Gin Ungava",
    category: "spirits",
    subcategory: "gin",
    price: 42.00,
    quantity: 6,
    unit: "bouteille",
    volume: 750,
    alcoholContent: 43.1,
    origin: "Québec, Canada",
    description: "Gin québécois aux botaniques nordiques",
  },
  {
    name: "Bière Boréale Rousse",
    category: "beer",
    subcategory: "local",
    price: 3.50,
    quantity: 48,
    unit: "bouteille",
    volume: 341,
    alcoholContent: 5,
    origin: "Québec, Canada",
  },
  {
    name: "Château Pétrus",
    category: "wine",
    subcategory: "red",
    price: 125.00,
    quantity: 3,
    unit: "bouteille",
    volume: 750,
    alcoholContent: 13.5,
    origin: "France",
  },
];
