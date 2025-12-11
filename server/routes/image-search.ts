import { RequestHandler } from "express";

// POST /api/image-search - Recherche d'images via Google Custom Search API
export const searchImages: RequestHandler = async (req, res) => {
  console.log("[ImageSearch] Request received:", { productName: req.body?.productName });
  try {
    const { productName } = req.body;

    if (!productName || typeof productName !== "string") {
      return res.status(400).json({ error: "Le nom du produit est requis" });
    }

    // Récupérer les clés API depuis les variables d'environnement (serveur uniquement)
    // Support both VITE_ prefixed (for compatibility) and non-prefixed keys
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
    const GOOGLE_CX = process.env.GOOGLE_CX || process.env.VITE_GOOGLE_CX || "2604700cf916145eb"; // CX par défaut

    if (!GOOGLE_API_KEY) {
      return res.status(400).json({ 
        error: "Clé API Google non configurée. Configurez GOOGLE_API_KEY ou VITE_GOOGLE_API_KEY dans le fichier .env" 
      });
    }

    const keywords = productName.trim().split(/\s+/).filter(word => word.length > 0);
    // Ajouter site:www.saq.com pour limiter aux images de SAQ
    const searchQuery = `${keywords.join(' ')} site:www.saq.com`;
    
    console.log("[ImageSearch] Search query:", searchQuery);
    console.log("[ImageSearch] API Key configured:", !!GOOGLE_API_KEY);
    console.log("[ImageSearch] API Key prefix:", GOOGLE_API_KEY ? GOOGLE_API_KEY.substring(0, 10) + "..." : "Not set");
    console.log("[ImageSearch] CX:", GOOGLE_CX);

    // Recherche d'images
    const imageSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=10&safe=active&imgSize=medium&imgType=photo`;
    
    console.log("[ImageSearch] Calling Google API...");
    let imageResponse;
    try {
      imageResponse = await fetch(imageSearchUrl);
      console.log("[ImageSearch] Response status:", imageResponse.status);
    } catch (fetchError: any) {
      console.error("[ImageSearch] Fetch error:", fetchError);
      throw new Error(`Erreur lors de l'appel à l'API Google: ${fetchError.message}`);
    }
    
    if (!imageResponse.ok) {
      let errorData: any;
      try {
        errorData = await imageResponse.json();
      } catch {
        errorData = await imageResponse.text();
      }
      
      console.error("Google API error:", {
        status: imageResponse.status,
        statusText: imageResponse.statusText,
        error: errorData
      });
      
      // Gérer les erreurs spécifiques
      if (imageResponse.status === 400) {
        return res.status(400).json({ 
          error: "Requête invalide. Vérifiez la configuration de l'API Google.",
          details: errorData 
        });
      } else if (imageResponse.status === 403) {
        return res.status(403).json({ 
          error: "Accès refusé. Vérifiez que votre clé API Google est valide et que l'API Custom Search est activée.",
          details: errorData 
        });
      } else if (imageResponse.status === 429) {
        return res.status(429).json({ 
          error: "Limite de requêtes dépassée. Veuillez réessayer plus tard.",
          details: errorData 
        });
      }
      
      return res.status(imageResponse.status).json({ 
        error: "Erreur lors de la recherche d'images",
        details: errorData 
      });
    }

    const imageData = await imageResponse.json();
    
    if (!imageData.items || imageData.items.length === 0) {
      return res.json({ images: [] });
    }

    // Formater les résultats
    const images = imageData.items.map((item: any) => ({
      imageUrl: item.link,
      thumbnailUrl: item.image?.thumbnailLink || item.link,
      title: item.title,
      contextUrl: item.image?.contextLink || item.link,
    }));

    res.json({ images });
  } catch (error: any) {
    console.error("[ImageSearch] Error searching for images:", error);
    console.error("[ImageSearch] Error stack:", error?.stack);
    console.error("[ImageSearch] Error name:", error?.name);
    console.error("[ImageSearch] Error message:", error?.message);
    res.status(500).json({ 
      error: "Erreur lors de la recherche d'images",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

