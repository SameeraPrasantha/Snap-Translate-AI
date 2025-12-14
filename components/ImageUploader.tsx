import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  onClear: () => void;
  selectedImage: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, onClear, selectedImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onImageSelected(base64String);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              processFile(blob);
              e.preventDefault();
            }
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [onImageSelected]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative cursor-pointer group rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out
            flex flex-col items-center justify-center p-8 h-64
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50/50' 
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
            }
          `}
        >
          <div className={`p-4 rounded-full bg-indigo-50 mb-4 group-hover:bg-indigo-100 transition-colors ${isDragging ? 'bg-indigo-100' : ''}`}>
            <Upload className={`w-8 h-8 text-indigo-600 ${isDragging ? 'scale-110' : ''} transition-transform`} />
          </div>
          <p className="text-lg font-medium text-slate-700">Click, paste (Ctrl+V), or drop image</p>
          <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG, JPEG</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 h-64 flex items-center justify-center group">
          <img 
            src={selectedImage} 
            alt="Preview" 
            className="h-full w-full object-contain"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
             <p className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Paste to replace</p>
           </div>
          <button 
            onClick={onClear}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm pointer-events-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};