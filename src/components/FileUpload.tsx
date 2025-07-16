import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  acceptedFileTypes: string;
  label: string;
  description: string;
  isUploading: boolean;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, acceptedFileTypes, label, description, isUploading, className }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUploading) {
      setUploadProgress(0);
      timer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(timer);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
    } else {
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    }
    return () => clearInterval(timer);
  }, [isUploading]);

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      onFileChange(selectedFile);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(active);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDrag(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleDrag]);

  const removeFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div
      className={cn("relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors", isDragActive && "border-primary", className)}
      onDragEnter={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDragOver={(e) => handleDrag(e, true)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={acceptedFileTypes}
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
      />
      
      {file ? (
        <div className="relative w-full h-full p-4">
          {preview && file.type.startsWith('image/') ? (
            <img src={preview} alt="Preview" className="object-contain w-full h-full rounded-lg" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <FileIcon className="w-12 h-12 text-primary" />
              <p className="mt-2 font-semibold">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          )}
          <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 z-10" onClick={removeFile}>
            <X className="h-4 w-4" />
          </Button>
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-background/90 rounded-lg">
              <p className="text-lg font-semibold mb-4">Uploading...</p>
              <Progress value={uploadProgress} className="w-3/4" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-4">
          <UploadCloud className="w-12 h-12 text-primary" />
          <p className="mt-4 font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          <Button variant="outline" size="sm" className="mt-4 pointer-events-none">Choose File</Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;