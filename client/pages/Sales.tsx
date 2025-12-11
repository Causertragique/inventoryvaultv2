import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import PaymentModal from "@/components/PaymentModal";
import { Product } from "@/components/ProductCard";
import { Trash2, Plus, Minus, CreditCard, DollarSign, UserPlus, Users, X, FileText, Eye, Wine, Grid3x3, List, Search } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getProducts, updateProduct } from "@/services/firestore/products";
import { getRecipes, createRecipe } from "@/services/firestore/recipes";
import { createSale } from "@/services/firestore/sales";
import { stockAlertsService } from "@/services/firestore/notifications";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CartItem extends Omit<Product, 'category'> {
  category: "spirits" | "wine" | "beer" | "soda" | "juice" | "other" | "cocktail";
  cartQuantity: number;
  isRecipe?: boolean;
}

interface RecipeIngredient {
  productId?: string;
  productName: string;
  quantity: number; // Quantity in ml or units
  unit: string; // "ml" or unit from product
}

interface Recipe {
  id: string;
  name: string;
  price: number;
  ingredients: RecipeIngredient[];
  category: "spirits" | "wine" | "beer" | "soda" | "juice" | "other" | "cocktail";
  servingSize?: number; // Size of one serving in ml (optional)
}

interface Tab {
  id: string;
  name: string;
  creditCard?: string; // Last 4 digits stored for reference (optional)
  items: CartItem[];
  createdAt: Date;
  subtotal: number;
  tax: number;
  total: number;
  status: "open" | "paid"; // Track if tab is open or paid
}

const categoryColors = {
  spirits: "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500/30 hover:bg-slate-200 dark:hover:bg-slate-500/30",
  wine: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-500/30",
  beer: "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500/30 hover:bg-slate-200 dark:hover:bg-slate-500/30",
  soda: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30 hover:bg-cyan-200 dark:hover:bg-cyan-500/30",
  juice: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/30 hover:bg-orange-200 dark:hover:bg-orange-500/30",
  other: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30 hover:bg-green-200 dark:hover:bg-green-500/30",
  cocktail: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30 hover:bg-indigo-200 dark:hover:bg-indigo-500/30",
};

