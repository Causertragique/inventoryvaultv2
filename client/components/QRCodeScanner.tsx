import { useEffect, useRef, useState } from "react";
// @ts-ignore - html5-qrcode doesn't have types
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export default function QRCodeScanner({
  isOpen,
  onClose,
  onScan,
}: QRCodeScannerProps) {
  const { t } = useI18n();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    if (isOpen && !scannerRef.current) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      // Check for camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
      } catch (permError) {
        setHasPermission(false);
        setError("Permission d'accès à la caméra refusée. Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.");
        return;
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" }, // Use back camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Successfully scanned
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Scanning error (ignore, it's normal while scanning)
        }
      );

      setIsScanning(true);
      setError("");
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      setError(err.message || "Erreur lors du démarrage du scanner");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    stopScanner();
    onScan(decodedText);
    onClose();
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border-2 border-foreground/20 rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-foreground/20">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Scanner QR Code
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scanner */}
        <div className="p-4">
          {hasPermission === false ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground">
                Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.
              </p>
            </div>
          ) : (
            <>
              <div
                id="qr-reader"
                className="w-full rounded-lg overflow-hidden"
                style={{ minHeight: "300px" }}
              />
              {error && (
                <p className="text-sm text-destructive mt-2 text-center">
                  {error}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Pointez la caméra vers un QR code pour scanner
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-foreground/20 flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}

