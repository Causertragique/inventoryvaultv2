import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import PaymentModal from "@/components/PaymentModal";
import AddProductModal from "@/components/AddProductModal";
import { Product } from "@/components/ProductCard";
import { Trash2, Plus, Minus, CreditCard, DollarSign, UserPlus, Users, X, FileText, Eye, Wine, Grid3x3, List, Edit3 } from "lucide-react";
import { usei18n } from "@/contexts/I18nContext";
import { getCurrentUserRole, hasPermission } from "@/lib/permissions";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { updateProduct, getProducts } from "@/services/firestore/products";
import { createRecipe, getRecipes } from "@/services/firestore/recipes";
import { createSale } from "@/services/firestore/sales";
import { stockAlertsService } from "@/services/firestore/notifications";
import type { FirestoreProduct } from "@shared/firestore-schema";
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
  userId: string;
  category: "spirits" | "wine" | "beer" | "soda" | "juice" | "other" | "cocktail";
  cartQuantity: number;
  isRecipe?: boolean;
}

interface RecipeIngredient {
  productId?: string;
  productName: string;
  quantity: number; // Quantity in ml or units
  unit: string; // "ml" or unit from product
  sourceMissing?: boolean;
}

interface CustomIngredientRow extends RecipeIngredient {
  rowId: string;
  referenceName?: string;
}

interface Recipe {
  id: string;
  name: string;
  price: number;
  ingredients: RecipeIngredient[];
  category: "spirits" | "wine" | "beer" | "soda" | "juice" | "other" | "cocktail";
  servingSize?: number; // Size of one serving in ml (optional)
  containerLabel?: string;
  displayName?: string;
  saleType?: ProductTypeOption;
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
  wine: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30 hover:bg-red-200 dark:hover-bg-red-500/30",
  beer: "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500/30 hover-bg-slate-200 dark:hover-bg-slate-500/30",
  soda: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30 hover:bg-cyan-200 dark:hover:bg-cyan-500/30",
  juice: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/30 hover:bg-orange-200 dark:hover:bg-orange-500/30",
  other: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30 hover:bg-green-200 dark:hover:bg-green-500/30",
  cocktail: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30 hover:bg-indigo-200 dark:hover:bg-indigo-500/30",
};

type BaseCategory = "spirits" | "wine" | "beer" | "soda" | "juice" | "other";

interface ServingFormat {
  id: string;
  labelKey: string;
  fallbackLabel: string;
  volumeMl: number;
  defaultMargin: number;
  defaultBottleMl?: number;
}

type ServingConfig = Record<BaseCategory, ServingFormat[]>;
type ServingOverrides = Partial<
  Record<BaseCategory, Partial<Record<string, { margin: number }>>>
>;

const DEFAULT_SERVING_CONFIG: ServingConfig = {
  spirits: [
    {
      id: "shot",
      labelKey: "shot",
      fallbackLabel: "Shooter 1.5 oz",
      volumeMl: 44,
      defaultMargin: 200,
      defaultBottleMl: 750,
    },
    {
      id: "double",
      labelKey: "double",
      fallbackLabel: "Double 3 oz",
      volumeMl: 88,
      defaultMargin: 180,
      defaultBottleMl: 750,
    },
  ],
  wine: [
    {
      id: "white-glass",
      labelKey: "wine-white-glass",
      fallbackLabel: "White wine glass 150 ml",
      volumeMl: 150,
      defaultMargin: 180,
      defaultBottleMl: 750,
    },
    {
      id: "red-glass",
      labelKey: "wine-red-glass",
      fallbackLabel: "Red wine glass 180 ml",
      volumeMl: 180,
      defaultMargin: 200,
      defaultBottleMl: 750,
    },
  ],
  beer: [
    {
      id: "pint",
      labelKey: "beer-pint",
      fallbackLabel: "Pint 473 ml",
      volumeMl: 473,
      defaultMargin: 150,
      defaultBottleMl: 473,
    },
    {
      id: "bock",
      labelKey: "beer-buck",
      fallbackLabel: "Buck 355 ml",
      volumeMl: 355,
      defaultMargin: 140,
      defaultBottleMl: 355,
    },
  ],
  soda: [
    {
      id: "rtb",
      labelKey: "rtb",
      fallbackLabel: "Ready-to-drink 250 ml",
      volumeMl: 250,
      defaultMargin: 120,
      defaultBottleMl: 330,
    },
  ],
  juice: [
    {
      id: "glass",
      labelKey: "juice-glass",
      fallbackLabel: "Glass 250 ml",
      volumeMl: 250,
      defaultMargin: 120,
      defaultBottleMl: 330,
    },
  ],
  other: [
    {
      id: "portion",
      labelKey: "other-portion",
      fallbackLabel: "Portion 200 ml",
      volumeMl: 200,
      defaultMargin: 150,
      defaultBottleMl: 330,
    },
  ],
};

const VALID_PRODUCT_CATEGORIES: Product["category"][] = [
  "spirits",
  "wine",
  "beer",
  "soda",
  "juice",
  "other",
];

const normalizeProductCategory = (raw?: string): Product["category"] => {
  if (!raw) return "other";
  const normalized = raw.toLowerCase();
  if (VALID_PRODUCT_CATEGORIES.includes(normalized as Product["category"])) {
    return normalized as Product["category"];
  }
  if (normalized.includes("spirit") || normalized.includes("liqueur")) {
    return "spirits";
  }
  if (normalized.includes("vin") || normalized.includes("wine")) {
    return "wine";
  }
  if (
    normalized.includes("beer") ||
    normalized.includes("biere") ||
    normalized.includes("ale")
  ) {
    return "beer";
  }
  if (
    normalized.includes("soda") ||
    normalized.includes("cola") ||
    normalized.includes("soft")
  ) {
    return "soda";
  }
  if (normalized.includes("juice") || normalized.includes("jus")) {
    return "juice";
  }
  return "other";
};

const mapFirestoreProductToSaleProduct = (product: FirestoreProduct): Product => {
  const bottleSizeField = (product as any).volume ?? (product as any).bottleSizeInMl;
  const priceValue =
    typeof product.price === "number" && Number.isFinite(product.price)
      ? product.price
      : 0;
  return {
    id: product.id || `${product.name}-${Math.random().toString(36).slice(2, 8)}`,
    name: product.name,
    category: normalizeProductCategory(product.category),
    price: priceValue,
    quantity: Math.max(0, product.quantity ?? 0),
    unit: product.unit || "bouteille",
    origin: (product as any).origin,
    imageUrl: (product as any).imageUrl,
    subcategory: product.subcategory,
    bottleSizeInMl:
      typeof bottleSizeField === "number" ? bottleSizeField : undefined,
    availableForSale: product.availableForSale !== false,
  };
};

