"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase/client";

interface Template {
  id: string;
  type: string;
  subject: string;
  content: string;
  variables: string[];
}

export function NotificationTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('type');

      if (error) throw error;

      setTemplates(data || []);
      if (data?.[0]) {
        setSelectedTemplate(data[0]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load notification templates');
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('notification_templates')
        .upsert({
          id: selectedTemplate.id,
          type: selectedTemplate.type,
          subject: selectedTemplate.subject,
          content: selectedTemplate.content,
          variables: selectedTemplate.variables,
        });

      if (error) throw error;

      toast.success('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Email Templates</h2>
            <Select
              value={selectedTemplate?.type}
              onValueChange={(value) => {
                const template = templates.find((t) => t.type === value);
                if (template) {
                  setSelectedTemplate(template);
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.type}>
                    {template.type.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Textarea
                  value={selectedTemplate.subject}
                  onChange={(e) =>
                    setSelectedTemplate((prev) =>
                      prev ? { ...prev, subject: e.target.value } : null
                    )
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={selectedTemplate.content}
                  onChange={(e) =>
                    setSelectedTemplate((prev) =>
                      prev ? { ...prev, content: e.target.value } : null
                    )
                  }
                  rows={10}
                />
              </div>

              <div className="space-y-2">
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable) => (
                    <code
                      key={variable}
                      className="px-2 py-1 bg-muted rounded text-sm"
                    >
                      {`{{${variable}}}`}
                    </code>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Template"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}