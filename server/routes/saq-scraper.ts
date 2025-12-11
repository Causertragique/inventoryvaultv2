import { RequestHandler } from "express";
import { parseSaqProductPage } from "@shared/saq-parser";

export const handleSAQScrape: RequestHandler = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!url.includes("saq.com")) {
      return res.status(400).json({ error: "URL must be from saq.com" });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch SAQ page" });
    }

    const html = await response.text();
    const details = parseSaqProductPage(html, { sourceUrl: url });
    return res.json(details);
  } catch (error) {
    console.error("Error scraping SAQ page:", error);
    return res.status(500).json({ error: "Failed to scrape SAQ page" });
  }
};
