import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  label: string;
  accept?: string;
  onUploadComplete: (url: string) => void;
  currentFile?: string;
  bucket?: string;
  maxSizeMB?: number;
}

export const FileUpload = ({
  label,
  accept = "image/*",
  onUploadComplete,
  currentFile,
  bucket = "documents",
  maxSizeMB = 5,
}: FileUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentFile || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: `File size must be less than ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onUploadComplete(publicUrl);

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {preview ? (
        <div className="relative border-2 border-dashed border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {accept.includes("image") ? (
                <img
                  src={preview}
                  alt={label}
                  className="h-16 w-16 object-cover rounded"
                />
              ) : (
                <FileIcon className="h-16 w-16 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">Uploaded</p>
                <p className="text-xs text-muted-foreground">Click remove to change</p>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              data-testid="button-remove-file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label className="border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors block">
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">
                {uploading ? "Uploading..." : "Click to upload"}
              </p>
              <p className="text-xs text-muted-foreground">
                Max size: {maxSizeMB}MB
              </p>
            </div>
          </div>
          <Input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            data-testid="input-file-upload"
          />
        </label>
      )}
    </div>
  );
};
