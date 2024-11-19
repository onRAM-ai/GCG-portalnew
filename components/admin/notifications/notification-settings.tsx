"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase/client";

interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  emailServer: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
  notificationTypes: {
    [key: string]: boolean;
  };
  templates: {
    [key: string]: string;
  };
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    pushEnabled: true,
    emailServer: {
      host: "",
      port: 587,
      user: "",
      password: "",
    },
    notificationTypes: {
      SHIFT_CONFIRMATION: true,
      BOOKING_ALERT: true,
      MAY_NOT_RETURN: true,
      DOCUMENT_SHARED: true,
      SYSTEM: true,
    },
    templates: {
      SHIFT_CONFIRMATION: "",
      BOOKING_ALERT: "",
      MAY_NOT_RETURN: "",
      DOCUMENT_SHARED: "",
      SYSTEM: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load notification settings');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('notification_settings')
        .upsert(settings);

      if (error) throw error;

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Notification Channels</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send notifications via email
              </p>
            </div>
            <Switch
              checked={settings.emailEnabled}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, emailEnabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send browser push notifications
              </p>
            </div>
            <Switch
              checked={settings.pushEnabled}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, pushEnabled: checked }))
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Email Server Settings</h2>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input
                value={settings.emailServer.host}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    emailServer: {
                      ...prev.emailServer,
                      host: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Input
                type="number"
                value={settings.emailServer.port}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    emailServer: {
                      ...prev.emailServer,
                      port: parseInt(e.target.value),
                    },
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Username</Label>
              <Input
                value={settings.emailServer.user}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    emailServer: {
                      ...prev.emailServer,
                      user: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Password</Label>
              <Input
                type="password"
                value={settings.emailServer.password}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    emailServer: {
                      ...prev.emailServer,
                      password: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Notification Types</h2>
        <div className="space-y-4">
          {Object.entries(settings.notificationTypes).map(([type, enabled]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{type.replace(/_/g, " ")}</Label>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    notificationTypes: {
                      ...prev.notificationTypes,
                      [type]: checked,
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}