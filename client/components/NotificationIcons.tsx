import { AlertCircle, CheckCircle, Info, XCircle, Trash2, Plus, Edit2, Save, Bell } from "lucide-react";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function NotificationIcons() {
  const { notifications, removeNotification } = useNotificationStore();

  console.log("NotificationIcons rendered, notifications:", notifications);

  const hasNotifications = notifications.length > 0;

  const getIconForTitle = (title: string) => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes("supprim")) return Trash2;
    if (titleLower.includes("modifi")) return Edit2;
    if (titleLower.includes("ajout")) return Plus;
    if (titleLower.includes("sauvegard") || titleLower.includes("enregistr")) return Save;
    if (titleLower.includes("erreur") || titleLower.includes("impossible")) return AlertCircle;
    if (titleLower.includes("succès") || titleLower.includes("créé") || titleLower.includes("réussi")) return CheckCircle;
    
    return Info;
  };

  const getColorForVariant = (variant?: string) => {
    if (variant === "destructive") return "text-red-500 hover:text-red-600";
    return "text-slate-600 hover:text-slate-700";
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 ml-2">
        {/* Bell icon - changes color based on notifications */}
        <div className="relative">
          <Bell className={`h-5 w-5 transition-colors ${
            hasNotifications 
              ? "text-red-500 animate-pulse" 
              : "text-muted-foreground"
          }`} />
          {hasNotifications && (
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>

        {/* Notification icons */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-1">
            {notifications.map((notification) => {
              const Icon = getIconForTitle(notification.title);
              const color = getColorForVariant(notification.variant);

              return (
                <Tooltip key={notification.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className={`${color} transition-colors cursor-pointer`}
                      aria-label={`Notification: ${notification.title}`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-semibold">{notification.title}</p>
                      {notification.description && (
                        <p className="text-xs text-muted-foreground">
                          {notification.description}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
