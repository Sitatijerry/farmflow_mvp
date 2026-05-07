import { useState, useRef } from "react";
import { ImageType } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface ImageUploadCardProps {
  onUpload?: (file: File, imageType: ImageType, notes: string) => void;
  isLoading?: boolean;
}

const imageTypeLabels: Record<ImageType, string> = {
  soil: "Soil Sample",
  crop: "Crop Health",
  pest: "Pest Sighting",
  irrigation: "Irrigation",
  general: "General Observation",
};

export function ImageUploadCard({
  onUpload,
  isLoading,
}: ImageUploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [imageType, setImageType] = useState<ImageType>("general");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile, imageType, notes);
      // Reset form
      setSelectedFile(null);
      setPreview("");
      setImageType("general");
      setNotes("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview("");
    setNotes("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Upload Field Observation
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Image Preview */}
        {preview ? (
          <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-primary/50">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload image</p>
              <p className="text-xs text-muted-foreground">or drag and drop</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Camera Capture */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isLoading}
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
          </div>
        )}

        {/* Image Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Observation Type</label>
          <Select value={imageType} onValueChange={(value) => setImageType(value as ImageType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(imageTypeLabels) as Array<[ImageType, string]>).map(
                ([type, label]) => (
                  <SelectItem key={type} value={type}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (Optional)</label>
          <Textarea
            placeholder="Add any additional observations or details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-20 resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Upload Button */}
        {selectedFile && (
          <Button
            className="w-full"
            onClick={handleUpload}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? "Uploading..." : "Upload Observation"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
