import { useState, useEffect } from "react";
import ProductCard, { Product } from "@/components/ProductCard";
import AddProductModal from "@/components/AddProductModal";
import QRCodeScanner from "@/components/QRCodeScanner";
import { useAuth } from "@/hooks/useAuth";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/services/firestore";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { logInventoryChange } from "@/lib/audit";
import { getCurrentUserRole, hasPermission } from "@/lib/permissions";
import { ImportedProduct } from "@/components/ImportCSVModal";
import ImportCSVModal from "@/components/ImportCSVModal";
import { usei18n } from "@/contexts/I18nContext";
import Layout from "@/components/Layout";

const normalizeText = (value?: string) =>
  value?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? "";

const mapCategoryFromCSV = (category?: string): Product["category"] => {
  const value = normalizeText(category);
  if (
    value.includes("spirit") ||
    value.includes("liqueur") ||
    value.includes("spiritueux") ||
    value.includes("aperitif")
  ) {
    return "spirits";
  }
  if (value.includes("wine") || value.includes("vin")) return "wine";
  if (value.includes("beer") || value.includes("biere")) return "beer";
  if (
    value.includes("soda") ||
    value.includes("soft") ||
    value.includes("cooler") ||
    (value.includes("pret") && value.includes("boire"))
  ) {
    return "soda";
  }
  if (value.includes("juice") || value.includes("jus")) return "juice";
  return "other";
};

const normalizeFirestoreCategory = (category?: string): Product["category"] => {
  const allowed: Product["category"][] = ["spirits", "wine", "beer", "soda", "juice", "other"];
  if (category && allowed.includes(category as Product["category"])) {
    return category as Product["category"];
  }
  return mapCategoryFromCSV(category);
};

const inferUnitFromFormat = (format?: string): string => {
  if (!format) return "bottles";
  const lower = normalizeText(format);
  if (lower.includes("can")) return "cans";
  if (lower.includes("keg") || lower.includes("baril")) return "kegs";
  if (lower.includes("shot")) return "shots";
  return "bottles";
};

const parseBottleSizeInMl = (format?: string): number | undefined => {
  if (!format) return undefined;
  const match = normalizeText(format).match(/([\d,.]+)\s*(ml|l|cl|oz)/);
  if (!match) return undefined;
  const value = parseFloat(match[1].replace(",", "."));
  if (Number.isNaN(value)) return undefined;
  const unit = match[2];
  if (unit === "l") return Math.round(value * 1000);
  if (unit === "cl") return Math.round(value * 10);
  if (unit === "oz") return Math.round(value * 29.5735);
  return Math.round(value);
};

const cleanPrice = (price: string | number | undefined): number | null => {
  if (price === undefined || price === null) return null;
  const numeric = typeof price === "number"
    ? price
    : parseFloat(String(price).replace(/[^\d,.-]/g, "").replace(",", "."));
  if (Number.isNaN(numeric)) return null;
  return numeric;
};

const normalizeImportedRow = (row: ImportedProduct): Omit<Product, "id"> | null => {
  const name = row.name?.toString().trim();
  if (!name) return null;
  const price = cleanPrice(row.price);
  if (price === null) return null;
  const origin = row.origin?.toString().trim();
  return {
    name,
    category: mapCategoryFromCSV(row.category),
    price: Math.max(0, price),
    quantity: 0,
    unit: inferUnitFromFormat(row.format),
    origin: origin || undefined,
    bottleSizeInMl: parseBottleSizeInMl(row.format),
  } as Omit<Product, "id">;
};

