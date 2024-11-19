"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Bell, Star, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { markAsRead, markAllAsRead, type Notification } from "@/lib/notifications";

interface NotificationListProps {
  notifications: Notification[];
  onUpdate: () => void;
}

export function NotificationList({ notifications, onUpdate }: NotificationListProps) {
  const [loading, setLoading] = useState(false);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      onUpdate();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await markAllAsRead();
      onUpdate();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4" />;
      case "rating":
        return <Star className="h-4 w-4" />;
      case "system":
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No notifications
      </div>
    );
  }

  return (
    <div>
      <div className="p-2 border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          disabled={loading || !notifications.some((n) => !n.read)}
          onClick={handleMarkAllAsRead}
        >
          Mark all as read
        </Button>
      </div>

      <div className="divide-y">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`p-4 ${!notification.read ? "bg-accent" : ""}`}
          >
            <div className="flex gap-3">
              <div className="mt-1">{getIcon(notification.type)}</div>
              <div className="flex-1">
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(notification.created_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}