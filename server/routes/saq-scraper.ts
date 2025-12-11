import { RequestHandler } from "express";

interface SAQProductDetails {
  category?: string;
  subcategory?: string;
  origin?: string;
  price?: number;
  description?: string;
  bottleSizeInMl?: number;
}

export const handleSAQScrape: RequestHandler = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!url.includes("saq.com")) {
      return res.status(400).json({ error: "URL must be from saq.com" });
    }

    // Fetch the SAQ product page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch SAQ page" });
    }

    const html = await response.text();
    const details: SAQProductDetails = {};

    // Extract price - prioritize restaurant/wholesale price over public price
    // SAQ often shows different prices for restaurants vs public
    const restaurantPricePatterns = [
      /prix.*?restaura[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
      /restaura.*?prix[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
      /prix.*?professionnel[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
      /professionnel.*?prix[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
      /prix.*?gros[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
      /wholesale.*?price[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
      /"restaurantPrice":\s*"?([0-9]+[.,][0-9]{2})"?/i,
      /"wholesalePrice":\s*"?([0-9]+[.,][0-9]{2})"?/i,
    ];
    
    // Try to find restaurant price first
    for (const pattern of restaurantPricePatterns) {
      const priceMatch = html.match(pattern);
      if (priceMatch) {
        const priceStr = priceMatch[1].replace(/[^0-9.,]/g, "").replace(",", ".");
        const price = parseFloat(priceStr);
        if (!isNaN(price) && price > 0 && price < 10000) {
          details.price = price;
          console.log(`Restaurant price extracted: ${price} from pattern`);
          break;
        }
      }
    }
    
    // If no restaurant price found, fall back to regular price patterns
    if (!details.price) {
      const pricePatterns = [
        /"price":\s*"([^"]+)"/,
        /"price":\s*([0-9.]+)/,
        /data-price="([^"]+)"/,
        /data-price="([0-9.]+)"/,
        /prix[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
        /class="[^"]*price[^"]*"[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
        /<span[^>]*class="[^"]*price[^"]*"[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
        /\$\s*([0-9]+[.,][0-9]{2})/,
        /([0-9]+[.,][0-9]{2})\s*\$/,
        /([0-9]+[.,][0-9]{2})\s*CAD/i,
      ];
      
      for (const pattern of pricePatterns) {
        const priceMatch = html.match(pattern);
        if (priceMatch) {
          const priceStr = priceMatch[1].replace(/[^0-9.,]/g, "").replace(",", ".");
          const price = parseFloat(priceStr);
          if (!isNaN(price) && price > 0 && price < 10000) {
            details.price = price;
            console.log(`Price extracted: ${price} from pattern`);
            break;
          }
        }
      }
    }

    // Extract category from URL or breadcrumbs
    // SAQ URLs often contain category: /fr/produits/spiritueux/... or /fr/produits/vin/...
    const urlCategoryMatch = url.match(/\/produits\/([^\/]+)/);
    if (urlCategoryMatch) {
      const urlCategory = urlCategoryMatch[1].toLowerCase();
      // Map SAQ URL categories to our categories
      if (urlCategory.includes("spiritueux") || urlCategory === "spirits") {
        details.category = "spirits";
      } else if (urlCategory.includes("vin") || urlCategory === "wine") {
        details.category = "wine";
      } else if (urlCategory.includes("bière") || urlCategory.includes("beer") || urlCategory.includes("cidre")) {
        details.category = "beer";
      }
    }
    
    // Also try to extract from HTML metadata
    const categoryMatch = html.match(/"category":\s*"([^"]+)"/) ||
                         html.match(/data-category="([^"]+)"/) ||
                         html.match(/<meta[^>]*property="product:category"[^>]*content="([^"]+)"/i) ||
                         html.match(/breadcrumb[^>]*>.*?spiritueux|vin|bière/i);
    if (categoryMatch && !details.category) {
      const category = categoryMatch[1]?.toLowerCase() || "";
      // Map SAQ categories to our categories
      if (category.includes("spiritueux") || category.includes("spirits")) {
        details.category = "spirits";
      } else if (category.includes("vin") || category.includes("wine")) {
        details.category = "wine";
      } else if (category.includes("bière") || category.includes("beer")) {
        details.category = "beer";
      }
    }
    
    // Extract subcategory from URL (e.g., /spiritueux/vodka/ or /produits/spiritueux/vodka/)
    const subcategoryMatch = url.match(/\/produits\/[^\/]+\/([^\/]+)/) || 
                             url.match(/\/spiritueux\/([^\/]+)/) ||
                             url.match(/\/vin\/([^\/]+)/) ||
                             url.match(/\/bière\/([^\/]+)/);
    if (subcategoryMatch && subcategoryMatch[1]) {
      let subcategory = subcategoryMatch[1].toLowerCase();
      // Clean up common URL patterns
      subcategory = subcategory.replace(/^produits\//, '').replace(/\/$/, '');
      details.subcategory = subcategory;
      console.log(`Subcategory extracted from URL: ${details.subcategory}`);
    }

    // Extract origin/provenance
    const originPatterns = [
      /"origin":\s*"([^"]+)"/,
      /"country":\s*"([^"]+)"/,
      /provenance[^>]*>([^<]+)</i,
      /pays[^>]*>([^<]+)</i,
      /pays d'origine[^>]*>([^<]+)</i,
      /origine[^>]*>([^<]+)</i,
      /<span[^>]*class="[^"]*origin[^"]*"[^>]*>([^<]+)</i,
      /<span[^>]*class="[^"]*country[^"]*"[^>]*>([^<]+)</i
    ];
    
    for (const pattern of originPatterns) {
      const originMatch = html.match(pattern);
      if (originMatch && originMatch[1] && originMatch[1].trim() && originMatch[1].trim().length > 0) {
        details.origin = originMatch[1].trim();
        console.log(`Origin extracted: ${details.origin}`);
        break;
      }
    }

    // Extract subcategory from HTML if not already found from URL
    if (!details.subcategory) {
      const subcategoryHtmlMatch = html.match(/"subcategory":\s*"([^"]+)"/) ||
                                 html.match(/data-subcategory="([^"]+)"/) ||
                                 html.match(/<meta[^>]*property="product:type"[^>]*content="([^"]+)"/i) ||
                                 html.match(/type[^>]*>([^<]+)</i);
      if (subcategoryHtmlMatch && subcategoryHtmlMatch[1]) {
        details.subcategory = subcategoryHtmlMatch[1].trim();
        console.log(`Subcategory extracted from HTML: ${details.subcategory}`);
      }
      
      // Also try to extract from breadcrumbs or navigation
      if (!details.subcategory) {
        const breadcrumbMatch = html.match(/breadcrumb[^>]*>.*?(vodka|gin|rum|whisky|whiskey|tequila|cognac|brandy|liqueur|vin rouge|vin blanc|rosé|bière|cidre)/i);
        if (breadcrumbMatch && breadcrumbMatch[1]) {
          details.subcategory = breadcrumbMatch[1].toLowerCase();
          console.log(`Subcategory extracted from breadcrumb: ${details.subcategory}`);
        }
      }
    }

    // Extract bottle size in ml
    const bottleSizePatterns = [
      /(\d+)\s*ml\b/i,
      /(\d+)\s*mL\b/,
      /volume[^>]*>(\d+)\s*ml/i,
      /size[^>]*>(\d+)\s*ml/i,
      /capacity[^>]*>(\d+)\s*ml/i,
      /"volume":\s*"(\d+)\s*ml"/i,
      /data-volume="(\d+)"/i,
      /(\d+)\s*cl\b/i,  // Centiliters - convert to ml
      /volume[^>]*>(\d+)\s*cl/i,
    ];
    
    for (const pattern of bottleSizePatterns) {
      const sizeMatch = html.match(pattern);
      if (sizeMatch && sizeMatch[1]) {
        let size = parseInt(sizeMatch[1], 10);
        // If it's in centiliters (cl), convert to ml
        if (pattern.toString().includes('cl')) {
          size = size * 10;
        }
        // Validate reasonable bottle size (between 100ml and 5000ml)
        if (size >= 100 && size <= 5000) {
          details.bottleSizeInMl = size;
          console.log(`Bottle size extracted: ${size}ml from pattern`);
          break;
        }
      }
    }

    // If no bottle size found, use category defaults
    if (!details.bottleSizeInMl) {
      if (details.category === "beer") {
        details.bottleSizeInMl = 330; // Default beer bottle size
      } else if (details.category === "wine") {
        details.bottleSizeInMl = 750; // Default wine bottle size
      } else if (details.category === "spirits") {
        details.bottleSizeInMl = 750; // Default spirits bottle size
      } else if (details.category === "juice") {
        details.bottleSizeInMl = 1000; // Default juice bottle size (1L)
      } else if (details.category === "soda") {
        details.bottleSizeInMl = 355; // Default soda can size
      } else {
        details.bottleSizeInMl = 500; // Default for other categories
      }
      console.log(`Using default bottle size: ${details.bottleSizeInMl}ml for category ${details.category}`);
    }

    res.json(details);
  } catch (error) {
    console.error("Error scraping SAQ page:", error);
    res.status(500).json({ error: "Failed to scrape SAQ page" });
  }
};

