import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AdminImages() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('slider-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('slider-images').getPublicUrl(filePath);
      
      // Insert into slider_images table
      const { error: dbError } = await supabase
        .from('slider_images')
        .insert([{
          filename: file.name,
          storage_path: data.publicUrl,
          display_order: 999,
          alt_text: file.name,
          is_active: true,
        }]);

      if (dbError) throw dbError;

      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Slider Images</h1>
        <p className="text-muted-foreground">Manage images for homepage and learn more sliders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Select Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
          </div>
          <Button disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Image gallery coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