const persistInventoryProducts = (products: Product[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("inventory-products", JSON.stringify(products));
};

const PRICING_STORAGE_KEY = "bartender-serving-config";

const loadServingOverrides = (): ServingOverrides => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PRICING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveServingOverrides = (overrides: ServingOverrides) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(overrides));
};

const getFormatMargin = (
  category: BaseCategory,
  format: ServingFormat,
  overrides: ServingOverrides
) => overrides[category]?.[format.id]?.margin ?? format.defaultMargin;

const buildServingItems = (
  inventoryProducts: Product[],
  overrides: ServingOverrides,
  getLabel: (category: BaseCategory, format: ServingFormat) => string,
): Recipe[] => {
  return inventoryProducts
    .filter((product) => product.availableForSale !== false)
    .map((product) => {
      const baseCategory = (product.category as BaseCategory) || "other";
      const formats = DEFAULT_SERVING_CONFIG[baseCategory];
      return formats.map((format) => {
        const bottleSize = (product as any).bottleSizeInMl || format.defaultBottleMl || 750;
        if (!product.price || bottleSize <= 0) return null;
        const servingsPerBottle = Math.max(1, bottleSize / format.volumeMl);
        const costPerServing = product.price / servingsPerBottle;
        const margin = getFormatMargin(baseCategory, format, overrides) / 100;
        const finalPrice = parseFloat((costPerServing * (1 + margin)).toFixed(2));
        const formatLabel = getLabel(baseCategory, format);
        return {
          id: `${product.id}__${format.id}`,
          name: `${product.name} (${formatLabel})`,
          displayName: product.name,
          containerLabel: formatLabel,
          price: finalPrice,
          ingredients: [
            {
              productId: product.id,
              productName: product.name,
              quantity: format.volumeMl,
              unit: "ml",
            },
          ],
          category: baseCategory,
          servingSize: format.volumeMl,
        } as Recipe;
      });
    })
    .flat()
    .filter((item): item is Recipe => Boolean(item));
};

