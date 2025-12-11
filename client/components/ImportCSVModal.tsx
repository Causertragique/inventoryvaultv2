import React, { useState } from "react";
import Papa from "papaparse";
import { Button } from "./ui/button";

interface ImportCSVModalProps {
  onImport: (products: ImportedProduct[]) => Promise<void> | void;
  onClose: () => void;
}

export interface ImportedProduct {
  name: string;
  category: string;
  price: number;
  format: string;
  origin: string;
}

export default function ImportCSVModal({ onImport, onClose }: ImportCSVModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugify = (key: string) =>
    key
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "");

  const getValue = (row: Record<string, unknown>, keys: string[]) => {
    const map: Record<string, unknown> = {};
    Object.keys(row).forEach((key) => {
      const slug = slugify(key);
      if (slug) map[slug] = row[key];
    });
    for (const key of keys) {
      if (map[key] !== undefined && map[key] !== null && map[key] !== "") {
        return map[key];
      }
    }
    return undefined;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const products: ImportedProduct[] = results.data
          .map((row: Record<string, any>) => {
            const name = getValue(row, ["nom", "nomduproduit", "produit", "name"]);
            const category = getValue(row, ["categorie", "familleproduit", "family", "category"]);
            const rawPrice = getValue(row, ["prixtitulaire", "prix", "price"]);
            const price = rawPrice !== undefined
              ? parseFloat(String(rawPrice).replace(/[^\d,.-]/g, "").replace(",", "."))
              : NaN;
            const format = (getValue(row, ["format", "formatml"]) as string) || "";
            const origin = (getValue(row, ["paysdorigine", "origine", "origin"]) as string) || "";
            return {
              name: typeof name === "string" ? name.trim() : "",
              category: typeof category === "string" ? category.trim() : "",
              price,
              format,
              origin,
            };
          })
          .filter((p) => p.name && !Number.isNaN(p.price));

        if (!products.length) {
          setError("Aucun produit valide trouvé dans ce fichier.");
          setLoading(false);
          return;
        }

        (async () => {
          try {
            await onImport(products);
            setLoading(false);
            onClose();
          } catch (importError) {
            console.error("Erreur lors de l'importation:", importError);
            setError("Impossible d'importer les produits. Réessayez.");
            setLoading(false);
          }
        })();
      },
      error: () => {
        setError("Erreur lors de la lecture du fichier CSV.");
        setLoading(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-background rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Importer un fichier CSV</h2>
        <input type="file" accept=".csv" onChange={handleFileChange} className="mb-4" />
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? "Import..." : "Importer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
