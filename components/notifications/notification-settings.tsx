"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { updateNotificationPreferences } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";

export function NotificationSettings() {
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    types: {
      booking: true,
      rating: true,
      system: true,
      status: true,
    },
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setPreferences({
          email: data.email_enabled,
          push: data.push_enabled,
          types: data.enabled_types.reduce(
            (acc, type) => ({ ...acc, [type]: true }),
            {
              booking: false,
              rating: false,
              system: false,
              status: false,
            }
          ),
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateNotificationPreferences({
        email: preferences.email,
        push: preferences.push,
        types: Object.entries(preferences.types)
          .filter(([_, enabled]) => enabled)
          .map(([type]) => type),
      });

      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update preferences",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={preferences.email}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, email: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch
              id="push-notifications"
              checked={preferences.push}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, push: checked }))
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Notification Types</h4>

          <div className="space-y-2">
            {Object.entries(preferences.types).map(([type, enabled]) => (
              <div
                key={type}
                className="flex items-center justify-between"
              >
                <Label
                  htmlFor={`type-${type}`}
                  className="capitalize"
                >
                  {type} Notifications
                </Label>
                <Switch
                  id={`type-${type}`}
                  checked={enabled}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      types: {
                        ...prev.types,
                        [type]: checked,
                      },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </Card>
  );
}