export default function Sales() {
  const { t } = usei18n();
  const { user } = useAuth();
  const role = getCurrentUserRole();
  const canProcessSales = hasPermission(role, "canProcessSales");
  const canEditProducts = hasPermission(role, "canEditProducts");
  const canDeleteProducts = hasPermission(role, "canDeleteProducts");
  const { toast } = useToast();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<
    "all" | "spirits" | "wine" | "beer" | "soda" | "juice" | "other" | "cocktail"
  >("all");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "tab" | null>(
    null,
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const tabsEnabled = false;
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
  const [showSellProductForm, setShowSellProductForm] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [tip, setTip] = useState(0);
  const [tipPercentage, setTipPercentage] = useState<number | null>(null);
  const [servingOverrides, setServingOverrides] = useState<ServingOverrides>(() => loadServingOverrides());
  const [showServingConfigDialog, setShowServingConfigDialog] = useState(false);
  const [draftOverrides, setDraftOverrides] = useState<ServingOverrides>({});
  const glassItems = useMemo(
    () =>
      buildServingItems(
        inventoryProducts,
        servingOverrides,
        getServingFormatLabel
      ),
    [inventoryProducts, servingOverrides, t.sales.servingConfig]
  );


  const handleMarginDraftChange = (category: BaseCategory, formatId: string, value: number) => {
    setDraftOverrides((prev) => {
      const next = { ...(prev || {}) };
      if (!next[category]) next[category] = {};
      if (!next[category]![formatId]) next[category]![formatId] = { margin: value };
      next[category]![formatId] = { margin: value };
      return next;
    });
  };

  const handleServingConfigSave = () => {
    setServingOverrides(draftOverrides);
    setShowServingConfigDialog(false);
  };

  if (!canProcessSales) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            {t.sales?.accessDenied || "Access denied"}
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            {t.sales?.noSalesPermission ||
              "You do not have permission to process sales with this role. Contact an administrator."}
          </p>
        </div>
      </Layout>
    );
  }
  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem("sales-view-mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cached = localStorage.getItem("inventory-products");
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        setInventoryProducts(parsed);
      }
    } catch (error) {
      console.warn("[Sales] Impossible d'analyser l'inventaire en cache :", error);
    }
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    let isMounted = true;

    const loadInventory = async () => {
      try {
        const firestoreProducts = await getProducts(user.uid);
        if (!isMounted) return;
        const normalized = firestoreProducts.map(mapFirestoreProductToSaleProduct);
        setInventoryProducts(normalized);
        persistInventoryProducts(normalized);
      } catch (error) {
        console.error("[Sales] Échec du chargement de l'inventaire :", error);
      }
    };

    loadInventory();
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setRecipes([]);
      return;
    }

    let isMounted = true;

    const loadRecipes = async () => {
      try {
        const firestoreRecipes = await getRecipes(user.uid);
        if (!isMounted) return;

        const normalized: Recipe[] = firestoreRecipes.map((firestoreRecipe) => {
          const category = VALID_SALE_CATEGORIES.includes(firestoreRecipe.category as Recipe["category"])
            ? (firestoreRecipe.category as Recipe["category"])
            : "other";
          const name =
            firestoreRecipe.name || t.sales.sellProductForm.saleDisplayNameFallback;
          return {
            id:
              firestoreRecipe.id ||
              `${name}-${Math.random().toString(36).slice(2, 8)}`,
            name,
            price:
              typeof firestoreRecipe.price === "number"
                ? firestoreRecipe.price
                : 0,
            ingredients: (firestoreRecipe.ingredients || []).map((ingredient) => ({
              productId: ingredient.productId,
              productName: ingredient.productName,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
            })),
            category,
            servingSize:
              typeof firestoreRecipe.servingSize === "number"
                ? firestoreRecipe.servingSize
                : undefined,
            containerLabel: firestoreRecipe.containerLabel,
            displayName: firestoreRecipe.displayName || name,
            saleType: (firestoreRecipe as any).saleType || undefined,
          };
        });

        setRecipes(normalized);
      } catch (error) {
        console.error("[Sales] échec du chargement des recettes :", error);
      }
    };

    loadRecipes();
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    saveServingOverrides(servingOverrides);
  }, [servingOverrides]);

  useEffect(() => {
    if (!showServingConfigDialog) {
      setDraftOverrides(servingOverrides);
    }
  }, [showServingConfigDialog, servingOverrides]);

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
    all: categoriesObj.all || "All",
    spirits: categoriesObj.spirits || "Spirits",
    wine: categoriesObj.wine || "Wine",
    beer: categoriesObj.beer || "Beer",
    soda: categoriesObj.soda || "Ready-to-drink",
    juice: categoriesObj.juice || "Juice",
    other: categoriesObj.other || "Other",
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

  const getTranslatedContainerLabel = (type: ProductTypeOption | "", value: string): string | undefined => {
    const option = findContainerOption(type, value);
    if (!option) return undefined;
    if (option.labelKey) {
      const translated = t.sales.sellProductForm.containerOptions?.[option.labelKey];
      if (translated) {
        return translated;
      }
    }
    return option.label;
  };

  const getServingFormatLabel = (category: BaseCategory, format: ServingFormat) => {
    return (
      t.sales.servingConfig.formats?.[category]?.[format.labelKey] ??
      format.fallbackLabel
    );
  };

  // Combine inventory products (vendus au verre) et recettes
  const allProductsForSale: (Product | Recipe)[] = [
    ...glassItems.map((item) => ({ ...item, isRecipe: true })),
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

  const getEditableInventoryProduct = (item: Product | Recipe): Product | null => {
    if (!item) return null;
    if (!("ingredients" in item)) {
      return item;
    }
    const primaryIngredient = item.ingredients[0];
    if (!primaryIngredient?.productId) return null;
    return inventoryProducts.find((p) => p.id === primaryIngredient.productId) || null;
  };

  const handleEditProduct = (product: Product) => {
    if (!canEditProducts) return;
    if (!user?.uid) {
      toast({
        title: "Action impossible",
        description: "Connectez-vous pour modifier les produits.",
        variant: "destructive",
      });
      return;
    }
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleProductModalSave = async (updatedProduct: Product) => {
    if (!user?.uid || !editingProduct) return;
    try {
      const { id: _id, ...productWithoutId } = updatedProduct;
      await updateProduct(
        user.uid,
        editingProduct.id,
        productWithoutId as Partial<FirestoreProduct>,
        { overwrite: true },
      );
      const normalized = mapFirestoreProductToSaleProduct({
        id: editingProduct.id,
        ...productWithoutId,
      } as FirestoreProduct);
      const updated = inventoryProducts.map((item) =>
        item.id === editingProduct.id ? normalized : item,
      );
      setInventoryProducts(updated);
      persistInventoryProducts(updated);
      setCart((previous) =>
        previous.map((item) =>
          item.id === editingProduct.id ? { ...item, price: normalized.price } : item,
        ),
      );
      setEditingProduct(null);
      setIsProductModalOpen(false);
      toast({
        title: "Produit modifié",
        description: `${updatedProduct.name} a bien été mis à jour.`,
      });
    } catch (error) {
      console.error("[Sales] Échec mise à jour produit:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le produit.",
        variant: "destructive",
      });
    }
  };

  const handleProductModalClose = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleSellProductSave = async (recipe: Recipe) => {
    if (!user?.uid) {
      toast({
        title: "Action impossible",
        description: "Connectez-vous pour enregistrer ce produit.",
        variant: "destructive",
      });
      return;
    }
    try {
      const payload: Record<string, unknown> = {
        name: recipe.name,
        category: recipe.category,
        ingredients: recipe.ingredients,
        instructions: [],
        userId: user.uid,
        price: recipe.price,
        servingSize: recipe.servingSize,
      displayName: recipe.displayName || recipe.name,
      saleType: recipe.saleType,
    };
      if (recipe.containerLabel) {
        payload.containerLabel = recipe.containerLabel;
      }
      await createRecipe(user.uid, payload as any);
      setRecipes((prev) => [...prev, recipe]);
      addToCart(recipe);
      setShowSellProductForm(false);
      toast({
        title: "Produit enregistré",
        description: `${recipe.name} est prêt à la vente.`,
      });
    } catch (error) {
      console.error("[Sales] Échec enregistrement produit :", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le produit.",
        variant: "destructive",
      });
    }
  };
  const handleDeleteProduct = async (product: Product) => {
    if (!canDeleteProducts) return;
    if (!user?.uid) {
      toast({
        title: "Action impossible",
        description: "Connectez-vous pour masquer la carte de vente.",
        variant: "destructive",
      });
      return;
    }
    if (
      !confirm(
        `Hide the card for ${product.name} on the Sales page? This will not erase the inventory.`,
      )
    )
      return;

    try {
      await updateProduct(
        user.uid,
        product.id,
        { availableForSale: false },
        { overwrite: true },
      );
      const updated = inventoryProducts.map((p) =>
        p.id === product.id ? { ...p, availableForSale: false } : p,
      );
      setInventoryProducts(updated);
      persistInventoryProducts(updated);
      setCart((previous) => previous.filter((item) => item.id !== product.id));
      toast({
        title: "Carte masquée",
        description: `${product.name} n’apparaît plus dans les cartes de vente.`,
      });
    } catch (error) {
      console.error("[Sales] Échec masquer produit:", error);
      toast({
        title: "Erreur",
        description: "Impossible de masquer la carte.",
        variant: "destructive",
      });
    }
  };

  const renderProductActionIcons = (item: Product | Recipe) => {
    const editableProduct = getEditableInventoryProduct(item);
    if (!editableProduct || (!canEditProducts && !canDeleteProducts)) return null;
    return (
      <div className="absolute right-2 top-2 z-10 flex gap-1 text-muted-foreground">
        {canEditProducts && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleEditProduct(editableProduct);
            }}
            className="h-7 w-7 rounded text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center bg-transparent border-0"
            aria-label={`Modifier ${editableProduct.name}`}
          >
            <Edit3 className="h-4 w-4" />
          </button>
        )}
        {canDeleteProducts && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDeleteProduct(editableProduct);
            }}
            className="h-7 w-7 rounded text-destructive hover:text-destructive/80 transition-colors flex items-center justify-center bg-transparent border-0"
            aria-label={`Supprimer ${editableProduct.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    );
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
          userId: ""
        };
        setCart([...cart, recipeItem]);
      } else {
        setCart([...cart, { ...product, cartQuantity: 1, isRecipe: false, userId: user?.uid || "" }]);
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
    
    persistInventoryProducts(updatedProducts);
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
    // Décrémente la quantité des produits vendus
        if (cart.length > 0) {
          cart.forEach(async (cartItem) => {
            if (cartItem.id && typeof cartItem.cartQuantity === "number") {
              await updateProduct(cartItem.userId || user?.uid, cartItem.id, {
                quantity: Math.max(0, (cartItem.quantity || 0) - cartItem.cartQuantity)
              });
            }
          });
        }
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
      alert("Please enter a tab name");
      return;
    }
    
    // Credit card is optional, but if provided, validate it
    let last4Digits: string | undefined;
    if (newTabCreditCard.trim()) {
      const cleanedCard = newTabCreditCard.replace(/\s+/g, "");
      if (cleanedCard.length < 13 || cleanedCard.length > 19 || !/^\d+$/.test(cleanedCard)) {
        alert("Please enter a valid credit card number");
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
      alert("This tab must be paid before it can be closed");
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


  return (
    <Layout>
      <div className="space-y-6">
        {/* Dropdown de sélection de cocktail */}
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
              onClick={() => setShowSellProductForm(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold transition-all hover:opacity-90 whitespace-nowrap text-sm sm:text-base"
            >
              <Wine className="h-4 w-4 sm:h-5 sm:w-5" />
              {t.sales.sellProductCTA}
            </button>
            {tabsEnabled && openTabs.length > 0 && (
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
                  
                  const isOutOfStock = availableQuantity <= 0;
                  const title =
                    ('displayName' in product && product.displayName)
                      ? product.displayName
                      : product.name;
                  const containerLabel = ('containerLabel' in product && product.containerLabel)
                    ? product.containerLabel
                    : !isRecipe
                    ? translateUnit((product as Product).unit)
                    : "";
                  const availabilityText = isOutOfStock ? "Indisponible" : "\u00A0";
                  return (
                    <div
                      key={product.id}
                      role="button"
                      tabIndex={isOutOfStock ? -1 : 0}
                      aria-disabled={isOutOfStock}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      onKeyDown={(event) => {
                        if (
                          isOutOfStock ||
                          (event.key !== "Enter" && event.key !== " ")
                        )
                          return;
                        event.preventDefault();
                        addToCart(product);
                      }}
                      className={`relative p-3 rounded-lg border-2 border-foreground/30 transition-all text-left flex flex-col h-full min-h-[120px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${categoryColors[product.category]} ${
                        isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      {renderProductActionIcons(product)}
                      <p className="font-bold text-base leading-snug line-clamp-2 mb-1 min-h-[2.1rem]">
                        {title}
                      </p>
                  <p className="text-sm text-muted-foreground min-h-[1.2rem]">
                    {(product as Recipe).saleType === "shot"
                      ? "Shot"
                      : containerLabel || "\u00A0"}
                  </p>
                      <div className="h-2" aria-hidden="true" />
                      <p className="text-lg font-semibold text-foreground">
                        ${product.price.toFixed(2)}
                      </p>
                      <p className="text-[10px] opacity-60 mt-1">
                        {availabilityText}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredProducts.map((product) => {
                  const isRecipe = 'ingredients' in product;
                  const availableQuantity = isRecipe 
                    ? calculateRecipeAvailability(product as Recipe)
                    : (product as Product).quantity;
                  
                  const isOutOfStock = availableQuantity <= 0;
                  const title =
                    ('displayName' in product && product.displayName)
                      ? product.displayName
                      : product.name;
                  const containerLabel = ('containerLabel' in product && product.containerLabel)
                    ? product.containerLabel
                    : !isRecipe
                    ? translateUnit((product as Product).unit)
                    : "";
                  const availabilityText = isOutOfStock ? "Indisponible" : "\u00A0";
                  return (
                    <div
                      key={product.id}
                      role="button"
                      tabIndex={isOutOfStock ? -1 : 0}
                      aria-disabled={isOutOfStock}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      onKeyDown={(event) => {
                        if (
                          isOutOfStock ||
                          (event.key !== "Enter" && event.key !== " ")
                        )
                          return;
                        event.preventDefault();
                        addToCart(product);
                      }}
                      className={`relative w-full rounded-lg border-2 border-foreground/30 transition-all bg-background flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-3 text-left ${categoryColors[product.category]} ${
                        isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      {renderProductActionIcons(product)}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base line-clamp-2">
                          {title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {(product as Recipe).saleType === "shot"
                            ? "Shot"
                            : containerLabel || "\u00A0"}
                        </p>
                      </div>
                      <div className="flex h-full flex-col items-end justify-between text-sm">
                        <span className="text-[10px] opacity-70">
                          {availabilityText}
                        </span>
                        <span className="font-semibold text-base sm:text-lg text-foreground">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
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
                  <div className={`grid ${tabsEnabled ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
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
                    {tabsEnabled && (
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
                    )}
                  </div>
                  
                  {/* Tab Selection */}
                  {tabsEnabled && paymentMethod === "tab" && (
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

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || !paymentMethod}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.sales.completeSale}
              </button>

              {/* Pay Tab Button - Quick Access */}
              {tabsEnabled && openTabs.length > 0 && (
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
          {/* Dropdown recette cocktail */}
          {filterCategory === "cocktail" && (
            <div className="mt-4">
              <label
                htmlFor="cocktail-recipe-select"
                className="block text-sm font-medium text-foreground mb-1"
              >
                {t.sales.cocktailRecipeLabel}
              </label>
              <select
                id="cocktail-recipe-select"
                className="w-full p-2 border rounded"
                onChange={(e) => {
                  const selectedRecipe = PRESET_RECIPES.find((r) => r.name === e.target.value);
                  if (selectedRecipe) {
                    addToCart({
                      id: selectedRecipe.name!,
                      name: selectedRecipe.name!,
                      price: selectedRecipe.price || 0,
                      ingredients: selectedRecipe.ingredients || [],
                      category: "cocktail",
                    });
                  }
                }}
              >
                <option value="">{t.sales.cocktailRecipeSelectPlaceholder}</option>
                {recipes
                  .filter((r) => r.category === "cocktail")
                  .map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSellProductForm} onOpenChange={setShowSellProductForm}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto p-4 space-y-4">
          <DialogHeader className="pb-0">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Wine className="h-5 w-5" />
              {t.sales.sellProductDialogTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t.sales.sellProductDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <SellProductForm
            inventoryProducts={inventoryProducts}
            isOpen={showSellProductForm}
            onSave={handleSellProductSave}
            onCancel={() => setShowSellProductForm(false)}
            translateUnit={translateUnit}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={showServingConfigDialog} onOpenChange={setShowServingConfigDialog}>
        <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{t.sales.servingConfig.title}</DialogTitle>
        <DialogDescription>
          {t.sales.servingConfig.description}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {(Object.keys(DEFAULT_SERVING_CONFIG) as BaseCategory[]).map((category) => {
          const categoryLabel =
            t.sales.servingConfig.categoryLabels?.[category] ||
            t.sales.categories?.[category] ||
            category;
          return (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                {categoryLabel}
              </h4>
              <div className="space-y-2">
                {DEFAULT_SERVING_CONFIG[category].map((format) => {
                  const marginValue =
                    draftOverrides[category]?.[format.id]?.margin ?? format.defaultMargin;
                  const formatLabel = getServingFormatLabel(category, format);
                  const detailText = t.sales.servingConfig.formatDetails
                    .replace("{volume}", String(format.volumeMl))
                    .replace("{margin}", String(format.defaultMargin));
                  return (
                    <div
                      key={format.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 border border-border rounded-lg p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{formatLabel}</p>
                        <p className="text-xs text-muted-foreground">{detailText}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          step={5}
                          value={marginValue}
                          onChange={(e) =>
                            handleMarginDraftChange(
                              category,
                              format.id,
                              Number(e.target.value) || 0
                            )
                          }
                          className="w-24 text-right"
                        />
                        <span className="text-sm font-medium">%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServingConfigDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleServingConfigSave}>
              {t.settings?.saveChanges || "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AddProductModal
        isOpen={isProductModalOpen && canEditProducts}
        onClose={handleProductModalClose}
        onSave={handleProductModalSave}
        editingProduct={editingProduct}
      />
    {/* End of all dialogs */}
  </Layout>
);
}

// Convert ounces to ml (1 oz = 29.5735 ml) - Utility function

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

type ProductTypeOption = "wine" | "beer" | "shot" | "cocktail" | "other";

type ContainerOption = {
  value: string;
  label: string;
  labelKey?: string;
  defaultQuantity?: number;
  defaultUnit?: string;
};

const PRODUCT_TYPE_OPTIONS: {
  value: ProductTypeOption;
  label: string;
  helper: string;
}[] = [
  { value: "wine", label: "Vin", helper: "Verre, demi-litre ou bouteille" },
  { value: "beer", label: "Bière", helper: "Verre, pinte ou buck" },
  { value: "shot", label: "Shot", helper: "Dose de 1,5 oz par défaut" },
  { value: "cocktail", label: "Cocktail", helper: "Recette maison ou standard" },
  { value: "other", label: "Autres", helper: "Mocktails, jus, boissons spéciales" },
];

const CONTAINER_OPTIONS: Partial<Record<ProductTypeOption, ContainerOption[]>> = {
  wine: [
    {
      value: "wine-red-glass",
      labelKey: "wine-red-glass",
      label: "Red wine glass (180 ml)",
      defaultQuantity: 180,
      defaultUnit: "ml",
    },
    {
      value: "wine-white-glass",
      labelKey: "wine-white-glass",
      label: "White wine glass (150 ml)",
      defaultQuantity: 150,
      defaultUnit: "ml",
    },
    {
      value: "wine-half-liter",
      labelKey: "wine-half-liter",
      label: "Half liter (500 ml)",
      defaultQuantity: 500,
      defaultUnit: "ml",
    },
    {
      value: "wine-bottle",
      labelKey: "wine-bottle",
      label: "Bottle (750 ml)",
      defaultQuantity: 750,
      defaultUnit: "ml",
    },
  ],
  beer: [
    {
      value: "beer-bottle",
      labelKey: "beer-bottle",
      label: "Bottle (341 ml)",
      defaultQuantity: 341,
      defaultUnit: "ml",
    },
    {
      value: "beer-glass",
      labelKey: "beer-glass",
      label: "Glass (355 ml)",
      defaultQuantity: 355,
      defaultUnit: "ml",
    },
    {
      value: "beer-pint",
      labelKey: "beer-pint",
      label: "Pint (473 ml)",
      defaultQuantity: 473,
      defaultUnit: "ml",
    },
    {
      value: "beer-buck",
      labelKey: "beer-buck",
      label: "Buck (500 ml)",
      defaultQuantity: 500,
      defaultUnit: "ml",
    },
  ],
  cocktail: [
    {
      value: "cocktail-default-recipe",
      labelKey: "cocktail-default-recipe",
      label: "Default recipe",
    },
    {
      value: "cocktail-custom",
      labelKey: "cocktail-custom",
      label: "Custom recipe",
    },
  ],
};


const findContainerOption = (
  type: ProductTypeOption | "",
  value: string,
): ContainerOption | undefined => {
  if (!type) return undefined;
  return CONTAINER_OPTIONS[type]?.find((opt) => opt.value === value);
};

const getDefaultServingForSelection = (
  type: ProductTypeOption | "",
  container: string,
): { quantity: number; unit: string } => {
  if (type === "wine") {
    switch (container) {
      case "wine-red-glass":
        return { quantity: 180, unit: "ml" };
      case "wine-white-glass":
        return { quantity: 150, unit: "ml" };
      case "wine-half-liter":
        return { quantity: 500, unit: "ml" };
      case "wine-bottle":
        return { quantity: 750, unit: "ml" };
      default:
        return { quantity: 150, unit: "ml" };
    }
  }
  if (type === "beer") {
    switch (container) {
      case "beer-bottle":
        return { quantity: 341, unit: "ml" };
      case "beer-glass":
        return { quantity: 355, unit: "ml" };
      case "beer-pint":
        return { quantity: 473, unit: "ml" };
      case "beer-buck":
        return { quantity: 500, unit: "ml" };
      default:
        return { quantity: 355, unit: "ml" };
    }
  }
  if (type === "shot") {
    return { quantity: 44, unit: "ml" };
  }
  if (type === "cocktail") {
    if (container === "cocktail-default-recipe") {
      return { quantity: 0, unit: "ml" };
    }
    return { quantity: 120, unit: "ml" };
  }
  if (type === "other") {
    return { quantity: 250, unit: "ml" };
  }
  return { quantity: 50, unit: "ml" };
};

const mapProductTypeToCategory = (type: ProductTypeOption): Recipe["category"] => {
  if (type === "cocktail") return "cocktail";
  if (type === "shot") return "spirits";
  if (type === "wine" || type === "beer" || type === "other") {
    return type;
  }
  return "other";
};

const matchesProductType = (product: Product, type: ProductTypeOption): boolean => {
  const category = product.category?.toLowerCase?.() || "";
  switch (type) {
    case "wine":
      return category === "wine";
    case "beer":
      return category === "beer";
    case "shot":
    case "cocktail":
      return category === "spirits";
    case "other":
      return true;
    default:
      return true;
  }
};

const filterProductsForType = (
  type: ProductTypeOption | "",
  products: Product[],
  options?: { allowFullInventoryForCocktail?: boolean },
): Product[] => {
  if (!type) return products;

  if (type === "cocktail" && options?.allowFullInventoryForCocktail) {
    return products;
  }

  return products.filter((product) => matchesProductType(product, type));
};

const isProductTypeOption = (value: ProductTypeOption | ""): value is ProductTypeOption =>
  value !== "";

const VALID_SALE_CATEGORIES: Recipe["category"][] = [
  "spirits",
  "wine",
  "beer",
  "soda",
  "juice",
  "other",
  "cocktail",
];



interface SellProductFormProps {
  inventoryProducts: Product[];
  isOpen: boolean;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
  translateUnit: (unit: string) => string;
}

function SellProductForm({
  inventoryProducts,
  isOpen,
  onSave,
  onCancel,
  translateUnit,
}: SellProductFormProps): JSX.Element {
  const { t } = usei18n();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<ProductTypeOption | "">("");
  const [selectedContainer, setSelectedContainer] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [profitMargin, setProfitMargin] = useState(40);
  const [customIngredients, setCustomIngredients] = useState<CustomIngredientRow[]>([]);
  const [customCocktailName, setCustomCocktailName] = useState("");
  const [selectedPresetRecipeName, setSelectedPresetRecipeName] = useState("");
  const isCustomCocktail =
    selectedType === "cocktail" && selectedContainer === "cocktail-custom";
  const isPresetCocktail =
    selectedType === "cocktail" && selectedContainer === "cocktail-default-recipe";
  const isMultiIngredientCocktail = isCustomCocktail || isPresetCocktail;

  const containerOptions = isProductTypeOption(selectedType)
    ? CONTAINER_OPTIONS[selectedType]
    : undefined;
  const filteredInventory = useMemo(() => {
    return filterProductsForType(selectedType, inventoryProducts).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [inventoryProducts, selectedType]);
  const otherInventory = useMemo(() => {
    const matchingIds = new Set(filteredInventory.map((product) => product.id));
    return inventoryProducts
      .filter((product) => !matchingIds.has(product.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inventoryProducts, filteredInventory]);
  const presetCocktailRecipes = PRESET_RECIPES.filter(
    (recipe) => recipe.category === "cocktail",
  );
  const normalizeName = (value?: string) => value?.trim().toLowerCase() || "";
  const findInventoryProductByName = (name?: string) =>
    inventoryProducts.find(
      (product) => normalizeName(product.name) === normalizeName(name),
    );
  const createCustomIngredientRow = (
    base: Partial<CustomIngredientRow> = {},
  ): CustomIngredientRow => ({
    rowId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId: base.productId || "",
    productName: base.productName || "",
    quantity: base.quantity ?? 30,
    unit: base.unit || "ml",
    referenceName: base.referenceName,
  });
  const buildRowFromIngredient = (
    ingredient: Partial<RecipeIngredient>,
  ): CustomIngredientRow => {
    const matchedProduct = findInventoryProductByName(ingredient.productName);
    return createCustomIngredientRow({
      productId: matchedProduct?.id,
      productName: matchedProduct?.name || ingredient.productName || "",
      quantity: ingredient.quantity || 0,
      unit: ingredient.unit || "ml",
      referenceName: ingredient.productName,
    });
  };
  const addCustomIngredientRow = () => {
    setCustomIngredients((prev) => [...prev, createCustomIngredientRow()]);
  };
  const updateCustomIngredient = (
    rowId: string,
    updates: Partial<CustomIngredientRow>,
  ) => {
    setCustomIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.rowId === rowId ? { ...ingredient, ...updates } : ingredient,
      ),
    );
  };
  const removeCustomIngredientRow = (rowId: string) => {
    setCustomIngredients((prev) => prev.filter((ingredient) => ingredient.rowId !== rowId));
  };
  const handleCustomProductChange = (rowId: string, productId: string) => {
    const product = inventoryProducts.find((item) => item.id === productId);
    updateCustomIngredient(rowId, {
      productId,
      productName: product?.name || "",
    });
  };
  const applyPresetRecipe = (recipeName: string) => {
    const recipe = presetCocktailRecipes.find((item) => item.name === recipeName);
    if (!recipe) {
      setCustomIngredients([]);
      setCustomCocktailName("");
      return;
    }
    setCustomCocktailName(recipe.name || "");
    const rows =
      (recipe.ingredients || []).map((ingredient) => buildRowFromIngredient(ingredient));
    setCustomIngredients(rows.length > 0 ? rows : [createCustomIngredientRow()]);
  };
  const selectedProduct = inventoryProducts.find((product) => product.id === selectedProductId);
  const servingDefaults = useMemo(
    () => getDefaultServingForSelection(selectedType, selectedContainer),
    [selectedType, selectedContainer],
  );
  const servingVolume = servingDefaults.quantity || 0;
  const customTotalVolume = useMemo(
    () => customIngredients.reduce((sum, ingredient) => sum + (ingredient.quantity || 0), 0),
    [customIngredients],
  );
  const getBottleSize = (product?: Product): number => {
    if (!product) return 0;
    if (product.bottleSizeInMl && product.bottleSizeInMl > 0) return product.bottleSizeInMl;
    const unit = product.unit?.toLowerCase?.() || "";
    if (unit.includes("bottle") || unit.includes("bouteille")) {
      return product.category === "beer" ? 341 : 750;
    }
    return 750;
  };
  const calculateIngredientCost = (ingredient: RecipeIngredient): number => {
    const product =
      ingredient.productId
        ? inventoryProducts.find((item) => item.id === ingredient.productId)
        : findInventoryProductByName(ingredient.productName);
    if (!product || ingredient.quantity <= 0) return 0;
    const bottleSize = getBottleSize(product);
    if (bottleSize <= 0) return 0;
    const costPerMl = product.price / bottleSize;
    return costPerMl * ingredient.quantity;
  };
  const estimatedCost = useMemo(() => {
    if (isMultiIngredientCocktail) {
      const cost = customIngredients.reduce(
        (sum, ingredient) => sum + calculateIngredientCost(ingredient),
        0,
      );
      return cost > 0 ? cost : null;
    }
    if (!selectedProduct || servingVolume <= 0) return null;
    const bottleSize = getBottleSize(selectedProduct);
    if (bottleSize <= 0) return null;
    const costPerMl = selectedProduct.price / bottleSize;
    return costPerMl * servingVolume;
  }, [
    customIngredients,
    inventoryProducts,
    isMultiIngredientCocktail,
    selectedProduct,
    servingVolume,
  ]);
  useEffect(() => {
    if (estimatedCost === null) return;
    if (!Number.isFinite(profitMargin)) return;
    if (!isMultiIngredientCocktail && !selectedProduct) return;
    const computedPrice = estimatedCost * (1 + profitMargin / 100);
    if (!Number.isFinite(computedPrice)) return;
    setPriceInput(computedPrice.toFixed(2));
  }, [estimatedCost, profitMargin, selectedProduct, isMultiIngredientCocktail]);
  const resetForm = () => {
    setStep(1);
    setSelectedType("");
    setSelectedContainer("");
    setSelectedProductId("");
    setPriceInput("");
    setCustomIngredients([]);
    setCustomCocktailName("");
    setSelectedPresetRecipeName("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isPresetCocktail) {
      if (!selectedPresetRecipeName && presetCocktailRecipes.length > 0) {
        setSelectedPresetRecipeName(presetCocktailRecipes[0].name || "");
        return;
      }
      if (selectedPresetRecipeName) {
        applyPresetRecipe(selectedPresetRecipeName);
      }
      return;
    }
    if (isCustomCocktail) {
      setCustomIngredients((prev) =>
        prev.length > 0 ? prev : [createCustomIngredientRow()],
      );
      return;
    }
    if (customIngredients.length > 0) {
      setCustomIngredients([]);
    }
    if (customCocktailName) {
      setCustomCocktailName("");
    }
    if (selectedPresetRecipeName) {
      setSelectedPresetRecipeName("");
    }
  }, [
    isCustomCocktail,
    isPresetCocktail,
    selectedPresetRecipeName,
    presetCocktailRecipes.length,
    inventoryProducts,
  ]);

  useEffect(() => {
    setSelectedContainer("");
    setSelectedProductId("");
    setPriceInput("");
    setStep(1);
    setCustomIngredients([]);
    setCustomCocktailName("");
    setSelectedPresetRecipeName("");
  }, [selectedType]);

  const getStepLabel = () => {
    if (step === 1) {
      const optionLabel =
        selectedType && t.sales.sellProductForm.typeOptions[selectedType]
          ? t.sales.sellProductForm.typeOptions[selectedType].label
          : undefined;
      if (optionLabel) return optionLabel;
      const fallback = PRODUCT_TYPE_OPTIONS.find((item) => item.value === selectedType)?.label;
      return fallback || t.sales.sellProductForm.typeStepTitle;
    }
    if (step === 2) return t.sales.sellProductForm.containerStepTitle;
    return t.sales.sellProductForm.productStepTitle;
  };

  const canAdvance = (): boolean => {
    if (step === 1) return !!selectedType;
    if (step === 2) return !containerOptions || !!selectedContainer;
    return false;
  };

  const handleNextStep = () => {
    if (!canAdvance()) return;
    setStep((prev) => Math.min(3, prev + 1));
  };

  const handleSelectType = (type: ProductTypeOption) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleSelectContainer = (value: string) => {
    setSelectedContainer(value);
    setStep(3);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
  };

  const handlePriceChange = (value: string) => {
    const normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
    const [integer, decimals = ""] = normalized.split(".");
    const truncated = decimals.slice(0, 2);
    setPriceInput(truncated ? `${integer || "0"}.${truncated}` : integer);
  };

  const renderTypeStep = () => (
    <div className="space-y-3">
      <Label className="text-base font-semibold">
        {`1. ${t.sales.sellProductForm.typeStepTitle}`}
      </Label>
      <p className="text-xs text-muted-foreground">
        {t.sales.sellProductForm.typeStepDescription}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PRODUCT_TYPE_OPTIONS.map((option) => {
          const optionTranslation = t.sales.sellProductForm.typeOptions[option.value];
          const label = optionTranslation?.label || option.label;
          const helper = optionTranslation?.helper || option.helper;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelectType(option.value)}
              className={`p-3 border-2 rounded-lg text-left transition-all ${
                selectedType === option.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-semibold">{label}</div>
              <p className="text-xs text-muted-foreground">{helper}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderContainerStep = () => (
    <div className="space-y-3">
      <Label className="text-base font-semibold">
        {`2. ${t.sales.sellProductForm.containerStepTitle}`}
      </Label>
      <p className="text-xs text-muted-foreground">
        {t.sales.sellProductForm.containerStepDescription}
      </p>
      {containerOptions?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {containerOptions.map((option) => {
            const labelKey = option.labelKey as keyof typeof t.sales.sellProductForm.containerOptions;
            const label =
              t.sales.sellProductForm.containerOptions?.[labelKey] ||
              option.label ||
              option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectContainer(option.value)}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  selectedContainer === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="font-semibold text-sm">{label}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t.sales.sellProductForm.containerAutoMessage}
        </p>
      )}
    </div>
  );

  const formatStockLabel = (count?: number) =>
    t.sales.sellProductForm.stockCount.replace("{count}", String(count ?? 0));

  const inventoryOptions = inventoryProducts.map((product) => {
    const stockLabel = formatStockLabel(product.quantity);
    return (
      <option key={product.id} value={product.id}>
        {product.name} • {translateUnit(product.unit)} • {stockLabel}
      </option>
    );
  });

const renderProductStep = () => {
    const containerLabel = selectedContainer
      ? getTranslatedContainerLabel(selectedType, selectedContainer) ?? ""
      : "";
    const bottleSize = selectedProduct ? getBottleSize(selectedProduct) : 0;
    const inventoryGroups = t.sales.sellProductForm.inventoryGroups;
    return (
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          {`3. ${t.sales.sellProductForm.productStepTitle}`}
        </Label>
        <p className="text-xs text-muted-foreground">
          {t.sales.sellProductForm.productStepDescription}
        </p>
        {!isMultiIngredientCocktail ? (
          <>
            <select
              className="w-full p-3 border rounded-lg bg-background text-sm"
              value={selectedProductId}
              onChange={(event) => {
                const product = inventoryProducts.find((item) => item.id === event.target.value);
                if (product) {
                  handleSelectProduct(product);
                } else {
                  setSelectedProductId("");
                }
              }}
            >
              <option value="">{t.sales.sellProductForm.selectProductPlaceholder}</option>
              {filteredInventory.length > 0 && (
                <optgroup label={inventoryGroups?.compatible || "Compatible inventory"}>
                  {filteredInventory.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} • {translateUnit(product.unit)} • {formatStockLabel(product.quantity)}
                    </option>
                  ))}
                </optgroup>
              )}
              {otherInventory.length > 0 && (
                <optgroup label={inventoryGroups?.other || "Other inventory"}>
                  {otherInventory.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} • {translateUnit(product.unit)} • {formatStockLabel(product.quantity)}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            {filteredInventory.length === 0 && otherInventory.length === 0 && (
              <p className="text-xs text-muted-foreground">
                {t.sales.sellProductForm.noProductsAvailable}
              </p>
            )}
          </>
        ) : (
          <div className="space-y-3">
            {isPresetCocktail && (
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  {t.sales.sellProductForm.presetRecipeLabel}
                </Label>
                <select
                  className="w-full p-2 border rounded-lg bg-background text-sm"
                  value={selectedPresetRecipeName}
                  onChange={(event) => {
                    setSelectedPresetRecipeName(event.target.value);
                  }}
                >
                  <option value="">{t.sales.sellProductForm.presetSelectPlaceholder}</option>
                  {presetCocktailRecipes.map((recipe) => (
                    <option key={recipe.name} value={recipe.name}>
                      {recipe.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {isCustomCocktail && (
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  {t.sales.sellProductForm.customCocktailLabel}
                </Label>
                <Input
                  className="bg-white"
                  placeholder={t.sales.sellProductForm.customCocktailPlaceholder}
                  value={customCocktailName}
                  onChange={(event) => setCustomCocktailName(event.target.value)}
                />
              </div>
            )}
            <div className="space-y-3 rounded-lg border border-border p-3">
              {(customIngredients.length === 0 ? [createCustomIngredientRow()] : customIngredients).map(
                (ingredient) => (
                  <div key={ingredient.rowId} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-12">
                      <p className="text-[11px] text-muted-foreground">
                        {ingredient.referenceName
                          ? `${t.sales.sellProductForm.presetRecipeLabel} : ${ingredient.referenceName}`
                          : t.sales.sellProductForm.ingredientCustomLabel}
                        {ingredient.quantity
                          ? ` - ${ingredient.quantity} ${ingredient.unit}`
                          : ""}
                      </p>
                    </div>
                    <div className="col-span-7 space-y-1">
                      <Label className="text-xs font-semibold">
                        {t.sales.sellProductForm.customIngredientProductLabel}
                      </Label>
                      <select
                        className="w-full p-2 rounded border border-border text-sm"
                        value={ingredient.productId || ""}
                        onChange={(event) => handleCustomProductChange(ingredient.rowId, event.target.value)}
                      >
                        <option value="">{t.sales.sellProductForm.selectProductPlaceholder}</option>
                        {inventoryOptions}
                      </select>
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs font-semibold">
                        {t.sales.sellProductForm.customIngredientQuantityLabel}
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={ingredient.quantity}
                        onChange={(event) =>
                          updateCustomIngredient(ingredient.rowId, {
                            quantity: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeCustomIngredientRow(ingredient.rowId)}
                        className="text-destructive hover:text-destructive/80"
                        aria-label={t.sales.sellProductForm.customIngredientRemoveLabel}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ),
              )}
              <Button variant="outline" onClick={addCustomIngredientRow}>
                {t.sales.sellProductForm.addIngredientButton}
              </Button>
            </div>
          </div>
        )}
        {estimatedCost !== null && (
          <div className="p-3 border rounded-lg bg-secondary/50 space-y-1 text-sm">
            <p className="font-semibold text-foreground">
              {t.sales.sellProductForm.estimatedCostLabel} : ${estimatedCost.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {isMultiIngredientCocktail
                ? t.sales.sellProductForm.estimatedCostDetailMulti.replace(
                    "{totalVolume}",
                    String(customTotalVolume),
                  )
                : t.sales.sellProductForm.estimatedCostDetailSingle
                    .replace("{servingVolume}", String(servingVolume))
                    .replace("{bottleSize}", String(bottleSize))}
            </p>
          </div>
        )}
        {estimatedCost !== null && (
          <div className="space-y-1">
            <Label className="text-sm font-semibold">
              {t.sales.sellProductForm.profitMarginLabel}
            </Label>
            <Input
              type="number"
              min="0"
              step="1"
              value={profitMargin}
              onChange={(event) => setProfitMargin(Number(event.target.value))}
            />
            <p className="text-[11px] text-muted-foreground">
              {t.sales.sellProductForm.profitMarginHint}{" "}
              {estimatedCost && profitMargin >= 0
                ? `$${(estimatedCost * (1 + profitMargin / 100)).toFixed(2)}`
                : "0.00"}
              .
            </p>
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-sm font-semibold">{t.sales.sellProductForm.salePriceLabel}</Label>
          <Input
            placeholder="0.00"
            value={priceInput}
            onChange={(event) => handlePriceChange(event.target.value)}
            disabled={!(selectedProduct || isMultiIngredientCocktail)}
          />
          {containerLabel && (
            <p className="text-xs text-muted-foreground">
              {t.sales.sellProductForm.containerSelectedLabel.replace("{container}", containerLabel)}
            </p>
          )}
        </div>
      </div>
    );
  };

  const handleSave = () => {
    const errors = t.sales.sellProductForm.errors;
    if (!selectedType) {
      alert(errors.typeRequired);
      return;
    }
    if (containerOptions?.length && !selectedContainer) {
      alert(errors.containerRequired);
      return;
    }
    const priceValue = parseFloat(priceInput.replace(",", "."));
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      alert(errors.priceInvalid);
      return;
    }
    if (!selectedProduct && !isMultiIngredientCocktail) {
      alert(errors.productRequired);
      return;
    }
    const ingredientDefaults = getDefaultServingForSelection(selectedType, selectedContainer);
    const resolvedContainerLabel = getTranslatedContainerLabel(selectedType, selectedContainer);
    let ingredients: RecipeIngredient[] = [];
    let name = "";
    if (isMultiIngredientCocktail) {
      const validIngredients = customIngredients
        .filter((ingredient) => ingredient.productId && ingredient.quantity > 0)
        .map((ingredient) => ({
          productId: ingredient.productId,
          productName: ingredient.productName,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        }));
      if (validIngredients.length === 0) {
        alert(errors.ingredientRequired);
        return;
      }
      ingredients = validIngredients;
      name =
        customCocktailName ||
        selectedPresetRecipeName ||
        t.sales.sellProductForm.customCocktailFallback;
    } else if (selectedProduct) {
      const quantity = ingredientDefaults.quantity || selectedProduct.quantity || 0;
      ingredients = [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity,
          unit: ingredientDefaults.unit || selectedProduct.unit,
        },
      ];
      name = `${selectedProduct.name}${resolvedContainerLabel ? ` - ${resolvedContainerLabel}` : ""}`;
    }
    const recipe: Recipe = {
      id: `sell-${Date.now()}`,
      name,
      displayName:
        name ||
        selectedProduct?.name ||
        t.sales.sellProductForm.saleDisplayNameFallback,
      price: priceValue,
      ingredients,
      category: mapProductTypeToCategory(selectedType),
      servingSize: isMultiIngredientCocktail
        ? customTotalVolume || undefined
        : ingredientDefaults.quantity,
      containerLabel: resolvedContainerLabel,
      saleType: selectedType,
    };
    onSave(recipe);
    resetForm();
  };

  const totalSteps = 3;
  const stepIndicator = t.sales.sellProductForm.stepIndicator
    .replace("{current}", String(step))
    .replace("{total}", String(totalSteps));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
        <span>Étape {step} / 3</span>
        <span>{getStepLabel()}</span>
      </div>
      {step === 1 && renderTypeStep()}
      {step === 2 && renderContainerStep()}
      {step === 3 && renderProductStep()}
      <DialogFooter className="flex flex-wrap gap-2 justify-between">
        <Button variant="outline" onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <div className="flex items-center gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((prev) => Math.max(1, prev - 1))}>
              {t.common.previous}
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNextStep} disabled={!canAdvance()}>
              {t.common.next}
            </Button>
          ) : (
            <Button onClick={handleSave}>{t.sales.sellProductForm.saveButton}</Button>
          )}
        </div>
      </DialogFooter>
    </div>
  );
}

