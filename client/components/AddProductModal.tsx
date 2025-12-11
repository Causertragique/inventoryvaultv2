import { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { useI18n } from "@/contexts/I18nContext";
import { Product } from "./ProductCard";
import { Download, RefreshCw, Search, Image as ImageIcon } from "lucide-react";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  editingProduct?: Product | null;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
}: AddProductModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subcategory: "",
    origin: "",
    quantity: "",
    pricePerBottle: "",
    inventoryCode: "",
    imageUrl: "",
    bottleSizeInMl: "",
  });

  // Load product data when editing
  useEffect(() => {
    if (editingProduct && isOpen) {
      // Map product category back to form category
      const mapProductCategoryToFormCategory = (
        category: "spirits" | "wine" | "beer" | "soda" | "juice" | "other"
      ): string => {
        if (category === "spirits") return "spirits";
        if (category === "beer") return "beer";
        if (category === "wine") return "wine";
        if (category === "soda") return "soda";
        if (category === "juice") return "juice";
        if (category === "other") return "other";
        return "other"; // Default fallback
      };

      setFormData({
        name: editingProduct.name || "",
        category: mapProductCategoryToFormCategory(editingProduct.category),
        subcategory: editingProduct.subcategory || "",
        origin: editingProduct.origin || "",
        quantity: editingProduct.quantity.toString() || "",
        pricePerBottle: editingProduct.price.toString() || "",
        inventoryCode: editingProduct.id || "",
        imageUrl: editingProduct.imageUrl || "",
        bottleSizeInMl: (editingProduct.bottleSizeInMl || "").toString(),
      });
      setWasCodeManuallySet(true); // Don't auto-generate when editing
    } else if (!editingProduct && isOpen) {
      // Reset form when adding new product
      setFormData({
        name: "",
        category: "",
        subcategory: "",
        origin: "",
        quantity: "",
        pricePerBottle: "",
        inventoryCode: "",
        imageUrl: "",
        bottleSizeInMl: "",
      });
      setWasCodeManuallySet(false);
    }
  }, [editingProduct, isOpen]);

  const [qrCodeValue, setQrCodeValue] = useState("");
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{
    imageUrl: string;
    productPageUrl: string;
    title: string;
    snippet?: string;
    }>
  >([]);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [forceSAQSearch, setForceSAQSearch] = useState<boolean>(true); // Default to SAQ
  const PRODUCTS_PER_PAGE = 5;
  const MAX_PAGES = 3;
  const isMountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch product options from SAQ.com (returns multiple results)
  // MUST be defined before searchProductImage
  const fetchProductOptions = async (
    _searchQuery: string,
    productName: string
  ): Promise<
    Array<{
    imageUrl: string;
    productPageUrl: string;
    title: string;
    snippet?: string;
    }>
  > => {
    try {
      const GOOGLE_API_KEY =
        import.meta.env.VITE_GOOGLE_API_KEY ||
        localStorage.getItem("google_api_key");
      const GOOGLE_CX =
        import.meta.env.VITE_GOOGLE_CX ||
        localStorage.getItem("google_cx") ||
        "2604700cf916145eb"; // CX par défaut

      if (
        !GOOGLE_API_KEY ||
        !GOOGLE_CX ||
        GOOGLE_API_KEY === "YOUR_GOOGLE_API_KEY"
      ) {
        console.warn(
          "[Image search] Google API key or CX missing / invalid. Check VITE_GOOGLE_API_KEY and VITE_GOOGLE_CX."
        );
        return [];
      }

      const keywords = productName
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      if (!keywords.length) {
        return [];
      }

      // Determine search scope based on category or forced preference
      // Beer, juice, soda, and snacks are not sold at SAQ - use general web search
      const currentCategory = formData.category.toLowerCase();
      const isNonSAQCategory = 
        currentCategory === "beer" || 
        currentCategory === "juice" ||
        currentCategory === "soda" ||
        currentCategory === "readytodrink" || 
        currentCategory === "other" ||
        currentCategory.includes("snack");
      
      // Determine if we should search SAQ based on forced preference or category
      const shouldSearchSAQ = forceSAQSearch;
      
      let googleQuery: string;
      if (shouldSearchSAQ) {
        // SAQ-specific search for spirits and wine
        googleQuery = `${keywords.join(" ")} site:saq.com`;
        console.log("[Image search] SAQ-specific search (forced or default):", googleQuery);
      } else {
        // Add category-specific search terms for better results
        let categoryTerm = "";
        if (currentCategory === "beer") {
          categoryTerm = "beer brewery";
        } else if (currentCategory === "juice") {
          categoryTerm = "juice beverage";
        } else if (currentCategory === "soda") {
          categoryTerm = "soda soft drink";
        } else if (currentCategory === "readytodrink") {
          categoryTerm = "ready to drink cocktail";
        } else if (currentCategory.includes("snack")) {
          categoryTerm = "snack food";
        } else {
          categoryTerm = "product";
        }
        
        // General web search for non-SAQ products with category context
        googleQuery = `${keywords.join(" ")} ${categoryTerm}`;
        console.log("[Image search] Category-specific web search (forced or default):", googleQuery);
      }

      const webSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(
        googleQuery
      )}&num=10&safe=active`;

      const webResponse = await fetch(webSearchUrl);
      if (!webResponse.ok) {
        const errorText = await webResponse.text().catch(() => "");
        console.error(
          "[Image search] Google API error:",
          webResponse.status,
          errorText.slice(0, 200)
        );
        return [];
      }

      const webData = await webResponse.json();
      const allItems: any[] = webData.items || [];
      console.log(
        "[Image search] Google items:",
        allItems.length,
        webData.searchInformation?.totalResults
      );
      
      // Log des URLs pour déboguer
      if (allItems.length > 0) {
        console.log("[Image search] All URLs from Google:", allItems.map((item: any) => ({
          link: item.link,
          displayLink: item.displayLink,
          title: item.title?.substring(0, 50),
          pagemap: item.pagemap ? "Has pagemap" : "No pagemap"
        })));
      }
      
      // Extraire les images depuis les résultats web si disponibles (pagemap)
      const webImages: any[] = [];
      allItems.forEach((item: any) => {
        // Vérifier pagemap pour les images
        if (item.pagemap) {
          // Essayer différents formats d'images dans pagemap
          const imageSources = [
            item.pagemap.cse_image,
            item.pagemap.image,
            item.pagemap.metatags?.find((tag: any) => tag["og:image"] || tag["twitter:image"]),
          ].filter(Boolean);
          
          imageSources.forEach((images: any) => {
            const imgArray = Array.isArray(images) ? images : [images];
            imgArray.forEach((img: any) => {
              const imageUrl = img.src || img.url || img;
              if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
                webImages.push({
                  imageUrl: imageUrl,
                  contextUrl: item.link,
                  thumbnailUrl: imageUrl,
                });
                }
            });
          });
        }
      });
      console.log("[Image search] Images extracted from web results:", webImages.length);

      // Filter products based on search source preference (SAQ vs Web)
      let productPages: any[];
      
      if (shouldSearchSAQ) {
        // Force SAQ search - filter SAQ pages only
        productPages = allItems
          .filter((item: any) => {
            const link = (item.link || "").toLowerCase();
            const displayLink = (item.displayLink || "").toLowerCase();
            const isSAQ = link.includes("saq.com") || displayLink.includes("saq.com");
            
            if (!isSAQ) {
              return false;
            }
            
            const isNotProductPage = 
              link.includes("/recherche") ||
              link.includes("/search") ||
              link.includes("/accueil") ||
              link.includes("/home");
            
            return !isNotProductPage;
          })
          .slice(0, 15)
          .map((item: any) => ({
            productPageUrl: item.link,
            title: item.title || "",
            snippet: item.snippet || item.htmlSnippet || "",
            imageUrl: "",
          }));
        
        console.log("[Image search] SAQ product pages filtered:", productPages.length);
      } else {
        // Web search - accept all results except navigation pages
        productPages = allItems
          .filter((item: any) => {
            const link = (item.link || "").toLowerCase();
            // Exclude common non-product pages
            const isNotProductPage = 
              link.includes("/search") ||
              link.includes("/recherche") ||
              link === "/" ||
              link.endsWith("/fr") ||
              link.endsWith("/en");
            return !isNotProductPage;
          })
          .slice(0, 15)
          .map((item: any) => ({
            productPageUrl: item.link,
            title: item.title || "",
            snippet: item.snippet || item.htmlSnippet || "",
            imageUrl: "",
          }));
        
        console.log("[Image search] Web product pages filtered:", productPages.length);
      }
            
      if (productPages.length > 0) {
        console.log("[Image search] Sample product:", {
          title: productPages[0].title,
          snippet: productPages[0].snippet?.substring(0, 100),
          url: productPages[0].productPageUrl,
        });
      }

      if (!productPages.length) {
        console.warn("[Image search] No product pages found after filtering");
        return [];
      }

      // Chercher des images via l'API backend (fallback si pas d'images dans web results)
      let allImageItems: any[] = [...webImages]; // Commencer avec les images extraites des résultats web
      
      // Si on n'a pas assez d'images, essayer l'API backend
      if (allImageItems.length === 0) {
              try {
                const imageResponse = await fetch("/api/image-search", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productName }),
                });
                
                if (imageResponse.ok) {
            const imageData = await imageResponse
              .json()
              .catch(() => ({ images: [] }));
            console.log("[Image search] backend /api/image-search response:", imageData);

                  if (imageData.images && imageData.images.length > 0) {
                    allImageItems = imageData.images.map((img: any) => ({
                imageUrl: img.imageUrl,
                contextUrl: img.contextUrl,
                thumbnailUrl: img.thumbnailUrl,
                    }));
                  }
                } else {
            console.warn(
              "[Image search] /api/image-search HTTP error:",
              imageResponse.status,
              "- Using web results images only"
            );
                }
        } catch (e: any) {
          console.warn(
            "[Image search] /api/image-search failed:",
            e?.message || e,
            "- Using web results images only"
          );
        }
      }

      console.log(
        "[Image search] Total images available:",
        allImageItems.length,
        "(from web:", webImages.length,
        "from API:", allImageItems.length - webImages.length + ")"
      );

      // Associer les images aux produits
      const results: Array<{
                  imageUrl: string;
                  productPageUrl: string;
                  title: string;
                  snippet?: string;
      }> = productPages.map((product, index) => {
        // Essayer de trouver une image correspondante
        let match = allImageItems.find((img: any) => {
          if (!img.contextUrl) return false;
          const contextUrl = img.contextUrl.toLowerCase();
          const productUrl = product.productPageUrl.toLowerCase();
          // Correspondance exacte ou partielle
          return contextUrl === productUrl || 
                 contextUrl.includes(productUrl) || 
                 productUrl.includes(contextUrl) ||
                 // Extraire l'ID produit de l'URL SAQ (ex: /en/308155 ou /fr/308155)
                 (productUrl.match(/\/(en|fr)\/(\d+)/) && contextUrl.includes(productUrl.match(/\/(en|fr)\/(\d+)/)?.[2] || ""));
        });
        
        // Si pas de match exact, utiliser l'image à la même position ou la première disponible
        if (!match && allImageItems.length > 0) {
          match = allImageItems[index] || allImageItems[0];
        }

        return {
          imageUrl: match?.imageUrl || "",
                productPageUrl: product.productPageUrl,
                title: product.title,
                snippet: product.snippet,
        };
      });

      console.log("[Image search] final product options:", results.length);
      if (results.length > 0) {
        console.log("[Image search] Sample result:", {
          title: results[0].title,
          snippet: results[0].snippet?.substring(0, 100),
          imageUrl: results[0].imageUrl ? "Found" : "Missing",
          url: results[0].productPageUrl,
        });
      }
      return results;
    } catch (error) {
      console.error("Error fetching product options:", error);
      return [];
    }
  };

  // Auto-generate QR code when inventory code and name are both filled
  useEffect(() => {
    if (formData.inventoryCode && formData.name) {
      const qrData = JSON.stringify({
        id: formData.inventoryCode,
        name: formData.name,
        code: formData.inventoryCode,
        category: formData.category,
        price: formData.pricePerBottle,
      });
      setQrCodeValue(qrData);
    } else if (!formData.inventoryCode) {
      setQrCodeValue("");
    }
  }, [
    formData.inventoryCode,
    formData.name,
    formData.category,
    formData.pricePerBottle,
  ]);

  // Auto-generate inventory code if empty (only when name changes and code is still empty)
  const [wasCodeManuallySet, setWasCodeManuallySet] = useState(false);
  
  useEffect(() => {
    if (!formData.inventoryCode && formData.name && !wasCodeManuallySet) {
      const code =
        formData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 8) + Date.now().toString().slice(-6);
      setFormData((prev) => ({ ...prev, inventoryCode: code }));
    }
  }, [formData.name, formData.inventoryCode, wasCodeManuallySet]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Track if user manually sets the inventory code
    if (field === "inventoryCode" && value) {
      setWasCodeManuallySet(true);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => {
      let bottleSizeDefault = "";
      // Set default bottle size based on category
      if (category === "spirits") {
        bottleSizeDefault = "750";
      } else if (category === "wine" || category === "aperitif" || category === "champagne") {
        bottleSizeDefault = "750";
      } else if (category === "beer") {
        bottleSizeDefault = "341"; // Standard beer bottle (12 oz)
      }
      
      return {
        ...prev,
        category,
        subcategory: "",
        bottleSizeInMl: bottleSizeDefault,
      };
    });
  };

  const getSubcategories = () => {
    const category = formData.category;
    if (category === "wine") {
      return [
        {
          value: "redWine",
          label: t.inventory.addProductModal.subcategories.redWine,
        },
        {
          value: "whiteWine",
          label: t.inventory.addProductModal.subcategories.whiteWine,
        },
        {
          value: "roseWine",
          label: t.inventory.addProductModal.subcategories.roseWine,
        },
      ];
    } else if (category === "spirits") {
      return [
        {
          value: "scotchWhisky",
          label: t.inventory.addProductModal.subcategories.scotchWhisky,
        },
        {
          value: "liqueurCream",
          label: t.inventory.addProductModal.subcategories.liqueurCream,
        },
        {
          value: "gin",
          label: t.inventory.addProductModal.subcategories.gin,
        },
        {
          value: "rum",
          label: t.inventory.addProductModal.subcategories.rum,
        },
        {
          value: "vodka",
          label: t.inventory.addProductModal.subcategories.vodka,
        },
        {
          value: "tequila",
          label: t.inventory.addProductModal.subcategories.tequila,
        },
        {
          value: "cognacBrandy",
          label: t.inventory.addProductModal.subcategories.cognacBrandy,
        },
      ];
    }
    return [];
  };

  const generateQRCode = () => {
    const code = formData.inventoryCode || `PROD-${Date.now()}`;
    const qrData = JSON.stringify({
      id: code,
      name: formData.name,
      code: code,
      category: formData.category,
      price: formData.pricePerBottle,
    });
    setQrCodeValue(qrData);
    // If inventory code is empty, set it
    if (!formData.inventoryCode) {
      setFormData((prev) => ({ ...prev, inventoryCode: code }));
      setWasCodeManuallySet(false);
    }
  };

  // Search for product image intelligently
  const searchProductImage = async () => {
    if (!formData.name.trim()) {
      alert(
        t.inventory.addProductModal.fillRequiredFields ||
          "Veuillez d'abord entrer le nom du produit"
      );
      return;
    }

    setIsSearchingImage(true);
    try {
      const productName = formData.name.trim();
      
      console.log("Searching for products on SAQ.com:", productName);
      
      const results = await fetchProductOptions(productName, productName);
      
      if (results && results.length > 0) {
        if (results.length === 1) {
          // Si un seul résultat, appliquer directement
          // Ne pas remettre isSearchingImage à false ici car applyProductResult le gère
          const result = results[0];
          setIsSearchingImage(false); // Remettre à false avant d'appeler applyProductResult
          await applyProductResult(result);
          return; // Sortir pour éviter le finally qui remettrait isSearchingImage à false
        } else {
          setSearchResults(results);
          setCurrentPage(1); // Reset to first page
          setShowProductSelection(true);
        }
      } else {
        console.log(
          "No product options found for:",
          formData.name
        );
        const message =
          t.inventory.addProductModal.imageNotFound ||
          "Aucune image trouvée automatiquement. Vous pouvez entrer l'URL de l'image manuellement dans le champ ci-dessous.";
        alert(message);
      }
    } catch (error) {
      console.error("Error searching for image:", error);
      if (!isMountedRef.current) return;
      const errorMessage =
        t.inventory.addProductModal.imageSearchError ||
        "Erreur lors de la recherche d'image. Vous pouvez entrer l'URL manuellement dans le champ ci-dessous.";
      alert(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setIsSearchingImage(false);
      }
    }
  };

  // Fetch product details from SAQ.com page via backend
  const fetchProductDetailsFromSAQ = async (
    productPageUrl: string
  ): Promise<{
    category?: string;
    subcategory?: string;
    origin?: string;
    price?: number;
  } | null> => {
    try {
      // Accept both saq.com and www.saq.com
      if (
        !productPageUrl ||
        (!productPageUrl.includes("saq.com") &&
          !productPageUrl.includes("www.saq.com"))
      ) {
        return null;
      }
      
      // Use backend endpoint to scrape SAQ page (avoids CORS issues)
      const response = await fetch(
        `/api/saq-scrape?url=${encodeURIComponent(productPageUrl)}`
      );
      
      if (response.ok) {
        const details = await response.json();
        console.log("Product details extracted from SAQ:", details);
        return details;
      } else {
        console.log("Failed to fetch product details from backend");
        return null;
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    }
  };

  // Apply selected product result to form
  const applyProductResult = async (result: {
    imageUrl: string;
    productPageUrl: string;
    title?: string;
  }) => {
    setIsSearchingImage(true);
    try {
      const details = await fetchProductDetailsFromSAQ(result.productPageUrl);
      
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        setIsSearchingImage(false);
        return;
      }
      
      const updates: Partial<typeof formData> = { 
        imageUrl: result.imageUrl || "",
      };
      
      // Fill product name from title if available and name field is empty
      if (result.title && result.title.trim()) {
        const currentName = formData.name.trim();
        // Only update name if it's empty or very short (less than 3 chars)
        if (!currentName || currentName.length < 3) {
          // Clean up the title (remove common prefixes/suffixes from SAQ)
          let cleanTitle = result.title.trim();
          // Remove common SAQ prefixes
          cleanTitle = cleanTitle.replace(/^SAQ\s*-\s*/i, "");
          cleanTitle = cleanTitle.replace(/\s*-\s*SAQ$/i, "");
          updates.name = cleanTitle;
        }
      }
      
      if (details) {
        // Map category
        if (details.category) {
          const categoryMap: Record<string, string> = {
            spiritueux: "spirits",
            spirits: "spirits",
            vin: "wine",
            wine: "wine",
            bière: "beer",
            beer: "beer",
            cidre: "beer",
            champagne: "wine",
            aperitif: "wine",
            aperitifs: "wine",
            jus: "juice",
            juice: "juice",
            soda: "soda",
            "boisson gazeuse": "soda",
            "soft drink": "soda",
            "ready-to-drink": "readyToDrink",
            "ready to drink": "readyToDrink",
            autre: "other",
            other: "other",
            autres: "other",
          };
          const categoryLower = details.category.toLowerCase().trim();
          const mappedCategory =
            categoryMap[categoryLower] ||
            (categoryLower in categoryMap
              ? categoryMap[categoryLower]
              : details.category);
          if (mappedCategory) {
            updates.category = mappedCategory;
            console.log(
              `Category mapped: ${details.category} -> ${mappedCategory}`
            );
          }
        }
        
        // Map subcategory (normalize common subcategories)
        if (details.subcategory) {
          const subcategoryLower = details.subcategory.toLowerCase().trim();
          const subcategoryMap: Record<string, string> = {
            vodka: "vodka",
            gin: "gin",
            rum: "rum",
            rhum: "rum",
            tequila: "tequila",
            whisky: "scotchWhisky",
            whiskey: "scotchWhisky",
            scotch: "scotchWhisky",
            cognac: "cognacBrandy",
            brandy: "cognacBrandy",
            liqueur: "liqueurCream",
            cream: "liqueurCream",
            crème: "liqueurCream",
            "red wine": "redWine",
            "vin rouge": "redWine",
            "white wine": "whiteWine",
            "vin blanc": "whiteWine",
            rosé: "roseWine",
            "rose wine": "roseWine",
            "vin rosé": "roseWine",
          };
          const mappedSubcategory =
            subcategoryMap[subcategoryLower] || details.subcategory;
          updates.subcategory = mappedSubcategory;
        }
        
        // Map origin to match Select values
        if (details.origin && details.origin.trim()) {
          const originLower = details.origin.toLowerCase().trim();
          const originMap: Record<string, string> = {
            canada: "canadian",
            canadien: "canadian",
            canadienne: "canadian",
            québec: "quebec",
            quebec: "quebec",
            québécois: "quebec",
            québécoise: "quebec",
            espagne: "spain",
            spain: "spain",
            france: "france",
            français: "france",
            française: "france",
            italie: "italy",
            italy: "italy",
            italien: "italy",
            italienne: "italy",
            "états-unis": "usa",
            usa: "usa",
            "united states": "usa",
            australie: "australia",
            australia: "australia",
            "afrique du sud": "southAfrica",
            "south africa": "southAfrica",
            "nouvelle-zélande": "newZealand",
            "new zealand": "newZealand",
            portugal: "portugal",
            chili: "chile",
            chile: "chile",
            "royaume-uni": "uk",
            "united kingdom": "uk",
            uk: "uk",
          };
          const mappedOrigin =
            originMap[originLower] || details.origin.trim();
          updates.origin = mappedOrigin;
          console.log(
            `Origin mapped: ${details.origin} -> ${mappedOrigin}`
          );
        }
        
        // Fill price
        if (details.price) {
          updates.pricePerBottle = details.price.toString();
        }
        
        // Fill bottle size in ml
        if (details.bottleSizeInMl) {
          updates.bottleSizeInMl = details.bottleSizeInMl.toString();
        }
      }
      
      setFormData((prev) => ({
        name: (updates.name ?? prev.name) || "",
        category: (updates.category ?? prev.category) || "",
        subcategory: (updates.subcategory ?? prev.subcategory) || "",
        origin: (updates.origin ?? prev.origin) || "",
        quantity: prev.quantity || "",
        pricePerBottle: (updates.pricePerBottle ?? prev.pricePerBottle) || "",
        inventoryCode: prev.inventoryCode || "",
        imageUrl: (updates.imageUrl ?? prev.imageUrl) || "",
        bottleSizeInMl: (updates.bottleSizeInMl ?? prev.bottleSizeInMl) || "",
      }));
      
      setShowProductSelection(false);
    } catch (error) {
      console.error("Error applying product result:", error);
    } finally {
      if (isMountedRef.current) {
        setIsSearchingImage(false);
      }
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeValue) return;

    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      const fileName = `${
        formData.inventoryCode || "product"
      }-qr-code.png`;
      downloadLink.download = fileName;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleSave = () => {
    if (
      !formData.name ||
      !formData.category ||
      !formData.quantity ||
      !formData.pricePerBottle
    ) {
      alert(t.inventory.addProductModal.fillRequiredFields);
      return;
    }

    // Generate QR code if not already generated
    if (!qrCodeValue && formData.inventoryCode) {
      generateQRCode();
    }

    const product: Product = {
      // Use the inventory code as ID (can be modified during edit)
      id: formData.inventoryCode || `product-${Date.now()}`,
      name: formData.name,
      category: mapCategoryToProductCategory(formData.category),
      price: parseFloat(formData.pricePerBottle) || 0,
      quantity: parseInt(formData.quantity) || 0,
      unit: editingProduct?.unit || "bottles",
      lastRestocked:
        editingProduct?.lastRestocked ||
        new Date().toISOString().split("T")[0],
      imageUrl: formData.imageUrl || undefined,
      subcategory: formData.subcategory || undefined,
      origin: formData.origin || undefined,
      bottleSizeInMl: formData.bottleSizeInMl ? parseInt(formData.bottleSizeInMl) : undefined,
    };

    onSave(product);
    handleClose();
  };

  const mapCategoryToProductCategory = (
    category: string
  ): "spirits" | "wine" | "beer" | "soda" | "juice" | "other" => {
    if (category === "spirits") return "spirits";
    if (category === "beer") return "beer";
    if (
      category === "wine" ||
      category === "aperitif" ||
      category === "champagne"
    )
      return "wine";
    if (category === "juice") return "juice";
    if (category === "soda") return "soda";
    if (category === "readyToDrink") return "soda";
    if (category === "other") return "other";
    return "other";
  };

  const handleClose = () => {
    setFormData({
      name: "",
      category: "",
      subcategory: "",
      origin: "",
      quantity: "",
      pricePerBottle: "",
      inventoryCode: "",
      imageUrl: "",
      bottleSizeInMl: "",
    });
    setQrCodeValue("");
    setWasCodeManuallySet(false);
    setSearchResults([]);
    setShowProductSelection(false);
    setCurrentPage(1);
    setForceSAQSearch(true); // Reset to SAQ by default
    onClose();
  };

  const totalPages = Math.min(
    Math.ceil(searchResults.length / PRODUCTS_PER_PAGE),
    MAX_PAGES
  );
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentPageResults = searchResults.slice(startIndex, endIndex);

  // Determine if category is required for search
  // Non-SAQ categories (beer, juice, soda, snacks, other) require category for better results
  // SAQ categories (spirits, wine, etc.) don't require it since SAQ has everything
  const isCategoryRequiredForSearch = () => {
    const category = formData.category.toLowerCase();
    const isNonSAQCategory = 
      category === "beer" || 
      category === "juice" ||
      category === "soda" ||
      category === "readytodrink" || 
      category === "other" ||
      category.includes("snack");
    
    // If a non-SAQ category is selected, it's no longer required (already selected)
    // If no category selected, it's only required if we would do a non-SAQ search
    // Since we don't know yet, we need category for non-SAQ searches
    return isNonSAQCategory ? false : !formData.category.trim();
  };

  // Button is disabled if: name is empty OR (category required AND category empty) OR search in progress
  const isSearchDisabled = !formData.name.trim() || isCategoryRequiredForSearch() || isSearchingImage;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
              {editingProduct
                ? t.inventory.addProductModal.editTitle ||
                  "Modifier le produit"
                : t.inventory.addProductModal.title}
          </DialogTitle>
          <DialogDescription>
              {editingProduct
                ? t.inventory.addProductModal.editDescription ||
                  "Modifiez les informations du produit"
                : t.inventory.addProductModal.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Product Name */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="name">
                  {t.inventory.addProductModal.name} *
                </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={searchProductImage}
                disabled={isSearchDisabled}
                className="gap-2"
              >
                {isSearchingImage ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                      {t.inventory.addProductModal.searchingImage ||
                        "Recherche..."}
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                      {t.inventory.addProductModal.searchImage ||
                        "Rechercher"}
                  </>
                )}
              </Button>
            </div>
            
            {/* SAQ/Non-SAQ Toggle */}
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchSource"
                  checked={forceSAQSearch === true}
                  onChange={() => setForceSAQSearch(true)}
                  className="cursor-pointer"
                />
                <span className="text-sm font-medium">SAQ</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchSource"
                  checked={forceSAQSearch === false}
                  onChange={() => setForceSAQSearch(false)}
                  className="cursor-pointer"
                />
                <span className="text-sm font-medium">Web</span>
              </label>
            </div>
            
            <Input
              id="name"
                name="name"
                autoComplete="name"
              value={formData.name || ""}
                onChange={(e) =>
                  handleInputChange("name", e.target.value)
                }
              placeholder={t.inventory.addProductModal.name}
            />
          </div>

          {/* Product Image URL */}
          <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imageUrl">
                {t.inventory.addProductModal.imageUrl || "URL de l'image"}
              </Label>
            <div className="flex gap-4 items-start">
              <Input
                id="imageUrl"
                  name="imageUrl"
                  autoComplete="url"
                value={formData.imageUrl || ""}
                  onChange={(e) =>
                    handleInputChange("imageUrl", e.target.value)
                  }
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              {formData.imageUrl && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/50 shadow-md flex-shrink-0">
                  <img
                    src={formData.imageUrl}
                    alt={formData.name || "Product image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/200?text=Image+not+found";
                    }}
                  />
                </div>
              )}
            </div>
            {formData.imageUrl && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                Image trouvée et prête à être utilisée
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
              <Label htmlFor="category">
                {t.inventory.addProductModal.category} *
              </Label>
            <Select
                name="category"
              value={formData.category || ""}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="category">
                  <SelectValue
                    placeholder={t.inventory.addProductModal.category}
                  />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spirits">
                  {t.inventory.addProductModal.categories.spirits}
                </SelectItem>
                <SelectItem value="beer">
                  {t.inventory.addProductModal.categories.beer}
                </SelectItem>
                <SelectItem value="wine">
                  {t.inventory.addProductModal.categories.wine}
                </SelectItem>
                <SelectItem value="aperitif">
                  {t.inventory.addProductModal.categories.aperitif}
                </SelectItem>
                <SelectItem value="champagne">
                  {t.inventory.addProductModal.categories.champagne}
                </SelectItem>
                <SelectItem value="juice">
                  {t.inventory.addProductModal.categories.juice || "Jus"}
                </SelectItem>
                <SelectItem value="soda">
                  {t.inventory.addProductModal.categories.soda || "Boisson gazeuse"}
                </SelectItem>
                <SelectItem value="readyToDrink">
                  {t.inventory.addProductModal.categories.readyToDrink}
                </SelectItem>
                <SelectItem value="snacks">
                  {t.inventory.addProductModal.categories.snacks}
                </SelectItem>
                <SelectItem value="other">
                  {t.inventory.addProductModal.categories.other || "Autres"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          {getSubcategories().length > 0 && (
            <div className="space-y-2">
                <Label htmlFor="subcategory">
                  {t.inventory.addProductModal.subcategory}
                </Label>
              <Select
                  name="subcategory"
                value={formData.subcategory || ""}
                  onValueChange={(value) =>
                    handleInputChange("subcategory", value)
                  }
              >
                <SelectTrigger id="subcategory">
                    <SelectValue
                      placeholder={t.inventory.addProductModal.subcategory}
                    />
                </SelectTrigger>
                <SelectContent>
                  {getSubcategories().map((sub) => (
                    <SelectItem key={sub.value} value={sub.value}>
                      {sub.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Origin */}
          <div className="space-y-2">
              <Label htmlFor="origin">
                {t.inventory.addProductModal.origin}
              </Label>
            <Select
                name="origin"
              value={formData.origin || ""}
                onValueChange={(value) =>
                  handleInputChange("origin", value)
                }
            >
              <SelectTrigger id="origin">
                  <SelectValue
                    placeholder={t.inventory.addProductModal.origin}
                  />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imported">
                  {t.inventory.addProductModal.origins.imported}
                </SelectItem>
                <SelectItem value="canadian">
                  {t.inventory.addProductModal.origins.canadian}
                </SelectItem>
                <SelectItem value="quebec">
                  {t.inventory.addProductModal.origins.quebec}
                </SelectItem>
                <SelectItem value="spain">
                  {t.inventory.addProductModal.origins.spain}
                </SelectItem>
                <SelectItem value="france">
                  {t.inventory.addProductModal.origins.france}
                </SelectItem>
                <SelectItem value="italy">
                  {t.inventory.addProductModal.origins.italy}
                </SelectItem>
                <SelectItem value="usa">
                  {t.inventory.addProductModal.origins.usa}
                </SelectItem>
                <SelectItem value="australia">
                  {t.inventory.addProductModal.origins.australia}
                </SelectItem>
                <SelectItem value="southAfrica">
                  {t.inventory.addProductModal.origins.southAfrica}
                </SelectItem>
                <SelectItem value="newZealand">
                  {t.inventory.addProductModal.origins.newZealand}
                </SelectItem>
                <SelectItem value="portugal">
                  {t.inventory.addProductModal.origins.portugal}
                </SelectItem>
                <SelectItem value="chile">
                  {t.inventory.addProductModal.origins.chile}
                </SelectItem>
                <SelectItem value="uk">
                  {t.inventory.addProductModal.origins.uk}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
              <Label htmlFor="quantity">
                {t.inventory.addProductModal.quantity} *
              </Label>
            <Input
              id="quantity"
                name="quantity"
              type="number"
                autoComplete="off"
              min="0"
              value={formData.quantity || ""}
                onChange={(e) =>
                  handleInputChange("quantity", e.target.value)
                }
              placeholder="0"
            />
          </div>

          {/* Price per Bottle */}
          <div className="space-y-2">
              <Label htmlFor="pricePerBottle">
                {t.inventory.addProductModal.pricePerBottle} *
              </Label>
            <Input
              id="pricePerBottle"
                name="pricePerBottle"
              type="number"
                autoComplete="transaction-amount"
              step="0.01"
              min="0"
              value={formData.pricePerBottle || ""}
                onChange={(e) =>
                  handleInputChange("pricePerBottle", e.target.value)
                }
              placeholder="0.00"
            />
          </div>

          {/* Bottle Size in ml */}
          <div className="space-y-2">
              <Label htmlFor="bottleSizeInMl">
                {t.inventory.addProductModal.bottleSizeInMl || "Taille de la bouteille (ml)"}
              </Label>
            <Input
              id="bottleSizeInMl"
                name="bottleSizeInMl"
              type="number"
                autoComplete="off"
              min="0"
              step="1"
              value={formData.bottleSizeInMl || ""}
                onChange={(e) =>
                  handleInputChange("bottleSizeInMl", e.target.value)
                }
              placeholder="e.g., 750 (ml)"
            />
            <p className="text-xs text-muted-foreground">
              {t.inventory.addProductModal.bottleSizeHint || "La capacité de la bouteille en millilitres. Ex: 750ml pour une bouteille standard de vin"}
            </p>
          </div>

          {/* Inventory Code */}
          <div className="space-y-2">
            <Label htmlFor="inventoryCode">
              {t.inventory.addProductModal.inventoryCode}
              <span className="text-xs text-muted-foreground ml-2">
                ({t.inventory.addProductModal.inventoryCodeHint})
              </span>
            </Label>
            <Input
              id="inventoryCode"
                name="inventoryCode"
                autoComplete="off"
              value={formData.inventoryCode || ""}
                onChange={(e) =>
                  handleInputChange("inventoryCode", e.target.value)
                }
                placeholder={
                  t.inventory.addProductModal.inventoryCodePlaceholder
                }
            />
          </div>

          {/* QR Code Generator */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t.inventory.addProductModal.qrCode}
                </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateQRCode}
                    disabled={
                      !formData.name || !formData.inventoryCode
                    }
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t.inventory.addProductModal.generateQR}
                </Button>
                {qrCodeValue && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadQRCode}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {t.inventory.addProductModal.downloadQR}
                  </Button>
                )}
              </div>
            </div>
            {qrCodeValue ? (
              <div className="flex flex-col items-center justify-center p-4 bg-secondary rounded-lg space-y-3">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrCodeValue}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
                <p className="text-xs text-muted-foreground text-center">
                    {t.inventory.addProductModal.codeLabel}:{" "}
                    {formData.inventoryCode}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-secondary rounded-lg border-2 border-dashed border-muted-foreground/30">
                <p className="text-sm text-muted-foreground text-center">
                  {t.inventory.addProductModal.qrCodePlaceholder}
                </p>
              </div>
            )}
          </div>
        </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            {t.inventory.addProductModal.cancel}
          </Button>
          <Button onClick={handleSave}>
            {t.inventory.addProductModal.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Product Selection Modal */}
    <Dialog 
      open={showProductSelection} 
      onOpenChange={(open) => {
        setShowProductSelection(open);
        if (!open) {
          setCurrentPage(1); // Reset to first page when closing
        }
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Sélectionner un produit</DialogTitle>
          <DialogDescription>
              Plusieurs produits correspondent à votre recherche.
              Sélectionnez celui que vous souhaitez ajouter, ou
              continuez sans sélectionner si aucun ne correspond.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-3 py-4">
              <>
                {currentPageResults.map((result, index) => (
                  <div
                    key={startIndex + index}
                    onClick={async () => {
                      await applyProductResult(result);
                    }}
                    className="flex items-center gap-4 p-4 border-2 border-foreground/20 rounded-lg hover:border-primary/50 hover:bg-secondary/50 transition-all cursor-pointer"
                  >
                    {result.imageUrl && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-foreground/20 bg-secondary flex-shrink-0">
                        <img
                          src={result.imageUrl}
                          alt={result.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                          (e.target as HTMLImageElement).style.display =
                            "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-foreground line-clamp-2">
                        {result.title}
                      </h3>
                      {result.snippet && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {result.snippet}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 break-all">
                        {result.productPageUrl}
                      </p>
                    </div>
                    <Button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await applyProductResult(result);
                      }}
                      className="flex-shrink-0"
                    >
                      Sélectionner
                    </Button>
                  </div>
                ))}
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <span className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} (
                    {searchResults.length} produit
                    {searchResults.length > 1 ? "s" : ""})
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(totalPages, prev + 1)
                      )
                    }
                      disabled={currentPage >= totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowProductSelection(false);
              setCurrentPage(1);
            }}
          >
            Annuler
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowProductSelection(false);
              setCurrentPage(1);
              // L'utilisateur peut continuer à remplir le formulaire manuellement
            }}
          >
            Aucun ne correspond - Continuer sans sélectionner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
