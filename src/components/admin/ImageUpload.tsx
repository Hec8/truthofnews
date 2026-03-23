"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import { uploadArticleImage } from "@/services/storageService";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  slug?: string;
}

export default function ImageUpload({ value, onChange, slug }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Seules les images sont acceptées");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 MB");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadArticleImage(file, slug || `article-${Date.now()}`);
      onChange(url);
      toast.success("Image uploadée !");
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-[#e2e8f0] dark:border-[#334155]">
          <Image
            src={value}
            alt="Image de l'article"
            width={800}
            height={400}
            className="w-full h-52 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed border-[#e2e8f0] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#0f172a] cursor-pointer hover:border-[#1a3a6b] dark:hover:border-[#3b6ef6] transition-colors group"
        >
          <ImageIcon className="h-10 w-10 text-[#cbd5e1] group-hover:text-[#1a3a6b] dark:group-hover:text-[#3b6ef6] transition-colors mb-2" />
          <p className="text-sm text-[#94a3b8]">Cliquez pour choisir une image</p>
          <p className="text-xs text-[#cbd5e1] mt-1">PNG, JPG, WebP · Max 5 MB</p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={uploading}
          onClick={() => fileRef.current?.click()}
          className="w-full shrink-0 sm:w-auto"
        >
          <Upload className="h-4 w-4 mr-1" />
          {uploading ? "Upload..." : "Uploader"}
        </Button>

        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Ou entrez une URL d'image..."
            className="flex-1 h-8 px-3 rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e293b] text-sm text-[#0f172a] dark:text-[#f8fafc] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] dark:focus:ring-[#3b6ef6]"
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            className="w-full sm:w-auto"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
