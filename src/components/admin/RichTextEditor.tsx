"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { uploadArticleImage } from "@/services/storageService";
import {
  Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Heading3,
  Link2, Image as ImageIcon, Undo, Redo, Strikethrough, Code, Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  articleSlug?: string;
}

function ToolbarButton({
  onClick,
  active = false,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "p-2 rounded-md transition-colors",
        active
          ? "bg-[#1a3a6b] text-white"
          : "text-[#374151] dark:text-[#d1d5db] hover:bg-[#f1f5f9] dark:hover:bg-[#334155]"
      )}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Rédigez votre article ici...",
  articleSlug,
}: RichTextEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily.configure({ types: ["textStyle"] }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-600 underline" } }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL du lien :");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("URL de l'image :");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Seules les images sont acceptées");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 MB");
      e.target.value = "";
      return;
    }

    setUploadingImage(true);
    try {
      const safeSlug = articleSlug?.trim() || `article-${Date.now()}`;
      const url = await uploadArticleImage(file, `${safeSlug}-inline`);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      toast.success("Image insérée dans l'article");
    } catch {
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  return (
    <div className="border border-[#e2e8f0] dark:border-[#334155] rounded-xl overflow-hidden bg-white dark:bg-[#1e293b]">
      {/* Barre d'outils */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-[#e2e8f0] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#0f172a]">
        <select
          className="h-9 px-2 rounded-md border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e293b] text-xs text-[#374151] dark:text-[#d1d5db]"
          defaultValue=""
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              editor.chain().focus().unsetFontFamily().run();
            } else {
              editor.chain().focus().setFontFamily(value).run();
            }
          }}
          title="Police"
        >
          <option value="">Police</option>
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman, serif">Times New Roman</option>
          <option value="Courier New, monospace">Courier New</option>
        </select>

        <input
          type="color"
          className="h-9 w-10 p-1 rounded-md border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e293b] cursor-pointer"
          title="Couleur du texte"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Titre 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Titre 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Titre 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-8 bg-[#e2e8f0] dark:bg-[#334155] mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Gras"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italique"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Barré"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-8 bg-[#e2e8f0] dark:bg-[#334155] mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Liste à puces"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Liste numérotée"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Citation"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-8 bg-[#e2e8f0] dark:bg-[#334155] mx-1 self-center" />

        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Insérer un lien">
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Insérer une image">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          title="Uploader une image"
        >
          <Upload className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-8 bg-[#e2e8f0] dark:bg-[#334155] mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Annuler"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Rétablir"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInlineImageUpload}
      />

      {uploadingImage && (
        <div className="px-3 py-1.5 text-xs text-[#64748b] border-b border-[#e2e8f0] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#0f172a]">
          Upload de l&apos;image en cours...
        </div>
      )}

      {/* Zone d'édition */}
      <EditorContent
        editor={editor}
        className="min-h-[350px] prose prose-sm max-w-none dark:prose-invert"
      />
    </div>
  );
}
