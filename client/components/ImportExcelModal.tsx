import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "./ui/button";

interface ImportExcelModalProps {
  onImport: (products: ImportedProduct[]) => void;
  onClose: () => void;
}

export interface ImportedProduct {
  name: string;
  category: string;
  price: number;
  format: string;
  origin: string;
}

export default function ImportExcelModal({ onImport, onClose }: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      // Trouver les index des colonnes
      const headerRow = rows[0] as string[];
      const idxName = headerRow.findIndex(h => h.toLowerCase().includes("nom"));
      const idxCategory = headerRow.findIndex(h => h.toLowerCase().includes("catégorie"));
      const idxPrice = headerRow.findIndex(h => h.toLowerCase().includes("prix"));
      const idxFormat = headerRow.findIndex(h => h.toLowerCase().includes("format"));
      const idxOrigin = headerRow.findIndex(h => h.toLowerCase().includes("origine"));
      if (idxName === -1 || idxCategory === -1 || idxPrice === -1 || idxFormat === -1 || idxOrigin === -1) {
        setError("Colonnes manquantes dans le fichier Excel.");
        setLoading(false);
        return;
      }
      const products: ImportedProduct[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] as any[];
        if (!row[idxName]) continue;
        products.push({
          name: row[idxName],
          category: row[idxCategory],
          price: parseFloat(row[idxPrice]),
          format: row[idxFormat],
          origin: row[idxOrigin],
        });
      }
      onImport(products);
      setLoading(false);
      onClose();
    } catch (err) {
      setError("Erreur lors de la lecture du fichier Excel.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-background rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Importer un fichier Excel</h2>
        <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="mb-4" />
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? "Import..." : "Importer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
