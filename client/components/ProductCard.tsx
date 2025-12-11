import { Edit2, Trash2, Plus, Minus, FlipHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/I18nContext";
import { useState, useMemo, useRef, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  category: "spirits" | "wine" | "beer" | "soda" | "juice" | "other";
  price: number;
  quantity: number;
  unit: string;
  lastRestocked?: string;
  imageUrl?: string;
  subcategory?: string;
  origin?: string;
  bottleSizeInMl?: number;
}

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onAddStock?: (id: string, amount: number) => void;
  onRemoveStock?: (id: string, amount: number) => void;
  onClick?: (product: Product) => void;
  viewMode?: "grid" | "list";
}

const categoryColors = {
  spirits: "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500/30",
  wine: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30",
  beer: "bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-red-300 dark:border-red-900/30",
  soda: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30",
  juice: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/30",
  other: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30",
};

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onAddStock,
  onRemoveStock,
  onClick,
  viewMode = "grid",
}: ProductCardProps) {
  const { t } = useI18n();
  const isLowStock = product.quantity < 5;
  const [isFlipped, setIsFlipped] = useState(false);

  const categoryLabels = {
    spirits: t.productCard.categories?.spirits || "Spiritueux",
    wine: t.productCard.categories?.wine || "Vin",
    beer: t.productCard.categories?.beer || "Bière",
    soda: t.productCard.categories?.soda || "Boissons gazeuses",
    juice: t.productCard.categories?.juice || "Jus",
    other: t.productCard.categories?.other || "Autres",
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

  // Origin labels mapping
  const originLabels: Record<string, string> = {
    imported: t.inventory?.addProductModal?.origins?.imported || "Importé",
    canadian: t.inventory?.addProductModal?.origins?.canadian || "Canadien",
    quebec: t.inventory?.addProductModal?.origins?.quebec || "Québec",
    spain: t.inventory?.addProductModal?.origins?.spain || "Espagne",
    france: t.inventory?.addProductModal?.origins?.france || "France",
    italy: t.inventory?.addProductModal?.origins?.italy || "Italie",
    usa: t.inventory?.addProductModal?.origins?.usa || "États-Unis",
    australia: t.inventory?.addProductModal?.origins?.australia || "Australie",
    southAfrica: t.inventory?.addProductModal?.origins?.southAfrica || "Afrique du Sud",
    newZealand: t.inventory?.addProductModal?.origins?.newZealand || "Nouvelle-Zélande",
    portugal: t.inventory?.addProductModal?.origins?.portugal || "Portugal",
    chile: t.inventory?.addProductModal?.origins?.chile || "Chili",
    uk: t.inventory?.addProductModal?.origins?.uk || "Royaume-Uni",
  };

  // Subcategory labels mapping
  const subcategoryLabels: Record<string, string> = {
    redWine: t.inventory?.addProductModal?.subcategories?.redWine || "Vin rouge",
    whiteWine: t.inventory?.addProductModal?.subcategories?.whiteWine || "Vin blanc",
    roseWine: t.inventory?.addProductModal?.subcategories?.roseWine || "Vin rosé",
    scotchWhisky: t.inventory?.addProductModal?.subcategories?.scotchWhisky || "Scotch Whisky",
    liqueurCream: t.inventory?.addProductModal?.subcategories?.liqueurCream || "Liqueur/Crème",
    gin: t.inventory?.addProductModal?.subcategories?.gin || "Gin",
    rum: t.inventory?.addProductModal?.subcategories?.rum || "Rhum",
    vodka: t.inventory?.addProductModal?.subcategories?.vodka || "Vodka",
    tequila: t.inventory?.addProductModal?.subcategories?.tequila || "Tequila",
    cognacBrandy: t.inventory?.addProductModal?.subcategories?.cognacBrandy || "Cognac/Brandy",
  };

  // Calculate progress bar width
  const progressWidth = useMemo(
    () => Math.min((product.quantity / 20) * 100, 100),
    [product.quantity],
  );

  // Use ref to set dynamic width without inline styles
  const progressBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progressWidth}%`;
    }
  }, [progressWidth]);

  if (viewMode === "list") {
    return (
      <div
        onClick={() => onClick?.(product)}
        className="bg-card border-2 border-foreground/20 rounded-lg p-3 sm:p-4 hover:border-primary/50 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Product Image */}
          {product.imageUrl && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-foreground/20 bg-secondary flex-shrink-0">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-3 sm:gap-4 mt-1">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {t.productCard.stockLevel}: <span className={cn(
                  "font-semibold",
                  isLowStock ? "text-red-900 dark:text-red-200" : "text-green-600 dark:text-green-400"
                )}>
                  {product.quantity} {translateUnit(product.unit)}
                </span>
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground">
                ${product.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddStock?.(product.id, 1);
              }}
              className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 rounded transition-colors border-2 border-green-300 dark:border-green-500/30"
              aria-label="Add stock"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveStock?.(product.id, 1);
              }}
              className="p-1.5 sm:p-2 bg-red-100 dark:bg-destructive/20 text-red-700 dark:text-destructive hover:bg-red-200 dark:hover:bg-destructive/30 rounded transition-colors border-2 border-red-300 dark:border-destructive/30"
              aria-label="Remove stock"
            >
              <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(product);
              }}
              className="p-1.5 sm:p-2 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Edit product"
            >
              <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(product.id);
              }}
              className="p-1.5 sm:p-2 hover:bg-destructive/20 rounded transition-colors text-muted-foreground hover:text-destructive"
              aria-label="Delete product"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-foreground/20 rounded-lg cursor-pointer">
      {!isFlipped ? (
        // Front of card
        <div className="p-3 space-y-2 min-h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* Product Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-foreground/20 bg-secondary flex-shrink-0">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-transparent" />
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <h3 
                  className="font-semibold text-sm text-foreground line-clamp-2 flex-1 cursor-pointer hover:text-primary"
                  onClick={() => onClick?.(product)}
                >
                  {product.name}
                </h3>
                {/* Flip button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(true);
                  }}
                  className="p-1.5 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                  aria-label="Retourner la carte"
                  title="Retourner la carte"
                  type="button"
                >
                  <FlipHorizontal className="h-4 w-4" />
                </button>
              </div>
              <p className="text-base font-bold text-foreground">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Stock Status */}
          <div className="space-y-1" onClick={() => onClick?.(product)}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t.productCard.stockLevel}</span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  isLowStock ? "text-red-900 dark:text-red-200" : "text-green-600 dark:text-green-400",
                )}
              >
                {product.quantity} {translateUnit(product.unit)}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                ref={progressBarRef}
                className={cn(
                  "h-full transition-all",
                  isLowStock ? "bg-red-900 dark:bg-red-900" : "bg-green-500 dark:bg-green-500",
                )}
              />
            </div>
            {isLowStock && (
              <p className="text-xs text-red-900 dark:text-red-200 font-medium">{t.productCard.lowStock}</p>
            )}
          </div>

          {/* Actions - pushed to bottom */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-foreground/20 mt-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(product);
              }}
              className="p-2 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Edit product"
              type="button"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveStock?.(product.id, 1);
                }}
                className="flex items-center justify-center w-7 h-7 bg-red-100 dark:bg-destructive/20 text-red-700 dark:text-destructive hover:bg-red-200 dark:hover:bg-destructive/30 rounded transition-colors text-xs font-medium border border-red-300 dark:border-destructive/30"
                aria-label={t.productCard.remove}
                type="button"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddStock?.(product.id, 1);
                }}
                className="flex items-center justify-center w-7 h-7 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 rounded transition-colors text-xs font-medium border border-green-300 dark:border-green-500/30"
                aria-label={t.productCard.add}
                type="button"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(product.id);
              }}
              className="p-2 hover:bg-destructive/20 rounded transition-colors text-muted-foreground hover:text-destructive"
              aria-label="Delete product"
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        // Back of card
        <div className="p-4 space-y-3 h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-base text-foreground line-clamp-2 flex-1">
              {product.name}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="p-1.5 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
              aria-label="Retourner la carte"
              type="button"
            >
              <FlipHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium">Catégorie</span>
              <span className="text-sm font-semibold text-foreground">
                {categoryLabels[product.category]}
              </span>
            </div>
            {product.subcategory && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">Sous-catégorie</span>
                <span className="text-sm font-semibold text-foreground">
                  {subcategoryLabels[product.subcategory] || product.subcategory}
                </span>
              </div>
            )}
          </div>

          {/* Origin */}
          {product.origin && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium">Provenance</span>
              <span className="text-sm font-semibold text-foreground">
                {originLabels[product.origin] || product.origin}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
