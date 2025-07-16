import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, User, X } from 'lucide-react';
import ImageCropModal from './ImageCropModal';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  initialImageUrl?: string | null;
  isAvatar?: boolean;
}

const ImageUpload = ({ onImageSelect, initialImageUrl = null, isAvatar = false }: ImageUploadProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImageSrc(reader.result as string);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (blob: Blob) => {
    const file = new File([blob], "cropped_image.png", { type: "image/png" });
    setImageUrl(URL.createObjectURL(blob));
    onImageSelect(file);
    setCropImageSrc(null);
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      
      <ImageCropModal
        open={isCropModalOpen}
        onOpenChange={setIsCropModalOpen}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
        aspect={isAvatar ? 1 : 16 / 9}
      />

      {isAvatar ? (
        <div className="relative w-32 h-32 group">
          <Avatar className="h-32 w-32">
            <AvatarImage src={imageUrl || undefined} />
            <AvatarFallback><User className="h-16 w-16" /></AvatarFallback>
          </Avatar>
          <div 
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
            onClick={triggerFileSelect}
          >
            <Upload className="h-8 w-8 text-white" />
          </div>
        </div>
      ) : (
        <div 
          className="w-full aspect-video border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer relative group"
          onClick={!imageUrl ? triggerFileSelect : undefined}
        >
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              <div className="absolute top-2 right-2">
                <Button variant="destructive" size="icon" onClick={handleRemoveImage}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12" />
              <p className="mt-2">Click to upload thumbnail</p>
              <p className="text-xs">PNG, JPG, WEBP</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;