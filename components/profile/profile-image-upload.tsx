"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X } from "lucide-react";
import { uploadProfileImage, removeProfileImage } from "@/lib/api/profile";

interface ProfileImageUploadProps {
  userId: string;
  currentImage: string | null;
  onImageUpdate: (url: string | null) => void;
}

export function ProfileImageUpload({
  userId,
  currentImage,
  onImageUpdate,
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;

    try {
      setUploading(true);
      const file = e.target.files[0];
      const publicUrl = await uploadProfileImage(userId, file);
      onImageUpdate(publicUrl);
      
      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleImageRemove() {
    try {
      await removeProfileImage(userId);
      onImageUpdate(null);
      
      toast({
        title: "Success",
        description: "Profile image removed successfully",
      });
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove image",
      });
    }
  }

  return (
    <div className="space-y-4">
      <Label>Profile Image</Label>
      <div className="flex items-center gap-4">
        {currentImage ? (
          <div className="relative">
            <Image
              src={currentImage}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2"
              onClick={handleImageRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="w-[100px] h-[100px] rounded-full bg-muted flex items-center justify-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <Label htmlFor="image-upload">
            <Button variant="outline" disabled={uploading} asChild>
              <span>
                {uploading ? "Uploading..." : "Upload Image"}
              </span>
            </Button>
          </Label>
          <p className="text-sm text-muted-foreground mt-2">
            Recommended: Square image, at least 500x500px
          </p>
        </div>
      </div>
    </div>
  );
}