export default function Sales() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<
    "all" | "spirits" | "wine" | "beer" | "soda" | "juice" | "other" | "cocktail"
  >("all");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "tab" | null>(
    null,
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
  const [showNewTabDialog, setShowNewTabDialog] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [newTabCreditCard, setNewTabCreditCard] = useState("");
  const [showTabsList, setShowTabsList] = useState(false);
  const [showTabsManagement, setShowTabsManagement] = useState(false);
  const [selectedTabForDetails, setSelectedTabForDetails] = useState<string | null>(null);
  const [showPayTabDialog, setShowPayTabDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const saved = localStorage.getItem("sales-view-mode");
    return (saved === "list" || saved === "grid") ? saved : "grid";
  });
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState(0);
  const [tipPercentage, setTipPercentage] = useState<number | null>(null);
  
  // Load inventory products and recipes from Firestore
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [products, recipesList] = await Promise.all([
          getProducts(user.uid),
          getRecipes(user.uid),
        ]);
        setInventoryProducts(products as Product[]);
        // Map FirestoreRecipe to local Recipe interface
        const mappedRecipes: Recipe[] = recipesList
          .filter(r => r.id) // Filter out recipes without id
          .map(r => ({
            ...r,
            id: r.id!, // Assert id exists after filter
            price: (r as any).price || 0, // Use price from Firestore or default to 0
            ingredients: r.ingredients.filter(ing => ing.productId), // Filter out ingredients without productId
            category: r.category === "mocktail" ? "other" : "cocktail" as "cocktail" | "spirits" | "wine" | "beer" | "soda" | "juice" | "other",
          }));
        setRecipes(mappedRecipes);
      } catch (error: any) {
        console.error("Erreur chargement données:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les produits et recettes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, toast]);

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem("sales-view-mode", viewMode);
  }, [viewMode]);

  const categories: Array<"all" | "spirits" | "wine" | "beer" | "soda" | "juice" | "other" | "cocktail"> = [
    "all",
    "spirits",
    "wine",
    "beer",
    "soda",
    "juice",
    "other",
    "cocktail",
  ];
  const categoriesObj = t.sales.categories as Record<string, string>;
  const categoryLabels = {
    all: categoriesObj.all || "Tous",
    spirits: categoriesObj.spirits || "Spiritueux",
    wine: categoriesObj.wine || "Vin",
    beer: categoriesObj.beer || "Bière",
    soda: categoriesObj.soda || "Boissons gazeuses",
    juice: categoriesObj.juice || "Jus",
    other: categoriesObj.other || "Autres",
    cocktail: categoriesObj.cocktail || "Cocktails",
  };

  // Translate unit
  const translateUnit = (unit: string): string => {
    const unitLower = unit.toLowerCase();
    const units = t.common.units;
    
    if (unitLower === "bottles" || unitLower === "bouteilles" || unitLower === "botellas" || unitLower === "flaschen") {
      return units.bottles;
    }
    if (unitLower === "bottle" || unitLower === "bouteille" || unitLower === "botella" || unitLower === "flasche") {
      return units.bottle;
    }
    if (unitLower === "bags" || unitLower === "sacs" || unitLower === "bolsas" || unitLower === "tüten") {
      return units.bags;
    }
    if (unitLower === "bag" || unitLower === "sac" || unitLower === "bolsa" || unitLower === "tüte") {
      return units.bag;
    }
    if (unitLower === "shot" || unitLower === "shooter") {
      return units.shot;
    }
    if (unitLower === "glass" || unitLower === "verre" || unitLower === "vaso" || unitLower === "glas") {
      return units.glass;
    }
    if (unitLower === "drink" || unitLower === "boisson" || unitLower === "bebida" || unitLower === "getränk") {
      return units.drink;
    }
    return unit; // Fallback to original if not found
  };

  // Combine inventory products and recipes for display
  const allProductsForSale: (Product | Recipe)[] = [
    // Only show recipes/cocktails created in Sales page, not inventory products
    ...recipes.map(r => ({ ...r, isRecipe: true }))
  ];
  
  const filteredProducts = allProductsForSale
    .filter((p) => filterCategory === "all" || p.category === filterCategory)
    .sort((a, b) => {
      // Sort by category order (same as categories array)
      const categoryOrder: Record<string, number> = {
        spirits: 1,
        wine: 2,
        beer: 3,
        soda: 4,
        juice: 5,
        other: 6,
        cocktail: 7,
      };
      const orderA = categoryOrder[a.category] || 999;
      const orderB = categoryOrder[b.category] || 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // If same category, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });

  // Convert ounces to ml (1 oz = 29.5735 ml)
  const ozToMl = (oz: number): number => oz * 29.5735;

  const calculateRecipeAvailability = (recipe: Recipe): number => {
    if (recipe.ingredients.length === 0) return 1;
    
    let minServings = Infinity;
    
    recipe.ingredients.forEach(ingredient => {
      const product = inventoryProducts.find(p => p.id === ingredient.productId);
      if (!product) {
        minServings = 0;
        return;
      }
      
      // Check if product has quantity in ml
      const productQuantityInMl = (product as any).quantityInMl || 0;
      const productQuantity = product.quantity;
      
      if (ingredient.unit === "ml" || ingredient.unit === "oz") {
        // Convert oz to ml if needed
        const ingredientQuantityInMl = ingredient.unit === "oz" 
          ? ozToMl(ingredient.quantity)
          : ingredient.quantity;
        
        // Calculate how many servings we can make based on ml
        if (productQuantityInMl > 0) {
          // Product quantity is in ml
          const servings = Math.floor((productQuantityInMl * productQuantity) / ingredientQuantityInMl);
          minServings = Math.min(minServings, servings);
        } else {
          // Assume standard bottle sizes (750ml for spirits, 330ml for beer, etc.)
          const mlPerBottle = product.unit.includes("bottle") 
            ? (product.category === "beer" ? 330 : 750)
            : 750;
          const totalMl = productQuantity * mlPerBottle;
          const servings = Math.floor(totalMl / ingredientQuantityInMl);
          minServings = Math.min(minServings, servings);
        }
      } else {
        // Quantity in units
        const servings = Math.floor(productQuantity / ingredient.quantity);
        minServings = Math.min(minServings, servings);
      }
    });
    
    return minServings === Infinity ? 0 : Math.max(0, minServings);
  };

  const addToCart = (product: Product | Recipe) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item,
        ),
      );
    } else {
      // Convert Recipe to CartItem format
      if ('ingredients' in product) {
        const recipeItem: CartItem = {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: 0,
          unit: "drink",
          cartQuantity: 1,
          isRecipe: true,
        };
        setCart([...cart, recipeItem]);
      } else {
        setCart([...cart, { ...product, cartQuantity: 1, isRecipe: false }]);
      }
    }
  };

  const updateInventoryAfterSale = async (items: CartItem[]) => {
    const updatedProducts = [...inventoryProducts];
    const lowStockAlerts: Array<{ productId: string; productName: string; quantity: number; threshold: number }> = [];
    
    items.forEach(item => {
      // Check if it's a recipe
      const recipe = recipes.find(r => r.id === item.id);
      if (recipe) {
        // Decrement ingredients from inventory
        recipe.ingredients.forEach(ingredient => {
          const product = updatedProducts.find(p => p.id === ingredient.productId);
          if (product) {
            // Convert oz to ml if needed
            const quantityToRemoveInMl = (ingredient.unit === "oz")
              ? ozToMl(ingredient.quantity * item.cartQuantity)
              : (ingredient.unit === "ml" ? ingredient.quantity * item.cartQuantity : 0);
            
            if (ingredient.unit === "ml" || ingredient.unit === "oz") {
              // Handle ml-based inventory (including oz converted to ml)
              const productQuantityInMl = (product as any).quantityInMl || product.bottleSizeInMl || 0;
              
              if (productQuantityInMl > 0) {
                // Product has quantity in ml per bottle/unit
                const currentMl = productQuantityInMl * product.quantity;
                const newMl = Math.max(0, currentMl - quantityToRemoveInMl);
                product.quantity = Math.ceil(newMl / productQuantityInMl);
              } else {
                // Estimate based on standard bottle sizes
                const mlPerBottle = product.unit.includes("bottle") 
                  ? (product.category === "beer" ? 330 : 750)
                  : 750;
                const bottlesToRemove = quantityToRemoveInMl / mlPerBottle;
                product.quantity = Math.max(0, product.quantity - bottlesToRemove);
              }
            } else {
              // Quantity in units
              const quantityToRemove = ingredient.quantity * item.cartQuantity;
              product.quantity = Math.max(0, product.quantity - quantityToRemove);
            }
            
            // Check for low stock (threshold = 25% or 1 unit minimum)
            const lowStockThreshold = Math.max(1, Math.ceil(product.quantity * 0.25));
            if (product.quantity > 0 && product.quantity <= lowStockThreshold) {
              lowStockAlerts.push({
                productId: product.id,
                productName: product.name,
                quantity: product.quantity,
                threshold: lowStockThreshold,
              });
            } else if (product.quantity === 0) {
              lowStockAlerts.push({
                productId: product.id,
                productName: product.name,
                quantity: 0,
                threshold: lowStockThreshold,
              });
            }
          }
        });
      } else {
        // Regular product - decrement quantity
        const product = updatedProducts.find(p => p.id === item.id);
        if (product) {
          product.quantity = Math.max(0, product.quantity - item.cartQuantity);
          
          // Check for low stock (threshold = 25% or 1 unit minimum)
          const lowStockThreshold = Math.max(1, Math.ceil(product.quantity * 0.25));
          if (product.quantity > 0 && product.quantity <= lowStockThreshold) {
            lowStockAlerts.push({
              productId: product.id,
              productName: product.name,
              quantity: product.quantity,
              threshold: lowStockThreshold,
            });
          } else if (product.quantity === 0) {
            lowStockAlerts.push({
              productId: product.id,
              productName: product.name,
              quantity: 0,
              threshold: lowStockThreshold,
            });
          }
        }
      }
    });
    
    // Update inventory in Firestore
    for (const product of updatedProducts) {
      try {
        if (user?.uid) {
          await updateProduct(user.uid, product.id, {
            quantity: product.quantity,
          });
        }
      } catch (error) {
        console.error(`Error updating product ${product.id}:`, error);
      }
    }
    
    setInventoryProducts(updatedProducts);
    
    // Create stock alerts for low stock items
    if (user?.uid && lowStockAlerts.length > 0) {
      for (const alert of lowStockAlerts) {
        try {
          const alertType = alert.quantity === 0 ? "out_of_stock" : "low_stock";
          await stockAlertsService.create(user.uid, {
            productId: alert.productId,
            productName: alert.productName,
            currentStock: alert.quantity,
            thresholdLevel: alert.threshold,
            alertType,
            isDismissed: false,
          });
        } catch (error) {
          console.error(`Error creating stock alert for ${alert.productName}:`, error);
        }
      }
      
      // Show toast notification
      toast({
        title: "Stock Alert",
        description: `${lowStockAlerts.length} product(s) have low stock. Check notifications for details.`,
        variant: "destructive",
      });
    }
    
    localStorage.setItem("inventory-products", JSON.stringify(updatedProducts));
  };


  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, cartQuantity: quantity } : item,
        ),
      );
    }
  };

  // Récupérer les paramètres de taxe depuis les settings
  const getTaxSettings = () => {
    const settingsStr = localStorage.getItem("bartender-settings");
    if (settingsStr) {
      try {
        const settings = JSON.parse(settingsStr);
        return {
          taxRegion: settings.taxRegion || "quebec",
          taxRate: settings.taxRate || 0.08,
        };
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }
    return { taxRegion: "quebec", taxRate: 0.08 };
  };

  // Fonction pour calculer les taxes selon la région
  const calculateTax = (subtotal: number) => {
    const { taxRegion } = getTaxSettings();
    
    switch (taxRegion) {
      case "quebec": {
        // Québec: TPS 5% + TVQ 9,975% (TVQ sur prix + TPS)
        const TPS = subtotal * 0.05;
        const TVQ = (subtotal + TPS) * 0.09975;
        return {
          TPS,
          TVQ,
          PST: 0,
          HST: 0,
          TVD: 0,
          total: TPS + TVQ,
          breakdown: true,
          labels: { primary: "TPS (5%)", secondary: "TVQ (9,975%)" },
        };
      }
      case "ontario": {
        // Ontario: TVH 13% (simple)
        const HST = subtotal * 0.13;
        return {
          TPS: 0,
          TVQ: 0,
          PST: 0,
          HST,
          TVD: 0,
          total: HST,
          breakdown: false,
          labels: { primary: "TVH (13%)", secondary: "" },
        };
      }
      case "alberta": {
        // Alberta: TPS 5% (simple)
        const TPS = subtotal * 0.05;
        return {
          TPS,
          TVQ: 0,
          PST: 0,
          HST: 0,
          TVD: 0,
          total: TPS,
          breakdown: false,
          labels: { primary: "TPS (5%)", secondary: "" },
        };
      }
      case "british-columbia": {
        // BC: TPS 5% + PST 10% (PST sur prix + TPS)
        const TPS = subtotal * 0.05;
        const PST = (subtotal + TPS) * 0.10;
        return {
          TPS,
          TVQ: 0,
          PST,
          HST: 0,
          TVD: 0,
          total: TPS + PST,
          breakdown: true,
          labels: { primary: "TPS (5%)", secondary: "PST (10%)" },
        };
      }
      case "manitoba": {
        // Manitoba: TPS 5% + TVD 7% (TVD sur prix + TPS)
        const TPS = subtotal * 0.05;
        const TVD = (subtotal + TPS) * 0.07;
        return {
          TPS,
          TVQ: 0,
          PST: 0,
          HST: 0,
          TVD,
          total: TPS + TVD,
          breakdown: true,
          labels: { primary: "TPS (5%)", secondary: "TVD (7%)" },
        };
      }
      case "saskatchewan": {
        // Saskatchewan: TPS 5% + PST 6% (PST sur prix + TPS)
        const TPS = subtotal * 0.05;
        const PST = (subtotal + TPS) * 0.06;
        return {
          TPS,
          TVQ: 0,
          PST,
          HST: 0,
          TVD: 0,
          total: TPS + PST,
          breakdown: true,
          labels: { primary: "TPS (5%)", secondary: "PST (6%)" },
        };
      }
      case "new-brunswick":
      case "nova-scotia":
      case "prince-edward-island":
      case "newfoundland": {
        // NB, NS, PEI, Terre-Neuve: HST 15% (simple)
        const HST = subtotal * 0.15;
        return {
          TPS: 0,
          TVQ: 0,
          PST: 0,
          HST,
          TVD: 0,
          total: HST,
          breakdown: false,
          labels: { primary: "HST (15%)", secondary: "" },
        };
      }
      default: {
        // Pour les autres régions (custom ou autres pays), utiliser le taux simple
        const { taxRate } = getTaxSettings();
        return {
          TPS: 0,
          TVQ: 0,
          PST: 0,
          HST: 0,
          TVD: 0,
          total: subtotal * taxRate,
          breakdown: false,
          labels: { primary: `${t.sales.tax}`, secondary: "" },
        };
      }
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0,
  );
  const taxCalculation = calculateTax(subtotal);
  const tax = taxCalculation.total;
  // Le pourboire ne s'ajoute au total que si c'est par carte
  const tipAmount = paymentMethod === "card" ? tip : 0;
  const total = subtotal + tax + tipAmount;

  const handleCheckout = () => {
    if (paymentMethod === "cash") {
      alert(`${t.sales.alerts.cashPayment}$${(subtotal + tax).toFixed(2)}`);
      setCart([]);
      setPaymentMethod(null);
      setTip(0);
      setTipPercentage(null);
    } else if (paymentMethod === "card") {
      setShowPaymentModal(true);
    } else if (paymentMethod === "tab") {
      if (selectedTabId) {
        // Add items to existing tab
        const tab = openTabs.find(t => t.id === selectedTabId);
        if (tab) {
          const updatedTabs = openTabs.map(t => {
            if (t.id === selectedTabId) {
              const mergedItems = [...t.items];
              cart.forEach(cartItem => {
                const existing = mergedItems.find(i => i.id === cartItem.id);
                if (existing) {
                  existing.cartQuantity += cartItem.cartQuantity;
                } else {
                  mergedItems.push({ ...cartItem });
                }
              });
              const newSubtotal = mergedItems.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);
              const newTaxCalc = calculateTax(newSubtotal);
              const newTax = newTaxCalc.total;
              const newTotal = newSubtotal + newTax;
              return {
                ...t,
                items: mergedItems,
                subtotal: newSubtotal,
                tax: newTax,
                total: newTotal,
              };
            }
            return t;
          });
          setOpenTabs(updatedTabs);
          alert(`${t.sales.tabCreated}: ${tab.name}`);
          setCart([]);
          setPaymentMethod(null);
          setSelectedTabId(null);
        }
      } else {
        // Open new tab
        setShowNewTabDialog(true);
      }
    }
  };

  const handleCreateNewTab = () => {
    if (!newTabName.trim()) {
      alert("Veuillez entrer un nom de compte");
      return;
    }
    
    // Credit card is optional, but if provided, validate it
    let last4Digits: string | undefined;
    if (newTabCreditCard.trim()) {
      const cleanedCard = newTabCreditCard.replace(/\s+/g, "");
      if (cleanedCard.length < 13 || cleanedCard.length > 19 || !/^\d+$/.test(cleanedCard)) {
        alert("Veuillez entrer un numéro de carte de crédit valide");
        return;
      }
      // Store only last 4 digits for security
      last4Digits = cleanedCard.slice(-4);
    }
    
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      name: newTabName.trim(),
      creditCard: last4Digits,
      items: [...cart],
      createdAt: new Date(),
      subtotal,
      tax,
      total,
      status: "open", // New tabs are open
    };
    
    setOpenTabs([...openTabs, newTab]);
    setSelectedTabId(newTab.id);
    alert(`${t.sales.tabCreated}: ${newTab.name}`);
    setCart([]);
    setPaymentMethod(null);
    setNewTabName("");
    setNewTabCreditCard("");
    setShowNewTabDialog(false);
  };

  const handlePayTab = (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (!tab) return;
    
    setShowPaymentModal(true);
    // Store tab ID temporarily to close it after payment
    (window as any).__payingTabId = tabId;
  };

  const handleCloseTab = (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (!tab) return;
    
    // Prevent closing tab if it's still open (not paid)
    if (tab.status === "open") {
      alert("Ce compte doit être payé avant de pouvoir le fermer");
      return;
    }
    
    if (confirm(`${t.sales.closeTab}?`)) {
      setOpenTabs(openTabs.filter(t => t.id !== tabId));
      if (selectedTabId === tabId) {
        setSelectedTabId(null);
      }
    }
  };

  const handlePaymentComplete = async () => {
    // Enregistrer la vente dans Firestore
    if (user?.uid && cart.length > 0) {
      try {
        const method = paymentMethod === "tab" ? "other" : (paymentMethod || "cash");
        
        const saleData = {
          items: cart.map(item => {
            const itemData: any = {
              name: item.name,
              quantity: item.cartQuantity,
              price: item.price,
              category: item.category,
            };
            if (item.isRecipe) {
              itemData.recipeId = item.id;
            } else {
              itemData.productId = item.id;
            }
            return itemData;
          }),
          total: total,
          subtotal: subtotal,
          tax: tax,
          tip: tip > 0 ? tip : undefined,
          paymentMethod: method as "cash" | "card" | "stripe" | "other",
          userId: user.uid,
        };
        
        const result = await createSale(user.uid, saleData);
        console.log("[Sales] ✅ Vente enregistrée avec ID:", result.id);
        
        toast({
          title: "Succès",
          description: "Vente enregistrée dans l'historique",
          variant: "default",
        });
      } catch (error: any) {
        console.error("[Sales] ❌ Erreur enregistrement vente:", error);
        console.error("[Sales] Détails erreur:", error.message || error);
        toast({
          title: "Avertissement",
          description: `Vente effectuée mais erreur d'enregistrement: ${error.message || "Erreur inconnue"}`,
          variant: "destructive",
        });
      }
    } else {
      console.warn("[Sales] ⚠️ Impossible d'enregistrer: user?.uid=", user?.uid, "cart.length=", cart.length);
    }
    
    await updateInventoryAfterSale(cart);
    setCart([]);
    setPaymentMethod(null);
    setTip(0);
    setTipPercentage(null);
    setShowPaymentModal(false);
    
    alert(`${t.sales.alerts.orderCompleted}$${total.toFixed(2)}`);
  };

  const handleTabPaymentComplete = async () => {
    const payingTabId = (window as any).__payingTabId;
    if (!payingTabId) return;
    
    const tab = openTabs.find(t => t.id === payingTabId);
    if (!tab) return;
    
    // Update inventory for tab items
    const updatedProducts = [...inventoryProducts];
    tab.items.forEach(cartItem => {
          const product = updatedProducts.find(p => p.id === cartItem.id);
          if (product) {
            product.quantity = Math.max(0, product.quantity - cartItem.cartQuantity);
          } else {
            const recipe = recipes.find(r => r.id === cartItem.id);
            if (recipe) {
              recipe.ingredients.forEach(ing => {
                const invProduct = updatedProducts.find(p => p.id === ing.productId);
                if (invProduct) {
                  if (ing.unit === "ml" || ing.unit === "oz") {
                    // Convert oz to ml if needed
                    const quantityToRemoveInMl = (ing.unit === "oz")
                      ? ozToMl(ing.quantity * cartItem.cartQuantity)
                      : (ing.quantity * cartItem.cartQuantity);
                    
                    const productQuantityInMl = (invProduct as any).quantityInMl || 0;
                    if (productQuantityInMl > 0) {
                      const currentMl = productQuantityInMl * invProduct.quantity;
                      const newMl = Math.max(0, currentMl - quantityToRemoveInMl);
                      invProduct.quantity = Math.ceil(newMl / productQuantityInMl);
                    } else {
                      const mlPerBottle = invProduct.unit.includes("bottle") 
                        ? (invProduct.category === "beer" ? 330 : 750)
                        : 750;
                      const bottlesToRemove = quantityToRemoveInMl / mlPerBottle;
                      invProduct.quantity = Math.max(0, invProduct.quantity - bottlesToRemove);
                    }
                  } else {
                    invProduct.quantity = Math.max(0, invProduct.quantity - (ing.quantity * cartItem.cartQuantity));
                  }
                }
              });
            }
          }
        });
        
        // Update inventory in Firestore
        for (const product of updatedProducts) {
          try {
            if (user?.uid) {
              await updateProduct(user.uid, product.id, {
                quantity: product.quantity,
              });
            }
          } catch (error) {
            console.error(`Error updating product ${product.id}:`, error);
          }
        }
        
        setInventoryProducts(updatedProducts);
        localStorage.setItem("products", JSON.stringify(updatedProducts));

        // Enregistrer la vente de l'addition dans Firestore
        if (user?.uid && tab.items.length > 0) {
          try {
            console.log("[Sales] Enregistrement vente d'addition pour tab:", tab.name);
            
            const tabSaleData = {
              items: tab.items.map(item => ({
                productId: item.isRecipe ? undefined : item.id,
                recipeId: item.isRecipe ? item.id : undefined,
                name: item.name,
                quantity: item.cartQuantity,
                price: item.price,
                category: item.category,
              })),
              total: tab.total,
              subtotal: tab.subtotal,
              tax: tab.tax,
              paymentMethod: "card" as const,
              userId: user.uid,
              tableNumber: tab.name,
            };
            
            console.log("[Sales] Données d'addition:", tabSaleData);
            const result = await createSale(user.uid, tabSaleData);
            console.log("[Sales] ✅ Vente d'addition enregistrée dans Firestore:", result);
          } catch (error: any) {
            console.error("[Sales] ❌ Erreur enregistrement vente d'addition:", error);
            console.error("[Sales] Détails erreur:", error.message || error);
          }
        }

        // Mark tab as paid
        setOpenTabs(openTabs.map(t => 
          t.id === payingTabId 
            ? { ...t, status: "paid" as const }
            : t
        ));
        
        alert(`${t.sales.tabClosed}: ${tab.name} - $${tab.total.toFixed(2)}`);
        if (selectedTabId === payingTabId) {
          setSelectedTabId(null);
        }
        delete (window as any).__payingTabId;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-2xl sm:text-2xl font-bold text-foreground">{t.sales.title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
              {t.sales.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-2 sm:pt-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-secondary border-2 border-foreground/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 sm:p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Mode carte"
                aria-label="Mode carte"
              >
                <Grid3x3 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 sm:p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Mode liste"
                aria-label="Mode liste"
              >
                <List className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <button
              onClick={() => setShowRecipeDialog(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold transition-all hover:opacity-90 whitespace-nowrap text-sm sm:text-base"
            >
              <Wine className="h-4 w-4 sm:h-5 sm:w-5" />
              + Produits (cocktail, au verres etc...)
            </button>
            {openTabs.length > 0 && (
              <button
                onClick={() => setShowTabsManagement(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors font-medium text-sm sm:text-base"
              >
                <FileText className="h-4 w-4" />
                {t.sales.tabs} ({openTabs.length})
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.map((cat) => {
                // Couleur pour "all" (neutre)
                const allColor = "bg-primary text-primary-foreground";
                const allColorInactive = "bg-secondary text-muted-foreground hover:text-foreground";
                
                // Couleurs spécifiques par catégorie (version simplifiée pour les boutons)
                const categoryButtonColors: Record<string, string> = {
                  spirits: "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 border-2 border-slate-400 dark:border-slate-500",
                  wine: "bg-red-200 dark:bg-red-600 text-red-800 dark:text-red-100 border-2 border-red-400 dark:border-red-500",
                  beer: "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 border-2 border-slate-400 dark:border-slate-500",
                  soda: "bg-cyan-200 dark:bg-cyan-600 text-cyan-800 dark:text-cyan-100 border-2 border-cyan-400 dark:border-cyan-500",
                  juice: "bg-orange-200 dark:bg-orange-600 text-orange-800 dark:text-orange-100 border-2 border-orange-400 dark:border-orange-500",
                  other: "bg-green-200 dark:bg-green-600 text-green-800 dark:text-green-100 border-2 border-green-400 dark:border-green-500",
                  cocktail: "bg-indigo-200 dark:bg-indigo-600 text-indigo-800 dark:text-indigo-100 border-2 border-indigo-400 dark:border-indigo-500",
                };
                
                const isActive = filterCategory === cat;
                const activeColor = cat === "all" ? allColor : categoryButtonColors[cat] || allColor;
                const inactiveColor = "bg-secondary/50 text-muted-foreground hover:bg-secondary border-2 border-foreground/20";
                
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                      isActive ? activeColor : inactiveColor
                    }`}
                  >
                    {categoryLabels[cat]}
                  </button>
                );
              })}
            </div>

            {/* Products Display - Grid or List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredProducts.map((product) => {
                  const isRecipe = 'ingredients' in product;
                  const availableQuantity = isRecipe 
                    ? calculateRecipeAvailability(product as Recipe)
                    : (product as Product).quantity;
                  
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={availableQuantity <= 0}
                      className={`p-3 rounded-lg border-2 border-foreground/30 transition-all text-left hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col h-full min-h-[120px] ${categoryColors[product.category]}`}
                    >
                      <p className="font-bold text-base line-clamp-2 min-h-[2.5rem] mb-2">
                        {product.name}
                      </p>
                      <div className="mt-auto">
                        <p className="text-sm font-medium text-muted-foreground">
                          ${product.price.toFixed(2)}
                        </p>
                        <p className="text-[10px] opacity-60 mt-0.5">
                          {!isRecipe 
                            ? `${translateUnit((product as Product).unit)} - Stock: ${availableQuantity}`
                            : `Recette - Disponible: ${availableQuantity > 0 ? "Oui" : "Non"}`
                          }
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredProducts.map((product) => {
                  const isRecipe = 'ingredients' in product;
                  const availableQuantity = isRecipe 
                    ? calculateRecipeAvailability(product as Recipe)
                    : (product as Product).quantity;
                  
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={availableQuantity <= 0}
                      className={`w-full p-3 sm:p-4 rounded-lg border-2 border-foreground/30 transition-all text-left hover:border-primary/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 sm:gap-4 ${categoryColors[product.category]}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm sm:text-base line-clamp-1 mb-1">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-3 sm:gap-4 text-sm">
                          <p className="font-semibold text-foreground">
                            ${product.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {!isRecipe 
                              ? `${translateUnit((product as Product).unit)} - Stock: ${availableQuantity}`
                              : `Recette - Disponible: ${availableQuantity > 0 ? "Oui" : "Non"}`
                            }
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="space-y-4">
            <div className="bg-card border-2 border-foreground/20 rounded-lg p-4 space-y-4">
              <h3 className="font-bold text-lg text-foreground">
                {t.sales.orderSummary}
              </h3>

              {/* Cart Items */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    {t.sales.noItemsInCart}
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-secondary rounded border-2 border-foreground/20"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${item.price.toFixed(2)} {t.sales.each}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cartQuantity - 1)
                          }
                          className="p-1 hover:bg-background rounded transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center font-semibold">
                          {item.cartQuantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cartQuantity + 1)
                          }
                          className="p-1 hover:bg-background rounded transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-destructive/20 rounded transition-colors text-destructive"
                          aria-label="Remove from cart"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t-2 border-foreground/20 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.sales.subtotal}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {taxCalculation.breakdown ? (
                  <>
                <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{taxCalculation.labels.primary}</span>
                      <span>${(taxCalculation.TPS > 0 ? taxCalculation.TPS : taxCalculation.HST || 0).toFixed(2)}</span>
                    </div>
                    {taxCalculation.labels.secondary && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{taxCalculation.labels.secondary}</span>
                        <span>${(taxCalculation.TVQ || taxCalculation.PST || taxCalculation.TVD || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{taxCalculation.labels.primary || t.sales.tax}</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                )}
                
                {/* Tip Section */}
                {cart.length > 0 && (
                  <div className="border-t border-foreground/10 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pourboire</span>
                      <span className="font-medium">${tip.toFixed(2)}</span>
                    </div>
                    {paymentMethod === "card" && (
                      <>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[10, 15, 18, 20].map((percent) => (
                            <button
                              key={percent}
                              onClick={() => {
                                const calculatedTip = (subtotal + tax) * (percent / 100);
                                setTip(calculatedTip);
                                setTipPercentage(percent);
                              }}
                              className={`py-1.5 px-2 text-xs rounded transition-colors ${
                                tipPercentage === percent
                                  ? "bg-primary text-primary-foreground font-semibold"
                                  : "bg-secondary hover:bg-secondary/80 text-foreground"
                              }`}
                            >
                              {percent}%
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1.5">
                          <Input
                            type="number"
                            placeholder="Montant personnalisé"
                            value={tip > 0 && tipPercentage === null ? tip : ""}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              setTip(value);
                              setTipPercentage(null);
                            }}
                            className="text-sm h-8"
                            min="0"
                            step="0.01"
                          />
                          {tip > 0 && (
                            <button
                              onClick={() => {
                                setTip(0);
                                setTipPercentage(null);
                              }}
                              className="px-3 py-1.5 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 rounded transition-colors"
                            >
                              Effacer
                            </button>
                          )}
                        </div>
                      </>
                    )}
                    {paymentMethod === "cash" && (
                      <p className="text-xs text-muted-foreground italic">
                        Le client ajoutera le pourboire en espèces
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold border-t-2 border-foreground/20 pt-2">
                  <span>{t.sales.total}</span>
                  <span className="text-foreground">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              {cart.length > 0 && (
                <div className="space-y-2 border-t-2 border-foreground/20 pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    {t.sales.paymentMethod}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-colors font-medium text-sm ${
                        paymentMethod === "cash"
                          ? "bg-success text-success-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <DollarSign className="h-4 w-4" />
                      {t.sales.cash}
                    </button>
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-colors font-medium text-sm ${
                        paymentMethod === "card"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      {t.sales.card}
                    </button>
                    <button
                      onClick={() => {
                        setPaymentMethod("tab");
                        if (openTabs.length > 0 && !selectedTabId) {
                          setShowTabsList(true);
                        }
                      }}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-colors font-medium text-sm ${
                        paymentMethod === "tab"
                          ? "bg-red-900 text-white"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <UserPlus className="h-4 w-4" />
                      {t.sales.tab}
                    </button>
                  </div>
                  
                  {/* Tab Selection */}
                  {paymentMethod === "tab" && (
                    <div className="space-y-2 mt-2">
                      {selectedTabId ? (
                        <div className="flex items-center justify-between p-2 bg-red-900/10 border border-red-900/30 rounded">
                          <span className="text-sm font-medium">
                            {openTabs.find(t => t.id === selectedTabId)?.name}
                          </span>
                          <button
                            onClick={() => setSelectedTabId(null)}
                            className="text-red-900 hover:text-red-800"
                            aria-label="Clear tab selection"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowTabsList(true)}
                          className="w-full py-2 text-sm border-2 border-foreground/20 rounded-lg hover:bg-secondary"
                        >
                          {t.sales.selectTab}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Open Tab Button */}
              <button
                onClick={() => {
                  if (cart.length === 0) {
                    alert("Veuillez d'abord ajouter des articles au panier");
                    return;
                  }
                  setShowNewTabDialog(true);
                }}
                disabled={cart.length === 0}
                className="w-full py-3 bg-red-900 text-white rounded-lg font-bold transition-all hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {t.sales.openTab}
              </button>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || !paymentMethod}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.sales.completeSale}
              </button>

              {/* Pay Tab Button - Quick Access */}
              {openTabs.length > 0 && (
                <button
                  onClick={() => setShowPayTabDialog(true)}
                  className="w-full py-3 bg-red-900 text-white rounded-lg font-bold transition-all hover:bg-red-800 flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {t.sales.payTab} ({openTabs.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        amount={(window as any).__payingTabId 
          ? openTabs.find(t => t.id === (window as any).__payingTabId)?.total || total
          : total}
        subtotal={(window as any).__payingTabId 
          ? openTabs.find(t => t.id === (window as any).__payingTabId)?.subtotal || subtotal
          : subtotal}
        tax={(window as any).__payingTabId 
          ? openTabs.find(t => t.id === (window as any).__payingTabId)?.tax || tax
          : tax}
        taxBreakdown={{
          TPS: taxCalculation.TPS,
          TVQ: taxCalculation.TVQ,
          PST: taxCalculation.PST,
          HST: taxCalculation.HST,
          TVD: taxCalculation.TVD,
        }}
        taxLabels={taxCalculation.labels}
        tip={tip}
        onClose={() => {
          setShowPaymentModal(false);
          delete (window as any).__payingTabId;
        }}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* New Tab Dialog */}
      <Dialog open={showNewTabDialog} onOpenChange={setShowNewTabDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.sales.openNewTab}</DialogTitle>
            <DialogDescription>
              {t.sales.tabNamePlaceholder}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tabName">{t.sales.tabName}</Label>
              <Input
                id="tabName"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                placeholder={t.sales.tabNamePlaceholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTabName.trim()) {
                    handleCreateNewTab();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tabCreditCard">
                {t.sales.creditCardNumber} <span className="text-muted-foreground text-xs">(optionnel)</span>
              </Label>
              <Input
                id="tabCreditCard"
                type="text"
                value={newTabCreditCard}
                onChange={(e) => {
                  // Format credit card number with spaces every 4 digits
                  const value = e.target.value.replace(/\s+/g, "").replace(/\D/g, "");
                  const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                  setNewTabCreditCard(formatted);
                }}
                placeholder="1234 5678 9012 3456 (optionnel)"
                maxLength={19} // 16 digits + 3 spaces
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTabName.trim()) {
                    handleCreateNewTab();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                {t.sales.creditCardInfo}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowNewTabDialog(false);
              setNewTabName("");
              setNewTabCreditCard("");
            }}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreateNewTab} disabled={!newTabName.trim()}>
              {t.sales.openTab}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs List Dialog */}
      <Dialog open={showTabsList} onOpenChange={setShowTabsList}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.sales.tabs}</DialogTitle>
            <DialogDescription>
              {t.sales.selectTab}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto py-4">
            {openTabs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t.sales.noOpenTabs}
              </p>
            ) : (
              openTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`p-4 border rounded-lg space-y-2 ${
                    selectedTabId === tab.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{tab.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tab.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        ${tab.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tab.items.length} {tab.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedTabId(tab.id);
                        setShowTabsList(false);
                      }}
                    >
                      {t.sales.selectTab}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePayTab(tab.id)}
                    >
                      {t.sales.payTab}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCloseTab(tab.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewTabDialog(true);
                setShowTabsList(false);
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t.sales.openNewTab}
            </Button>
            <Button onClick={() => setShowTabsList(false)}>
              {t.common.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs Management Dialog */}
      <Dialog open={showTabsManagement} onOpenChange={setShowTabsManagement}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t.sales.tabsManagement}
            </DialogTitle>
            <DialogDescription>
              {openTabs.length} {openTabs.length === 1 ? "compte ouvert" : "comptes ouverts"} pour la soirée
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {openTabs.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t.sales.noOpenTabs}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {openTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className="border rounded-lg p-4 space-y-3 bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{tab.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {t.sales.creditCardNumber}: •••• {tab.creditCard}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(tab.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Articles</p>
                            <p className="font-semibold">{tab.items.length}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t.sales.subtotal}</p>
                            <p className="font-semibold">${tab.subtotal.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t.sales.total}</p>
                            <p className="font-bold text-foreground text-lg">${tab.total.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tab Items List */}
                    {selectedTabForDetails === tab.id && (
                      <div className="mt-4 pt-4 border-t space-y-2 max-h-64 overflow-y-auto">
                        <h4 className="font-medium text-sm mb-2">Détails des articles :</h4>
                        {tab.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 bg-secondary rounded text-sm"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ${item.price.toFixed(2)} {t.sales.each} × {item.cartQuantity}
                              </p>
                            </div>
                            <p className="font-semibold">
                              ${(item.price * item.cartQuantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTabForDetails(
                            selectedTabForDetails === tab.id ? null : tab.id
                          );
                        }}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {selectedTabForDetails === tab.id ? t.sales.hideDetails : t.sales.viewDetails}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          handlePayTab(tab.id);
                          setShowTabsManagement(false);
                        }}
                        className="flex-1"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {t.sales.payTab}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCloseTab(tab.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {t.sales.allTabsTotal}:{" "}
                <span className="font-bold text-foreground">
                  ${openTabs.reduce((sum, tab) => sum + tab.total, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewTabDialog(true);
                    setShowTabsManagement(false);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t.sales.openNewTab}
                </Button>
                <Button onClick={() => setShowTabsManagement(false)}>
                  {t.common.close}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Tab Dialog - Quick Access */}
      <Dialog open={showPayTabDialog} onOpenChange={setShowPayTabDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t.sales.payTab}
            </DialogTitle>
            <DialogDescription>
              {t.sales.selectTab}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-96 overflow-y-auto py-4">
            {openTabs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t.sales.noOpenTabs}
              </p>
            ) : (
              openTabs.map((tab) => (
                <div
                  key={tab.id}
                  className="p-4 border rounded-lg space-y-2 hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => {
                    handlePayTab(tab.id);
                    setShowPayTabDialog(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{tab.name}</p>
                      {tab.creditCard && (
                        <p className="text-xs text-muted-foreground">
                          {t.sales.creditCardNumber}: •••• {tab.creditCard}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {new Date(tab.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground text-lg">
                        ${tab.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tab.items.length} {tab.items.length === 1 ? "article" : "articles"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{t.sales.subtotal}: ${tab.subtotal.toFixed(2)}</span>
                    {(() => {
                      const taxCalc = calculateTax(tab.subtotal);
                      if (taxCalc.breakdown) {
                        return (
                          <>
                    <span>•</span>
                            <span>{taxCalc.labels.primary}: ${(taxCalc.TPS > 0 ? taxCalc.TPS : taxCalc.HST || 0).toFixed(2)}</span>
                            {taxCalc.labels.secondary && (
                              <>
                                <span>•</span>
                                <span>{taxCalc.labels.secondary}: ${(taxCalc.TVQ || taxCalc.PST || taxCalc.TVD || 0).toFixed(2)}</span>
                              </>
                            )}
                          </>
                        );
                      } else {
                        return (
                          <>
                            <span>•</span>
                            <span>{taxCalc.labels.primary || t.sales.tax}: ${tab.tax.toFixed(2)}</span>
                          </>
                        );
                      }
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTabsManagement(true);
                setShowPayTabDialog(false);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              {t.sales.manageTabs}
            </Button>
            <Button onClick={() => setShowPayTabDialog(false)}>
              {t.common.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipe Creation Dialog */}
      <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Wine className="h-5 w-5" />
              Créer un produit
            </DialogTitle>
            <DialogDescription className="text-xs">
              Sélectionnez le type, la catégorie, les ingrédients et le prix
            </DialogDescription>
          </DialogHeader>
          <RecipeForm
            inventoryProducts={inventoryProducts}
            onSave={async (recipe) => {
              try {
                // Sauvegarder la recette dans Firestore
                if (user?.uid) {
                  // Map local category to Firestore schema (cocktail or mocktail)
                  const firestoreCategory: "cocktail" | "mocktail" = 
                    recipe.category === "other" ? "mocktail" : "cocktail";
                  
                  await createRecipe(user.uid, {
                    name: recipe.name,
                    category: firestoreCategory,
                    ingredients: recipe.ingredients,
                    instructions: [],
                    userId: user.uid,
                  });
                  setRecipes([...recipes, recipe]);
                  setShowRecipeDialog(false);
                  toast({
                    title: "Produit créé",
                    description: `${recipe.name} a été ajouté avec succès`,
                  });
                } else {
                  throw new Error("Utilisateur non authentifié");
                }
              } catch (error) {
                console.error("Erreur lors de la création du produit:", error);
                toast({
                  title: "Erreur",
                  description: "Impossible de créer le produit",
                  variant: "destructive",
                });
              }
            }}
            onCancel={() => setShowRecipeDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

// Convert ounces to ml (1 oz = 29.5735 ml) - Utility function
const ozToMlRecipe = (oz: number): number => oz * 29.5735;

// Recipe Form Component
interface RecipeFormProps {
  inventoryProducts: Product[];
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

// Recettes traditionnelles préétablies
const PRESET_RECIPES: Partial<Recipe>[] = [
  // Cocktails classiques
  { name: "Mojito", category: "cocktail", ingredients: [
    { productName: "Rhum blanc", quantity: 50, unit: "ml" },
    { productName: "Menthe fraîche", quantity: 10, unit: "unit" },
    { productName: "Sucre", quantity: 2, unit: "unit" },
    { productName: "Lime", quantity: 1, unit: "unit" },
    { productName: "Soda", quantity: 100, unit: "ml" }
  ]},
  { name: "Margarita", category: "cocktail", ingredients: [
    { productName: "Tequila", quantity: 50, unit: "ml" },
    { productName: "Triple sec", quantity: 25, unit: "ml" },
    { productName: "Jus de lime", quantity: 25, unit: "ml" }
  ]},
  { name: "Piña Colada", category: "cocktail", ingredients: [
    { productName: "Rhum blanc", quantity: 50, unit: "ml" },
    { productName: "Crème de coco", quantity: 30, unit: "ml" },
    { productName: "Jus d'ananas", quantity: 90, unit: "ml" }
  ]},
  { name: "Cosmopolitan", category: "cocktail", ingredients: [
    { productName: "Vodka", quantity: 40, unit: "ml" },
    { productName: "Triple sec", quantity: 15, unit: "ml" },
    { productName: "Jus de lime", quantity: 15, unit: "ml" },
    { productName: "Jus de canneberge", quantity: 30, unit: "ml" }
  ]},
  { name: "Manhattan", category: "cocktail", ingredients: [
    { productName: "Whisky", quantity: 50, unit: "ml" },
    { productName: "Vermouth rouge", quantity: 25, unit: "ml" },
    { productName: "Angostura bitters", quantity: 2, unit: "unit" }
  ]},
  { name: "Old Fashioned", category: "cocktail", ingredients: [
    { productName: "Bourbon", quantity: 60, unit: "ml" },
    { productName: "Sucre", quantity: 1, unit: "unit" },
    { productName: "Angostura bitters", quantity: 3, unit: "unit" }
  ]},
  { name: "Daiquiri", category: "cocktail", ingredients: [
    { productName: "Rhum blanc", quantity: 60, unit: "ml" },
    { productName: "Jus de lime", quantity: 30, unit: "ml" },
    { productName: "Sirop simple", quantity: 15, unit: "ml" }
  ]},
  { name: "Sex on the Beach", category: "cocktail", ingredients: [
    { productName: "Vodka", quantity: 40, unit: "ml" },
    { productName: "Peach schnapps", quantity: 20, unit: "ml" },
    { productName: "Jus d'orange", quantity: 40, unit: "ml" },
    { productName: "Jus de canneberge", quantity: 40, unit: "ml" }
  ]},
  { name: "Long Island Iced Tea", category: "cocktail", ingredients: [
    { productName: "Vodka", quantity: 15, unit: "ml" },
    { productName: "Rhum blanc", quantity: 15, unit: "ml" },
    { productName: "Gin", quantity: 15, unit: "ml" },
    { productName: "Tequila", quantity: 15, unit: "ml" },
    { productName: "Triple sec", quantity: 15, unit: "ml" },
    { productName: "Jus de citron", quantity: 25, unit: "ml" },
    { productName: "Cola", quantity: 30, unit: "ml" }
  ]},
  { name: "Mai Tai", category: "cocktail", ingredients: [
    { productName: "Rhum blanc", quantity: 30, unit: "ml" },
    { productName: "Rhum brun", quantity: 30, unit: "ml" },
    { productName: "Triple sec", quantity: 15, unit: "ml" },
    { productName: "Jus de lime", quantity: 15, unit: "ml" },
    { productName: "Sirop d'orgeat", quantity: 15, unit: "ml" }
  ]},
  
  // Mocktails
  { name: "Virgin Mojito", category: "other", ingredients: [
    { productName: "Menthe fraîche", quantity: 10, unit: "unit" },
    { productName: "Sucre", quantity: 2, unit: "unit" },
    { productName: "Lime", quantity: 1, unit: "unit" },
    { productName: "Soda", quantity: 150, unit: "ml" }
  ]},
  { name: "Shirley Temple", category: "other", ingredients: [
    { productName: "Ginger ale", quantity: 120, unit: "ml" },
    { productName: "Grenadine", quantity: 15, unit: "ml" },
    { productName: "Jus d'orange", quantity: 30, unit: "ml" }
  ]},
  { name: "Virgin Piña Colada", category: "other", ingredients: [
    { productName: "Crème de coco", quantity: 30, unit: "ml" },
    { productName: "Jus d'ananas", quantity: 120, unit: "ml" }
  ]},
  
  // Shots
  { name: "Tequila Shot", category: "spirits", ingredients: [
    { productName: "Tequila", quantity: 44, unit: "ml" }
  ]},
  { name: "Vodka Shot", category: "spirits", ingredients: [
    { productName: "Vodka", quantity: 44, unit: "ml" }
  ]},
  { name: "Whisky Shot", category: "spirits", ingredients: [
    { productName: "Whisky", quantity: 44, unit: "ml" }
  ]},
  { name: "B-52", category: "spirits", ingredients: [
    { productName: "Kahlúa", quantity: 15, unit: "ml" },
    { productName: "Baileys", quantity: 15, unit: "ml" },
    { productName: "Grand Marnier", quantity: 15, unit: "ml" }
  ]},
  { name: "Jägerbomb", category: "spirits", ingredients: [
    { productName: "Jägermeister", quantity: 44, unit: "ml" },
    { productName: "Red Bull", quantity: 250, unit: "ml" }
  ]},
];

function RecipeForm({ inventoryProducts, onSave, onCancel }: RecipeFormProps) {
  const { t } = useI18n();
  
  // Step 1: Type de service
  const [serviceType, setServiceType] = useState<"glass" | "shot" | "cocktail" | "bottle" | "">(""); 
  
  // Step 2: Catégorie
  const [recipeCategory, setRecipeCategory] = useState<"spirits" | "wine" | "beer" | "soda" | "juice" | "other" | "cocktail">("spirits");
  
  // Marge de profit désirée (en %)
  const [profitMargin, setProfitMargin] = useState("30");
  
  // Prix de vente (pré-rempli avec le prix suggéré)
  const [recipePrice, setRecipePrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Step 4: Ingrédients
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [ingredientQuantity, setIngredientQuantity] = useState("");
  const [ingredientUnit, setIngredientUnit] = useState("ml");

  // Suggérer des produits de l'inventaire basés sur la recherche
  const getSuggestedProducts = (): Product[] => {
    let filteredProducts = [...inventoryProducts];
    
    // Filtrer par catégorie (Point 2) - toujours appliqué
    if (recipeCategory === "wine") {
      filteredProducts = filteredProducts.filter(p => p.category === "wine");
    } else if (recipeCategory === "beer") {
      filteredProducts = filteredProducts.filter(p => p.category === "beer");
    } else if (recipeCategory === "spirits") {
      filteredProducts = filteredProducts.filter(p => 
        p.category === "spirits" || 
        p.name.toLowerCase().includes("vodka") ||
        p.name.toLowerCase().includes("rhum") ||
        p.name.toLowerCase().includes("rum") ||
        p.name.toLowerCase().includes("whisky") ||
        p.name.toLowerCase().includes("gin") ||
        p.name.toLowerCase().includes("tequila")
      );
    } else if (recipeCategory === "juice") {
      filteredProducts = filteredProducts.filter(p => p.category === "juice");
    } else if (recipeCategory === "soda") {
      filteredProducts = filteredProducts.filter(p => p.category === "soda");
    }
    
    // Filtrer par type de service (Point 1) - toujours appliqué
    if (serviceType === "glass") {
      // Pour les verres, suggérer vins, bières, jus, sodas
      filteredProducts = filteredProducts.filter(p => 
        p.category === "wine" || 
        p.category === "beer" || 
        p.category === "juice" || 
        p.category === "soda"
      );
    } else if (serviceType === "shot") {
      // Pour les shots, suggérer spiritueux
      filteredProducts = filteredProducts.filter(p => 
        p.category === "spirits" || 
        p.name.toLowerCase().includes("vodka") ||
        p.name.toLowerCase().includes("rhum") ||
        p.name.toLowerCase().includes("rum") ||
        p.name.toLowerCase().includes("whisky") ||
        p.name.toLowerCase().includes("gin") ||
        p.name.toLowerCase().includes("tequila")
      );
    } else if (serviceType === "bottle") {
      // Pour les bouteilles, suggérer bières
      filteredProducts = filteredProducts.filter(p => p.category === "beer");
    }
    
    // Si recherche active, filtrer davantage par texte
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      filteredProducts = filteredProducts.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(query);
        const categoryMatch = product.category.toLowerCase().includes(query);
        
        return nameMatch || categoryMatch;
      });
    }
    
    // Trier par pertinence
    filteredProducts.sort((a, b) => {
      // Priorité 1: Produits en stock (quantité > 0)
      const aHasStock = a.quantity > 0;
      const bHasStock = b.quantity > 0;
      
      if (aHasStock && !bHasStock) return -1;
      if (!aHasStock && bHasStock) return 1;
      
      // Priorité 2: Si recherche active, tri par pertinence du nom
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const aStartsWith = a.name.toLowerCase().startsWith(query);
        const bStartsWith = b.name.toLowerCase().startsWith(query);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
      }
      
      // Priorité 3: Tri alphabétique
      return a.name.localeCompare(b.name);
    });
    
    return filteredProducts.slice(0, 15); // Limiter à 15 suggestions
  };

  const selectSuggestedProduct = (product: Product) => {
    // Fonction conservée pour compatibilité mais non utilisée dans la nouvelle version
    
    // Ajouter le produit comme ingrédient si ce n'est pas déjà fait
    if (!ingredients.some(i => i.productId === product.id)) {
      let defaultQuantity = 44; // 1 shot par défaut
      let defaultUnit = "ml";
      
      // Ajuster selon le type de service
      if (serviceType === "glass") {
        if (product.category === "wine") {
          defaultQuantity = 150; // 5 oz
        } else if (product.category === "beer") {
          defaultQuantity = 473; // 16 oz (pinte)
        } else {
          defaultQuantity = 120; // 4 oz
        }
      } else if (serviceType === "bottle") {
        defaultQuantity = 1;
        defaultUnit = "unit";
      }
      
      setIngredients([{
        productId: product.id,
        productName: product.name,
        quantity: defaultQuantity,
        unit: defaultUnit,
      }]);
    }
    
    setSearchQuery("");
    setShowSuggestions(false);
  };

  // Calculate recipe cost based on ingredients
  const calculateRecipeCost = (): number => {
    if (ingredients.length === 0) return 0;
    
    let totalCost = 0;
    
    ingredients.forEach(ingredient => {
      const product = inventoryProducts.find(p => p.id === ingredient.productId);
      if (!product) return;
      
      // Déterminer la taille totale du produit en ml
      let productSizeInMl = 0;
      
      // Priorité 1: Utiliser bottleSizeInMl du produit s'il existe
      if ((product as any).bottleSizeInMl && (product as any).bottleSizeInMl > 0) {
        productSizeInMl = (product as any).bottleSizeInMl;
      } else if ((product as any).quantityInMl && (product as any).quantityInMl > 0) {
        // Priorité 2: Utiliser la quantité en ml si elle existe
        productSizeInMl = (product as any).quantityInMl;
      } else {
        // Priorité 3: Estimer selon la catégorie et l'unité
        if (product.unit.toLowerCase().includes("bottle") || product.unit.toLowerCase().includes("bouteille")) {
          // Bouteilles standards
          if (product.category === "beer") {
            productSizeInMl = 341; // Bière standard 341ml (12oz)
          } else if (product.category === "wine") {
            productSizeInMl = 750; // Bouteille de vin standard
          } else if (product.category === "spirits") {
            productSizeInMl = 750; // Bouteille de spiritueux standard
          } else {
            productSizeInMl = 750; // Par défaut
          }
        } else if (product.unit.toLowerCase().includes("l") || product.unit.toLowerCase().includes("litre")) {
          // Si l'unité est en litres
          const liters = parseFloat(product.unit.match(/[\d.]+/)?.[0] || "1");
          productSizeInMl = liters * 1000;
        } else if (product.unit.toLowerCase().includes("ml")) {
          // Si l'unité est en ml
          productSizeInMl = parseFloat(product.unit.match(/[\d.]+/)?.[0] || "750");
        } else if (product.unit.toLowerCase().includes("oz")) {
          // Si l'unité est en oz
          const oz = parseFloat(product.unit.match(/[\d.]+/)?.[0] || "25.4");
          productSizeInMl = oz * 29.5735; // Conversion oz vers ml
        } else {
          // Par défaut: 750ml
          productSizeInMl = 750;
        }
      }
      
      // Calculer le coût par ml
      const costPerMl = product.price / productSizeInMl;
      
      // Convertir la quantité de l'ingrédient en ml
      let ingredientQuantityInMl = 0;
      
      if (ingredient.unit === "ml") {
        ingredientQuantityInMl = ingredient.quantity;
      } else if (ingredient.unit === "oz") {
        ingredientQuantityInMl = ingredient.quantity * 29.5735; // Conversion oz vers ml
      } else if (ingredient.unit === "cl") {
        ingredientQuantityInMl = ingredient.quantity * 10; // Conversion cl vers ml
      } else if (ingredient.unit === "l" || ingredient.unit === "litre") {
        ingredientQuantityInMl = ingredient.quantity * 1000; // Conversion litres vers ml
      } else if (ingredient.unit === "unit" || ingredient.unit === "unité") {
        // Pour les unités (ex: 1 citron, 1 sachet), utiliser le coût unitaire
        const costPerUnit = product.price / (product.quantity || 1);
        totalCost += costPerUnit * ingredient.quantity;
        return; // Skip le reste du calcul pour cet ingrédient
      } else {
        // Unité non reconnue, utiliser le coût unitaire
        const costPerUnit = product.price / (product.quantity || 1);
        totalCost += costPerUnit * ingredient.quantity;
        return;
      }
      
      // Ajouter le coût de cet ingrédient au total
      totalCost += costPerMl * ingredientQuantityInMl;
    });
    
    return totalCost;
  };
  
  const recipeCost = calculateRecipeCost();
  
  // Calculer le prix suggéré automatiquement basé sur la marge configurée
  const marginPercentage = parseFloat(profitMargin) || 10;
  const suggestedPrice = recipeCost > 0 ? (recipeCost * (1 + marginPercentage / 100)).toFixed(2) : "";
  
  // Pré-remplir le prix de vente avec le prix suggéré quand des ingrédients sont ajoutés ou marge change
  useEffect(() => {
    if (suggestedPrice && ingredients.length > 0) {
      setRecipePrice(suggestedPrice);
    }
  }, [suggestedPrice, ingredients.length]);

  const addIngredient = () => {
    if (!selectedProductId || !ingredientQuantity) return;
    
    const product = inventoryProducts.find(p => p.id === selectedProductId);
    if (!product) return;
    
    const quantity = parseFloat(ingredientQuantity);
    if (isNaN(quantity) || quantity <= 0) return;
    
    if (ingredients.some(i => i.productId === selectedProductId)) {
      alert("Ce produit est déjà dans la recette");
      return;
    }
    
    setIngredients([...ingredients, {
      productId: selectedProductId,
      productName: product.name,
      quantity,
      unit: ingredientUnit,
    }]);
    
    setSelectedProductId("");
    setIngredientQuantity("");
    setIngredientUnit("ml");
  };

  const removeIngredient = (productId: string) => {
    setIngredients(ingredients.filter(i => i.productId !== productId));
  };

  const handleSave = () => {
    if (!serviceType) {
      alert("Veuillez sélectionner un type de service");
      return;
    }
    if (ingredients.length === 0) {
      alert("Veuillez ajouter au moins un ingrédient");
      return;
    }
    if (!recipePrice.trim() || parseFloat(recipePrice) <= 0) {
      alert("Veuillez entrer un prix de vente valide");
      return;
    }
    
    // Générer un nom automatique basé sur les ingrédients
    const recipeName = ingredients.length === 1
      ? ingredients[0].productName
      : `${ingredients[0].productName} + ${ingredients.length - 1} autre${ingredients.length > 2 ? 's' : ''}`;

    const recipe: Recipe = {
      id: `recipe-${Date.now()}`,
      name: recipeName,
      price: parseFloat(recipePrice),
      ingredients,
      category: recipeCategory,
    };

    onSave(recipe);
    
    // Reset form
    setServiceType("");
    setRecipeCategory("spirits");
    setProfitMargin("30");
    setRecipePrice("");
    setIngredients([]);
  };

  return (
    <div className="space-y-3 py-2">
      {/* Étape 1: Type de service */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">1. Type de service</Label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setServiceType("glass")}
            className={`p-2 border-2 rounded-lg text-left transition-all text-sm ${
              serviceType === "glass"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-semibold text-sm">Verre</div>
            <div className="text-xs text-muted-foreground">Vin, Bière</div>
          </button>
          
          <button
            onClick={() => setServiceType("shot")}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              serviceType === "shot"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-semibold">Shot</div>
            <div className="text-xs text-muted-foreground">44ml (1.5 oz)</div>
          </button>
          
          <button
            onClick={() => setServiceType("cocktail")}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              serviceType === "cocktail"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-semibold">Cocktail</div>
            <div className="text-xs text-muted-foreground">Mélange de plusieurs ingrédients</div>
          </button>
          
          <button
            onClick={() => setServiceType("bottle")}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              serviceType === "bottle"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-semibold">Bouteille</div>
            <div className="text-xs text-muted-foreground">Bière en bouteille</div>
          </button>
        </div>
      </div>

      {serviceType && (
        <>
          {/* Étape 2: Catégorie */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">2. Catégorie</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {["spirits", "wine", "beer", "soda", "juice", "other"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setRecipeCategory(cat as any)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                    recipeCategory === cat
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {cat === "spirits" && "Spiritueux"}
                  {cat === "wine" && "Vin"}
                  {cat === "beer" && "Bière"}
                  {cat === "soda" && "Boissons gazeuses"}
                  {cat === "juice" && "Jus"}
                  {cat === "other" && "Mocktail/Autre"}
                </button>
              ))}
            </div>
          </div>

          {/* Étape 3: Ingrédients */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">3. Ingrédients</Label>
            <p className="text-sm font-semibold text-muted-foreground">
              Ajoutez les ingrédients pour calculer le coût et gérer l'inventaire automatiquement
            </p>
            
            {/* Helper function to get default quantity based on category */}
            {(() => {
              const getDefaultQuantityForCategory = () => {
                if (recipeCategory === "wine") {
                  return { quantity: "150", unit: "ml" }; // Verre de vin blanc 150ml
                } else if (recipeCategory === "beer") {
                  return { quantity: "341", unit: "ml" }; // Verre de bière 341ml
                } else if (recipeCategory === "spirits") {
                  return { quantity: "44", unit: "ml" }; // Shooter 44ml
                } else if (recipeCategory === "juice" || recipeCategory === "soda") {
                  return { quantity: "200", unit: "ml" }; // Verre standard
                } else {
                  return { quantity: "50", unit: "ml" }; // Par défaut pour cocktails
                }
              };
              
              return null;
            })()}

            {/* Recherche intelligente de produits */}
            <div className="space-y-2">
              <Label htmlFor="searchProduct" className="font-semibold">Sélectionner un produit</Label>
              <div className="relative">
                <Input
                  id="searchProduct"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Rechercher un produit (vodka, vin rouge, bière blonde...)"
                  className="pr-10"
                  autoComplete="off"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                
                {/* Suggestions dropdown */}
                {showSuggestions && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {getSuggestedProducts().length > 0 ? (
                      getSuggestedProducts().map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setSelectedProductId(product.id);
                            setSearchQuery(product.name);
                            setShowSuggestions(false);
                            
                            // Pré-remplir la quantité selon la catégorie (point 2)
                            let defaultQuantity = "50";
                            let defaultUnit = "ml";
                            
                            if (recipeCategory === "wine") {
                              // Vérifier le type de vin
                              if (product.name.toLowerCase().includes("rouge")) {
                                defaultQuantity = "360"; // Verre de vin rouge 360ml
                              } else {
                                defaultQuantity = "150"; // Verre de vin blanc 150ml
                              }
                              defaultUnit = "ml";
                            } else if (recipeCategory === "beer") {
                              // Vérifier le type de bière
                              if (product.name.toLowerCase().includes("pinte")) {
                                defaultQuantity = "570"; // Pinte de bière 570ml
                              } else if (product.name.toLowerCase().includes("bock")) {
                                defaultQuantity = "473"; // Bock de bière 473ml
                              } else {
                                defaultQuantity = "341"; // Verre de bière 341ml
                              }
                              defaultUnit = "ml";
                            } else if (recipeCategory === "spirits") {
                              defaultQuantity = "44"; // Shooter 44ml
                              defaultUnit = "ml";
                            } else if (recipeCategory === "juice" || recipeCategory === "soda") {
                              defaultQuantity = "200";
                              defaultUnit = "ml";
                            }
                            
                            setIngredientQuantity(defaultQuantity);
                            setIngredientUnit(defaultUnit);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-accent flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold">{product.name}</div>
                            <div className="text-xs font-semibold text-muted-foreground">
                              {product.category} • Stock: {product.quantity} {product.unit} • ${product.price}
                            </div>
                          </div>
                          <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                        </button>
                      ))
                    ) : searchQuery.length > 0 ? (
                      <div className="px-3 py-4 text-sm font-semibold text-muted-foreground text-center">
                        Aucun produit trouvé
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto">
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                          Tous les produits de l'inventaire
                        </div>
                        {inventoryProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setSelectedProductId(product.id);
                              setSearchQuery(product.name);
                              setShowSuggestions(false);
                              
                              // Pré-remplir la quantité selon la catégorie (point 2)
                              let defaultQuantity = "50";
                              let defaultUnit = "ml";
                              
                              if (recipeCategory === "wine") {
                                // Vérifier le type de vin
                                if (product.name.toLowerCase().includes("rouge")) {
                                  defaultQuantity = "360"; // Verre de vin rouge 360ml
                                } else {
                                  defaultQuantity = "150"; // Verre de vin blanc 150ml
                                }
                                defaultUnit = "ml";
                              } else if (recipeCategory === "beer") {
                                // Vérifier le type de bière
                                if (product.name.toLowerCase().includes("pinte")) {
                                  defaultQuantity = "570"; // Pinte de bière 570ml
                                } else if (product.name.toLowerCase().includes("bock")) {
                                  defaultQuantity = "473"; // Bock de bière 473ml
                                } else {
                                  defaultQuantity = "341"; // Verre de bière 341ml
                                }
                                defaultUnit = "ml";
                              } else if (recipeCategory === "spirits") {
                                defaultQuantity = "44"; // Shooter 44ml
                                defaultUnit = "ml";
                              } else if (recipeCategory === "juice" || recipeCategory === "soda") {
                                defaultQuantity = "200";
                                defaultUnit = "ml";
                              }
                              
                              setIngredientQuantity(defaultQuantity);
                              setIngredientUnit(defaultUnit);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-accent flex items-center justify-between group"
                          >
                            <div>
                              <div className="font-semibold">{product.name}</div>
                              <div className="text-xs font-semibold text-muted-foreground">
                                {product.category} • ${product.price}
                              </div>
                            </div>
                            <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Quantité et unité (pré-remplies selon la catégorie) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Quantité de cet ingrédient</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={ingredientQuantity}
                  onChange={(e) => setIngredientQuantity(e.target.value)}
                  placeholder="Quantité"
                  className="flex-1"
                  autoComplete="off"
                />
                <select
                  value={ingredientUnit}
                  onChange={(e) => setIngredientUnit(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-background"
                  aria-label="Unité de mesure"
                >
                  <option value="ml">ml</option>
                  <option value="oz">oz</option>
                  <option value="cl">cl</option>
                  <option value="l">l</option>
                  <option value="unit">unité</option>
                </select>
              </div>
            </div>

            <Button 
              onClick={addIngredient} 
              disabled={!selectedProductId || !ingredientQuantity}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter cet ingrédient
            </Button>

            {ingredients.length > 0 && (
              <div className="space-y-3 border-2 border-dashed rounded-lg p-4 bg-background/50">
                <Label className="text-base font-semibold">Ingrédients ajoutés</Label>
                <div className="flex flex-wrap gap-2 min-h-14">
                  {ingredients.map((ingredient) => {
                    const product = inventoryProducts.find(p => p.id === ingredient.productId);
                    const categoryColors: Record<string, string> = {
                      spirits: "bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-900/30 dark:text-slate-200",
                      wine: "bg-red-100 border-red-300 text-red-900 dark:bg-red-900/30 dark:text-red-200",
                      beer: "bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-900/30 dark:text-slate-200",
                      soda: "bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
                      juice: "bg-orange-100 border-orange-300 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200",
                      other: "bg-gray-100 border-gray-300 text-gray-900 dark:bg-gray-900/30 dark:text-gray-200",
                    };
                    const colorClass = categoryColors[product?.category || "other"] || categoryColors.other;
                    
                    return (
                      <button
                        key={ingredient.productId || ingredient.productName}
                        onClick={() => removeIngredient(ingredient.productId!)}
                        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded border ${colorClass} hover:opacity-75 transition-opacity`}
                        title="Cliquez pour supprimer"
                      >
                        <span>{ingredient.quantity}{ingredient.unit}</span>
                        <span>{ingredient.productName}</span>
                        <X className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Étapes 4-7: Sections de prix sur deux colonnes */}
          {ingredients.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {/* Étape 4: Prix coûtant */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">4. Prix coûtant</Label>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg h-10 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                    Coûtant:
                  </span>
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    ${recipeCost.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Étape 5: Marge de profit */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">5. Marge (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="200"
                  step="1"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value)}
                  placeholder="30"
                  className="flex-1 text-sm"
                  autoComplete="off"
                />
              </div>

              {/* Étape 6: Prix suggéré */}
              {recipeCost > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">6. Prix suggéré</Label>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg h-10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-green-900 dark:text-green-100">
                      +{marginPercentage}%:
                    </span>
                    <span className="text-lg font-bold text-green-700 dark:text-green-300">
                      ${suggestedPrice}
                    </span>
                  </div>
                </div>
              )}

              {/* Étape 7: Prix de vente */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">7. Prix de vente *</Label>
                <Input
                  id="recipePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={recipePrice}
                  onChange={(e) => setRecipePrice(e.target.value)}
                  placeholder={suggestedPrice || "0.00"}
                  className="text-sm"
                  autoComplete="off"
                />
              </div>
            </div>
          )}
        </>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button onClick={handleSave} disabled={!serviceType || ingredients.length === 0 || !recipePrice.trim()}>
          <Wine className="h-4 w-4 mr-2" />
          Créer le produit
        </Button>
      </DialogFooter>
    </div>
  );
}

