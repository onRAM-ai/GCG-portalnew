"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Upload, X } from "lucide-react";

interface ProfileFormProps {
  profile: {
    id: string;
    bio?: string;
    images?: string[];
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [bio, setBio] = useState(profile.bio || "");
  const [images, setImages] = useState<string[]>(profile.images || []);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    if (images.length >= 3) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You can only upload up to 3 images",
      });
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${profile.id}/${fileName}`;

    setUploading(true);

    try {
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update images array
      const newImages = [...images, publicUrl];
      setImages(newImages);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          images: newImages,
        });

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload image",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    try {
      // Extract file path from URL
      const filePath = imageUrl.split('profile-images/')[1];

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('profile-images')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Update images array
      const newImages = images.filter(img => img !== imageUrl);
      setImages(newImages);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          images: newImages,
        });

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Image removed successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove image",
      });
    }
  };

  const handleBioUpdate = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          bio,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bio updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update bio",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label>Profile Images</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={url} className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden group">
              <Image
                src={url}
                alt={`Profile image ${index + 1}`}
                fill
                className="object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(url)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {images.length < 3 && (
            <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">
                    {uploading ? "Uploading..." : "Upload Image"}
                  </span>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Bio</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          maxLength={200}
          rows={4}
          className="resize-none"
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {bio.length}/200 characters
          </span>
          <Button onClick={handleBioUpdate}>Save Bio</Button>
        </div>
      </div>
    </div>
  );
}