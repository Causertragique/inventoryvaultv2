import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

interface NotificationSettings {
  lowStockAlerts: boolean;
  salesReports: boolean;
  weeklySummary: boolean;
  lowStockThreshold: number;
}

const getNotificationSettings = (): NotificationSettings => {
  const stored = localStorage.getItem("bartender-settings");
  if (stored) {
    try {
      const settings = JSON.parse(stored);
      return {
        lowStockAlerts: settings.lowStockAlerts ?? true,
        salesReports: settings.salesReports ?? true,
        weeklySummary: settings.weeklySummary ?? true,
        lowStockThreshold: settings.lowStockThreshold ?? 5,
      };
    } catch {
      // Default settings
    }
  }
  return {
    lowStockAlerts: true,
    salesReports: true,
    weeklySummary: true,
    lowStockThreshold: 5,
  };
};

export const useNotifications = () => {
  const { toast } = useToast();
  const notifiedLowStock = useRef<Set<string>>(new Set());
  const lastDailyReport = useRef<Date | null>(null);
  const lastWeeklyReport = useRef<Date | null>(null);

  // Check for low stock alerts
  const checkLowStock = (products: Array<{ id: string; name: string; quantity: number }>) => {
    const settings = getNotificationSettings();
    if (!settings.lowStockAlerts) return;

    products.forEach((product) => {
      if (product.quantity <= settings.lowStockThreshold && product.quantity > 0 && !notifiedLowStock.current.has(product.id)) {
        notifiedLowStock.current.add(product.id);
        toast({
          title: "Stock faible détecté",
          description: `${product.name} a un stock faible (${product.quantity} unité${product.quantity > 1 ? 's' : ''} restante${product.quantity > 1 ? 's' : ''})`,
          variant: "destructive",
        });
      } else if (product.quantity > settings.lowStockThreshold) {
        // Remove from notified set if stock is back above threshold
        notifiedLowStock.current.delete(product.id);
      }
    });
  };

  // Check for daily sales report
  const checkDailySalesReport = () => {
    const settings = getNotificationSettings();
    if (!settings.salesReports) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check if we already sent a report today
    if (lastDailyReport.current && lastDailyReport.current >= today) {
      return;
    }

    // Check if it's the right time (e.g., end of day - 22:00)
    const hour = now.getHours();
    if (hour >= 22) {
      lastDailyReport.current = today;
      toast({
        title: "Rapport de ventes quotidien",
        description: "Consultez la page Analytics pour voir votre rapport de ventes du jour",
      });
    }
  };

  // Check for weekly summary
  const checkWeeklySummary = () => {
    const settings = getNotificationSettings();
    if (!settings.weeklySummary) return;

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();

    // Show weekly summary on Sunday at 9 AM
    if (dayOfWeek === 0 && hour >= 9 && hour < 10) {
      const thisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (!lastWeeklyReport.current || lastWeeklyReport.current < thisWeek) {
        lastWeeklyReport.current = thisWeek;
        toast({
          title: "Résumé hebdomadaire disponible",
          description: "Consultez la page Analytics pour voir votre résumé hebdomadaire",
        });
      }
    }
  };

  // Initialize: check notifications periodically
  useEffect(() => {
    // Check every 5 minutes
    const interval = setInterval(() => {
      checkDailySalesReport();
      checkWeeklySummary();
    }, 5 * 60 * 1000);

    // Initial check
    checkDailySalesReport();
    checkWeeklySummary();

    return () => clearInterval(interval);
  }, []);

  return {
    checkLowStock,
    checkDailySalesReport,
    checkWeeklySummary,
  };
};

