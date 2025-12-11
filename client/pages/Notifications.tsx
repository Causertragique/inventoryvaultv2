import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/contexts/I18nContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  stockAlertsService,
  remindersService,
  notificationsService,
  StockAlert,
  Reminder,
  RemoteNotification,
} from "@/services/firestore/notifications";
import {
  AlertCircle,
  Clock,
  Bell,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Calendar,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "stock_alert" | "reminder" | "info";
  createdAt: Date;
  read: boolean;
  priority?: "low" | "medium" | "high";
  scheduledFor?: Date;
}

export default function Notifications() {
  const { t } = useI18n();
  const { user } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<"alerts" | "reminders" | "history">(
    (location.state?.activeTab as "alerts" | "reminders" | "history") || "alerts"
  );
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<RemoteNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddReminderDialog, setShowAddReminderDialog] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    title: "",
    description: "",
    scheduledFor: new Date().toISOString().split("T")[0],
    scheduledTime: "09:00",
    priority: "medium" as "low" | "medium" | "high",
  });

  // Load all notifications data
  useEffect(() => {
    if (!user?.uid) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [alerts, reminders, notifications] = await Promise.all([
          stockAlertsService.getByUserId(user.uid),
          remindersService.getByUserId(user.uid),
          notificationsService.getByUserId(user.uid),
        ]);

        setStockAlerts(alerts.filter((a) => !a.isDismissed));
        setReminders(reminders.filter((r) => !r.completed));
        setNotifications(notifications);
      } catch (error) {
        // Silently fail if Firestore permissions are not configured
        if ((error as any)?.code === "permission-denied") {
          console.debug("Firestore permissions not configured for notifications");
        } else {
          console.error("Error loading notifications:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.uid]);

  const handleDismissAlert = async (alertId: string) => {
    try {
      await stockAlertsService.dismiss(alertId);
      setStockAlerts(stockAlerts.filter((a) => a.id !== alertId));
    } catch (error) {
      console.error("Error dismissing alert:", error);
    }
  };

  const handleAddReminder = async () => {
    if (!reminderForm.title.trim()) {
      return;
    }

    try {
      const scheduledDate = new Date(
        `${reminderForm.scheduledFor}T${reminderForm.scheduledTime}`
      );

      if (scheduledDate <= new Date()) {
        return;
      }

      const newReminder = await remindersService.create(user!.uid, {
        title: reminderForm.title,
        description: reminderForm.description,
        scheduledFor: scheduledDate,
        priority: reminderForm.priority,
        completed: false,
      });

      setReminders([...reminders, newReminder]);
      setShowAddReminderDialog(false);
      setReminderForm({
        title: "",
        description: "",
        scheduledFor: new Date().toISOString().split("T")[0],
        scheduledTime: "09:00",
        priority: "medium",
      });
    } catch (error) {
      console.error("Error creating reminder:", error);
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      await remindersService.markAsCompleted(reminderId);
      setReminders(reminders.filter((r) => r.id !== reminderId));
    } catch (error) {
      console.error("Error completing reminder:", error);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return;

    try {
      await remindersService.delete(reminderId);
      setReminders(reminders.filter((r) => r.id !== reminderId));
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationsService.delete(notificationId);
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-orange-600 dark:text-orange-400";
      case "low":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please log in to view notifications</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Notifications & Reminders
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage stock alerts and plan your reminders
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-foreground/20">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("alerts")}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === "alerts"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Stock Alerts ({stockAlerts.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("reminders")}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === "reminders"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Reminders ({reminders.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === "history"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                History ({notifications.length})
              </div>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        )}

        {/* Stock Alerts Tab */}
        {activeTab === "alerts" && !loading && (
          <div className="space-y-4">
            {stockAlerts.length === 0 ? (
              <div className="text-center py-12 bg-secondary/50 rounded-lg">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No stock alerts at the moment. Everything is well-stocked!
                </p>
              </div>
            ) : (
              stockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-2 ${
                    alert.alertType === "out_of_stock"
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            alert.alertType === "out_of_stock"
                              ? "text-red-600 dark:text-red-400"
                              : "text-orange-600 dark:text-orange-400"
                          }`}
                        />
                        <h3 className="font-bold text-foreground">
                          {alert.productName}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Current stock: {alert.currentStock} units (Threshold:{" "}
                        {alert.thresholdLevel})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(alert.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDismissAlert(alert.id)}
                      className="ml-4"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reminders Tab */}
        {activeTab === "reminders" && !loading && (
          <div className="space-y-4">
            <Button
              onClick={() => setShowAddReminderDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Reminder
            </Button>

            {reminders.length === 0 ? (
              <div className="text-center py-12 bg-secondary/50 rounded-lg">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No reminders scheduled. Create one to plan ahead!
                </p>
              </div>
            ) : (
              reminders
                .sort(
                  (a, b) =>
                    new Date(a.scheduledFor).getTime() -
                    new Date(b.scheduledFor).getTime()
                )
                .map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`p-4 rounded-lg border-2 ${
                      reminder.priority === "high"
                        ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                        : reminder.priority === "medium"
                          ? "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20"
                          : "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCompleteReminder(reminder.id)}
                            className="flex-shrink-0"
                          >
                            <CheckCircle
                              className={`h-5 w-5 cursor-pointer transition-colors ${
                                getPriorityColor(reminder.priority)
                              }`}
                            />
                          </button>
                          <div>
                            <h3 className="font-bold text-foreground">
                              {reminder.title}
                            </h3>
                            {reminder.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {reminder.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(reminder.scheduledFor)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="ml-4 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && !loading && (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12 bg-secondary/50 rounded-lg">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No notification history. Come back later!
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-2 ${
                    notification.isRead
                      ? "border-foreground/10 bg-secondary/50"
                      : "border-primary bg-primary/10"
                  }`}
                  onClick={() => handleMarkNotificationAsRead(notification.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                        <h3 className="font-bold text-foreground">
                          {notification.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Bell className="h-3 w-3" />
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification.id);
                      }}
                      className="ml-4 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Reminder Dialog */}
      <Dialog open={showAddReminderDialog} onOpenChange={setShowAddReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
            <DialogDescription>
              Create a new reminder for inventory or other tasks
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reminderTitle">Title *</Label>
              <Input
                id="reminderTitle"
                value={reminderForm.title}
                onChange={(e) =>
                  setReminderForm({ ...reminderForm, title: e.target.value })
                }
                placeholder="e.g., Check beer stock"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderDescription">Description</Label>
              <Textarea
                id="reminderDescription"
                value={reminderForm.description}
                onChange={(e) =>
                  setReminderForm({
                    ...reminderForm,
                    description: e.target.value,
                  })
                }
                placeholder="Optional details about this reminder"
                className="min-h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reminderDate">Date *</Label>
                <Input
                  id="reminderDate"
                  type="date"
                  value={reminderForm.scheduledFor}
                  onChange={(e) =>
                    setReminderForm({
                      ...reminderForm,
                      scheduledFor: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminderTime">Time *</Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={reminderForm.scheduledTime}
                  onChange={(e) =>
                    setReminderForm({
                      ...reminderForm,
                      scheduledTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderPriority">Priority</Label>
              <Select
                value={reminderForm.priority}
                onValueChange={(value) =>
                  setReminderForm({
                    ...reminderForm,
                    priority: value as "low" | "medium" | "high",
                  })
                }
              >
                <SelectTrigger id="reminderPriority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddReminderDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddReminder}>Create Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
