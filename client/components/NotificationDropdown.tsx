import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, Clock, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  stockAlertsService,
  remindersService,
  notificationsService,
  StockAlert,
  Reminder,
  RemoteNotification,
} from "@/services/firestore/notifications";

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<RemoteNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const [alerts, reminders, notifications] = await Promise.all([
          stockAlertsService.getByUserId(user.uid),
          remindersService.getByUserId(user.uid),
          notificationsService.getByUserId(user.uid),
        ]);

        setStockAlerts(alerts.filter((a) => !a.isDismissed).slice(0, 5));
        setReminders(reminders.filter((r) => !r.completed).slice(0, 5));
        setNotifications(notifications.slice(0, 5));
      } catch (error) {
        // Silently fail if Firestore permissions are not configured
        // This is expected in development without proper Firestore rules
        if ((error as any)?.code === "permission-denied") {
          console.debug("Firestore permissions not configured for notifications");
        } else {
          console.error("Error loading notifications:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [isOpen, user?.uid]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = (type: "alerts" | "reminders" | "history") => {
    setIsOpen(false);
    navigate("/notifications", { state: { activeTab: type } });
  };

  const totalNotifications =
    stockAlerts.length + reminders.length + notifications.length;

  const formatDate = (date: Date | { seconds?: number; nanoseconds?: number }) => {
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else if (date && typeof date === "object" && "seconds" in date) {
      dateObj = new Date(date.seconds * 1000);
    } else {
      return "N/A";
    }
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins}m`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return dateObj.toLocaleDateString("fr-FR");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
        {totalNotifications > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {totalNotifications > 9 ? "9+" : totalNotifications}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-popover border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto lg:left-0 lg:right-auto lg:mt-1">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : totalNotifications === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            <>
              {/* Stock Alerts */}
              {stockAlerts.length > 0 && (
                <div className="border-b">
                  <button
                    onClick={() => handleNotificationClick("alerts")}
                    className="w-full p-3 hover:bg-accent text-left transition-colors flex items-start gap-3 group"
                  >
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {stockAlerts[0].productName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        Stock faible: {stockAlerts[0].currentStock}{" "}
                        {stockAlerts[0].alertType === "out_of_stock"
                          ? "(rupture)"
                          : ""}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(
                          stockAlerts[0].createdAt instanceof Date
                            ? stockAlerts[0].createdAt
                            : new Date(
                                (stockAlerts[0].createdAt as any).seconds * 1000
                              )
                        )}
                      </div>
                    </div>
                    {stockAlerts.length > 1 && (
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                        +{stockAlerts.length - 1}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Reminders */}
              {reminders.length > 0 && (
                <div className="border-b">
                  <button
                    onClick={() => handleNotificationClick("reminders")}
                    className="w-full p-3 hover:bg-accent text-left transition-colors flex items-start gap-3 group"
                  >
                    <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {reminders[0].title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {reminders[0].description || "Sans description"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(
                          reminders[0].scheduledFor instanceof Date
                            ? reminders[0].scheduledFor
                            : new Date(
                                (reminders[0].scheduledFor as any).seconds * 1000
                              )
                        )}
                      </div>
                    </div>
                    {reminders.length > 1 && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                        +{reminders.length - 1}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Other Notifications */}
              {notifications.length > 0 && (
                <div className="border-b">
                  <button
                    onClick={() => handleNotificationClick("history")}
                    className="w-full p-3 hover:bg-accent text-left transition-colors flex items-start gap-3 group"
                  >
                    <Bell className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {notifications[0].title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {notifications[0].message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(
                          notifications[0].createdAt instanceof Date
                            ? notifications[0].createdAt
                            : new Date(
                                (notifications[0].createdAt as any).seconds * 1000
                              )
                        )}
                      </div>
                    </div>
                    {notifications.length > 1 && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                        +{notifications.length - 1}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* View All Button */}
              <div className="p-2 border-t">
                <button
                  onClick={() => handleNotificationClick("alerts")}
                  className="w-full px-3 py-2 text-sm font-medium text-primary hover:bg-accent rounded-lg transition-colors"
                >
                  Voir toutes les notifications →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