export default function Inventory() {
  const { t } = usei18n();
  const { user } = useAuth();
  const role = getCurrentUserRole();
  const canAddProducts = hasPermission(role, "canAddProducts");
  const canEditProducts = hasPermission(role, "canEditProducts");
  const canDeleteProducts = hasPermission(role, "canDeleteProducts");
  const canAdjustQuantity = hasPermission(role, "canAdjustQuantity");
  const canManageProducts = canAddProducts || canEditProducts;

  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<
    "all" | "spirits" | "wine" | "beer" | "soda" | "juice" | "other"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("inventory-view-mode");
      if (saved === "list" || saved === "grid") return saved;
    }
    return "grid";
  });
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [importedProducts, setImportedProducts] = useState<ImportedProduct[]>([]);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const { addNotification } = useNotificationStore.getState();

  useEffect(() => {
    if (user?.uid) {
      getProducts(user.uid)
        .then((firestoreProducts) => {
          const mapped: Product[] = firestoreProducts.map((p) => ({
            id: p.id ?? "",
            name: p.name,
            category: normalizeFirestoreCategory(p.category),
            price: p.price,
            quantity: p.quantity,
            unit: p.unit,
            origin: (p as any).origin,
            bottleSizeInMl: (p as any).bottleSizeInMl,
            availableForSale: (p as any).availableForSale ?? true,
            imageUrl: (p as any).imageUrl,
          }));
          setProducts(mapped);
        })
        .catch((err) => {
          console.error("Erreur chargement produits Firestore:", err);
        });
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("inventory-view-mode", viewMode);
    }
  }, [viewMode]);

  const categories: Array<"all" | "spirits" | "wine" | "beer" | "soda" | "juice" | "other"> = [
    "all",
    "spirits",
    "wine",
    "beer",
    "soda",
    "juice",
    "other",
  ];

  const fallbackCategoryLabels: Record<(typeof categories)[number], string> = {
    all: "All Products",
    spirits: "Spirits",
    wine: "Wine",
    beer: "Beer",
    soda: "Soda",
    juice: "Juice",
    other: "Other",
  };

  const categoryLabels: Record<(typeof categories)[number], string> = categories.reduce(
    (acc, category) => {
      const translated = t.inventory.categories?.[category];
      acc[category] = translated && translated.trim().length > 0 ? translated : fallbackCategoryLabels[category];
      return acc;
    },
    {} as Record<(typeof categories)[number], string>,
  );

  const handleAddProduct = async (newProduct: Product) => {
    if (!user || !canAddProducts) return;
    try {
      const { id, ...productWithoutId } = newProduct;
      const cleanProduct: any = { ...productWithoutId };
      if (cleanProduct.subcategory == null) delete cleanProduct.subcategory;
      const added = await createProduct(user.uid, cleanProduct);
      if (added?.id) {
        setProducts((prev) => [...prev, added as Product]);
        await logInventoryChange({
          productId: added.id,
          productName: newProduct.name,
          action: "create",
          newQuantity: newProduct.quantity,
          newPrice: newProduct.price,
          source: "manual",
        });
        addNotification({
          title: "Produit ajouté",
          description: newProduct.name,
        });
      }
    } catch (error) {
      addNotification({
        title: "Erreur",
        description: "Impossible d'ajouter le produit",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    if (!canEditProducts) return;
    setEditingProduct(product);
    setIsAddProductModalOpen(true);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    if (!user) return;
    if (editingProduct) {
      if (!canEditProducts) return;
      try {
        const { id, ...updates } = updatedProduct;
        await updateProduct(user.uid, editingProduct.id, updates as any, { overwrite: true });
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p)));
        await logInventoryChange({
          productId: editingProduct.id,
          productName: updatedProduct.name,
          action: "update",
          previousQuantity: editingProduct.quantity,
          newQuantity: updatedProduct.quantity,
          previousPrice: editingProduct.price,
          newPrice: updatedProduct.price,
          source: "manual",
        });
        setEditingProduct(null);
        addNotification({ title: "Produit modifié", description: updatedProduct.name });
      } catch (error) {
        addNotification({
          title: "Erreur",
          description: "Impossible de mettre à jour le produit",
          variant: "destructive",
        });
      }
    } else {
      if (!canAddProducts) return;
      handleAddProduct(updatedProduct);
    }
  };

  const adjustProductQuantity = async (id: string, delta: number) => {
    if (!user || !canAdjustQuantity) return;
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const previousQuantity = target.quantity ?? 0;
    const newQuantity = Math.max(0, previousQuantity + delta);
    if (newQuantity === previousQuantity) return;
    try {
      await updateProduct(user.uid, id, { quantity: newQuantity } as { quantity: number });
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: newQuantity } : p)));
      await logInventoryChange({
        productId: id,
        productName: target.name,
        action: delta >= 0 ? "restock" : "adjustment",
        previousQuantity,
        newQuantity,
        source: "manual",
      });
    } catch (error) {
      addNotification({
        title: "Erreur",
        description: "Impossible de mettre à jour le stock",
        variant: "destructive",
      });
    }
  };

  const handleRemoveStock = (id: string, amount: number) => {
    if (!canAdjustQuantity) return;
    adjustProductQuantity(id, -Math.abs(amount));
  };

  const handleAddStock = (id: string, amount: number) => {
    if (!canAdjustQuantity) return;
    adjustProductQuantity(id, Math.abs(amount));
  };

  const handleDelete = async (product: Product) => {
    if (!user || !canDeleteProducts) return;
    try {
      await deleteProduct(user.uid, product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      await logInventoryChange({
        productId: product.id,
        productName: product.name,
        action: "delete",
        previousQuantity: product.quantity,
        newQuantity: 0,
        previousPrice: product.price,
        newPrice: 0,
        source: "manual",
      });
      addNotification({ title: "Produit supprimé", description: product.name });
    } catch (error) {
      addNotification({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
    }
  };

  const totalValue = products.reduce((sum, p) => sum + (p.price ?? 0) * (p.quantity ?? 0), 0);
  const totalArticles = products.reduce((sum, p) => sum + (p.quantity ?? 0), 0);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    const matchesSearch =
      searchTerm.trim() === "" ||
      product.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleImportProducts = async (rows: ImportedProduct[]) => {
    setImportedProducts(rows);
    if (!user || !canAddProducts) {
      addNotification({
        title: "Import CSV",
        description: "Connectez-vous avec un profil autorisé pour importer.",
        variant: "destructive",
      });
      return;
    }

    const normalized = rows
      .map((row) => normalizeImportedRow(row))
      .filter((product): product is Omit<Product, "id"> => Boolean(product));

    if (!normalized.length) {
      addNotification({
        title: "Import CSV",
        description: "Aucun produit valide trouvé dans le fichier.",
        variant: "destructive",
      });
      return;
    }

    const created: Product[] = [];
    let failed = 0;

    for (const productData of normalized) {
      try {
        const createdProduct = await createProduct(user.uid, productData as any);
        if (createdProduct?.id) {
          created.push(createdProduct as Product);
          await logInventoryChange({
            productId: createdProduct.id,
            productName: createdProduct.name,
            action: "create",
            newQuantity: createdProduct.quantity ?? 0,
            newPrice: createdProduct.price,
            source: "import",
          });
        }
      } catch (error) {
        failed += 1;
      }
    }

    if (created.length) {
      setProducts((prev) => [...prev, ...created]);
      addNotification({
        title: "Import réussi",
        description: `${created.length} produit(s) ajouté(s)`,
      });
    }

    if (failed) {
      addNotification({
        title: "Import CSV",
        description: `${failed} produit(s) n'ont pas pu être importés`,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">{t.inventory.title || "Inventaire"}</h1>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <div className="flex items-center gap-1 bg-secondary border-2 border-foreground/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Mode grille"
                aria-label="Mode grille"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Mode liste"
                aria-label="Mode liste"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-foreground/30 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              onClick={() => setShowImportCSV(true)}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {t.settings?.import?.importInventory || "Importer CSV"}
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors ${
                canAddProducts
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
              onClick={() => {
                if (canAddProducts) {
                  setIsAddProductModalOpen(true);
                  setEditingProduct(null);
                }
              }}
              disabled={!canAddProducts}
              title={
                canAddProducts
                  ? undefined
                  : "Seuls les propriétaires, admins et managers peuvent ajouter des produits."
              }
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t.inventory.addProduct || "Ajouter un produit"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card border-2 border-foreground/20 rounded-lg p-3 sm:p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {t.inventory.totalInventoryValue || "Valeur totale"}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
              ${totalValue.toFixed(2)}
            </p>
          </div>
          <div className="bg-card border-2 border-foreground/20 rounded-lg p-3 sm:p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {t.inventory.totalProducts || "Nombre de produits"}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{products.length}</p>
          </div>
          <div className="bg-card border-2 border-foreground/20 rounded-lg p-3 sm:p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {t.inventory.lowStockItems || "Articles"}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{totalArticles}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder={t.inventory.searchProducts || "Rechercher un produit"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-12 py-2 bg-secondary border-2 border-foreground/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={() => setIsQRScannerOpen(true)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-secondary rounded transition-colors"
                title="Scanner QR Code"
                aria-label="Scanner QR Code"
              >
                <svg
                  className="h-4 w-4 text-muted-foreground hover:text-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <path d="M8.5 8.5h.01M15.5 8.5h.01M8.5 15.5h.01M15.5 15.5h.01" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={
                  `px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ` +
                  (filterCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground")
                }
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddStock={canAdjustQuantity ? handleAddStock : undefined}
                onRemoveStock={canAdjustQuantity ? handleRemoveStock : undefined}
                onDelete={canDeleteProducts ? ((id: string) => {
                  const toDelete = products.find((p) => p.id === id);
                  if (toDelete) handleDelete(toDelete);
                }) : undefined}
                onEdit={canEditProducts ? handleEdit : undefined}
                onClick={canEditProducts ? handleEdit : undefined}
                viewMode="grid"
                canEdit={canEditProducts}
                canDelete={canDeleteProducts}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddStock={canAdjustQuantity ? handleAddStock : undefined}
                onRemoveStock={canAdjustQuantity ? handleRemoveStock : undefined}
                onDelete={canDeleteProducts ? ((id: string) => {
                  const toDelete = products.find((p) => p.id === id);
                  if (toDelete) handleDelete(toDelete);
                }) : undefined}
                onEdit={canEditProducts ? handleEdit : undefined}
                onClick={canEditProducts ? handleEdit : undefined}
                viewMode="list"
                canEdit={canEditProducts}
                canDelete={canDeleteProducts}
              />
            ))}
          </div>
        )}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t.inventory.noProductsFound || "Aucun produit trouvé"}</p>
          </div>
        )}
      </div>
      <AddProductModal
        isOpen={isAddProductModalOpen && canManageProducts}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleUpdateProduct}
        editingProduct={editingProduct}
        importedProducts={importedProducts}
      />
      {showImportCSV && (
        <ImportCSVModal
          onImport={(rows) => {
            handleImportProducts(rows);
            setShowImportCSV(false);
          }}
          onClose={() => setShowImportCSV(false)}
        />
      )}
      <QRCodeScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={(result) => {
          try {
            const productData = JSON.parse(result);
            if (productData.id || productData.code) {
              const productId = productData.id || productData.code;
              const foundProduct = products.find((p) => p.id === productId);
              if (foundProduct) {
                setSearchTerm(foundProduct.name);
                setTimeout(() => {
                  const element = document.querySelector(`[data-product-id="${productId}"]`);
                  element?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
              } else {
                setSearchTerm(productData.name || productId);
              }
            } else if (productData.name) {
              setSearchTerm(productData.name);
            } else {
              setSearchTerm(result);
            }
          } catch {
            setSearchTerm(result);
          }
        }}
      />
    </Layout>
  );
}
