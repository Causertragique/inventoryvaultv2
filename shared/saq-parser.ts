export interface SaqProductDetails {
  category?: string;
  subcategory?: string;
  origin?: string;
  price?: number;
  description?: string;
  bottleSizeInMl?: number;
}

export interface ParseSaqOptions {
  sourceUrl?: string;
}

const RESTAURANT_PRICE_PATTERNS = [
  /prix.*?restaura[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /restaura.*?prix[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /prix.*?professionnel[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /professionnel.*?prix[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /prix.*?gros[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /wholesale.*?price[^>]*>.*?\$?\s*([0-9]+[.,][0-9]{2})/i,
  /"restaurantPrice":\s*"?([0-9]+[.,][0-9]{2})"?/i,
  /"wholesalePrice":\s*"?([0-9]+[.,][0-9]{2})"?/i,
];

const PRICE_PATTERNS = [
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

const BIER_FRAGMENT = "bi(?:e|\\u00E8|\\u00E9|\\u00EA|\\u00EB|\\u0160)re";
const ROSE_FRAGMENT = "ros(?:e|\\u00E9|\\u00EA|\\u017D)";

const CATEGORY_PATTERNS = [
  /"category":\s*"([^"]+)"/,
  /data-category="([^"]+)"/,
  /<meta[^>]*property="product:category"[^>]*content="([^"]+)"/i,
  new RegExp(`breadcrumb[^>]*>.*?(spiritueux|vin|${BIER_FRAGMENT}|beer)`, "i"),
];

const ORIGIN_PATTERNS = [
  /"origin":\s*"([^"]+)"/,
  /"country":\s*"([^"]+)"/,
  /provenance[^>]*>([^<]+)</i,
  /pays[^>]*>([^<]+)</i,
  /pays d'origine[^>]*>([^<]+)</i,
  /origine[^>]*>([^<]+)</i,
  /<span[^>]*class="[^"]*origin[^"]*"[^>]*>([^<]+)</i,
  /<span[^>]*class="[^"]*country[^"]*"[^>]*>([^<]+)</i,
];

const SUBCATEGORY_HTML_PATTERNS = [
  /"subcategory":\s*"([^"]+)"/,
  /data-subcategory="([^"]+)"/,
  /<meta[^>]*property="product:type"[^>]*content="([^"]+)"/i,
  /type[^>]*>([^<]+)</i,
  new RegExp(
    `breadcrumb[^>]*>.*?(vodka|gin|rum|rhum|whisky|whiskey|tequila|cognac|brandy|liqueur|vin rouge|vin blanc|${ROSE_FRAGMENT}|${BIER_FRAGMENT}|cidre)`,
    "i"
  ),
];

const BOTTLE_SIZE_PATTERNS = [
  /(\d+)\s*ml\b/i,
  /(\d+)\s*mL\b/,
  /volume[^>]*>(\d+)\s*ml/i,
  /size[^>]*>(\d+)\s*ml/i,
  /capacity[^>]*>(\d+)\s*ml/i,
  /"volume":\s*"(\d+)\s*ml"/i,
  /data-volume="(\d+)"/i,
  /(\d+)\s*cl\b/i,
  /volume[^>]*>(\d+)\s*cl/i,
];

const CATEGORY_MAP: Record<string, string> = {
  spiritueux: "spirits",
  spirits: "spirits",
  vin: "wine",
  wine: "wine",
  biere: "beer",
  beer: "beer",
  cidre: "beer",
};

function removeDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeWord(value: string): string {
  return removeDiacritics(value).toLowerCase();
}

function parsePriceValue(value?: string | null): number | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/[^0-9.,]/g, "").replace(",", ".");
  const price = parseFloat(normalized);
  if (!Number.isFinite(price) || price <= 0 || price >= 10000) {
    return undefined;
  }
  return price;
}

function extractPrice(html: string): number | undefined {
  for (const pattern of RESTAURANT_PRICE_PATTERNS) {
    const match = html.match(pattern);
    const price = parsePriceValue(match?.[1]);
    if (price) return price;
  }

  for (const pattern of PRICE_PATTERNS) {
    const match = html.match(pattern);
    const price = parsePriceValue(match?.[1]);
    if (price) return price;
  }

  return undefined;
}

function extractCategoryFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const urlCategoryMatch = url.match(/\/produits\/([^/]+)/i);
  if (urlCategoryMatch) {
    const key = normalizeWord(urlCategoryMatch[1]);
    if (key in CATEGORY_MAP) {
      return CATEGORY_MAP[key];
    }
    if (key.includes("spirit")) return "spirits";
    if (key.includes("vin")) return "wine";
    if (key.includes("beer") || key.includes("bier")) return "beer";
  }
  return undefined;
}

function extractCategoryFromHtml(html: string): string | undefined {
  for (const pattern of CATEGORY_PATTERNS) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const key = normalizeWord(match[1]);
      if (key in CATEGORY_MAP) {
        return CATEGORY_MAP[key];
      }
      if (key.includes("spirit")) return "spirits";
      if (key.includes("vin")) return "wine";
      if (key.includes("beer") || key.includes("bier")) return "beer";
    }
  }
  return undefined;
}

function extractSubcategoryFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const match =
    url.match(/\/produits\/[^/]+\/([^/]+)/i) ||
    url.match(/\/spiritueux\/([^/]+)/i) ||
    url.match(/\/vin\/([^/]+)/i) ||
    url.match(new RegExp(`\\/${BIER_FRAGMENT}\\/([^/]+)`, "i"));
  if (match && match[1]) {
    return normalizeWord(match[1]);
  }
  return undefined;
}

function extractSubcategoryFromHtml(html: string): string | undefined {
  for (const pattern of SUBCATEGORY_HTML_PATTERNS) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return normalizeWord(match[1]);
    }
  }
  return undefined;
}

function extractOrigin(html: string): string | undefined {
  for (const pattern of ORIGIN_PATTERNS) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const value = match[1].trim();
      if (value) return value;
    }
  }
  return undefined;
}

function extractBottleSize(html: string): number | undefined {
  for (const pattern of BOTTLE_SIZE_PATTERNS) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let size = parseInt(match[1], 10);
      if (Number.isNaN(size)) {
        continue;
      }
      if (pattern.toString().includes("cl")) {
        size = size * 10;
      }
      if (size >= 100 && size <= 5000) {
        return size;
      }
    }
  }
  return undefined;
}

function defaultBottleSize(category?: string): number | undefined {
  if (!category) return undefined;
  if (category === "beer") return 330;
  if (category === "wine") return 750;
  if (category === "spirits") return 750;
  if (category === "juice") return 1000;
  if (category === "soda") return 355;
  return 500;
}

export function parseSaqProductPage(
  html: string,
  options: ParseSaqOptions = {}
): SaqProductDetails {
  if (!html || typeof html !== "string") {
    return {};
  }

  const normalizedUrl = options.sourceUrl
    ? removeDiacritics(options.sourceUrl).toLowerCase()
    : undefined;
  const normalizedHtml = removeDiacritics(html);

  const details: SaqProductDetails = {};
  details.price = extractPrice(html);
  details.category =
    extractCategoryFromUrl(normalizedUrl) ||
    extractCategoryFromHtml(normalizedHtml);
  details.subcategory =
    extractSubcategoryFromUrl(normalizedUrl) ||
    extractSubcategoryFromHtml(normalizedHtml);
  details.origin = extractOrigin(html);
  details.bottleSizeInMl =
    extractBottleSize(html) || defaultBottleSize(details.category);

  return details;
}
