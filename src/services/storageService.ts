const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

function ensureCloudinaryConfig() {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary non configuré. Ajoutez NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME et NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET dans .env.local"
    );
  }
}

function extractCloudinaryPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  const fileName = parts[parts.length - 1] || `image-${Date.now()}`;
  const folder = parts.length > 1 ? parts.slice(0, -1).join("/") : "articles";
  const publicId = fileName.replace(/\.[^/.]+$/, "");
  return { folder, publicId };
}

/**
 * Upload une image vers Firebase Storage
 * @param file - Le fichier à uploader
 * @param path - Le chemin dans Storage (ex: "articles/mon-image.jpg")
 * @returns L'URL publique du fichier
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  ensureCloudinaryConfig();

  const { folder, publicId } = extractCloudinaryPath(path);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET as string);
  formData.append("folder", folder);
  formData.append("public_id", publicId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok || !data?.secure_url) {
    const message = data?.error?.message || "Erreur Cloudinary lors de l'upload";
    throw new Error(message);
  }

  return data.secure_url as string;
}

/**
 * Upload l'image principale d'un article
 */
export async function uploadArticleImage(
  file: File,
  articleSlug: string
): Promise<string> {
  const extension = file.name.split(".").pop();
  const path = `articles/${articleSlug}-${Date.now()}.${extension}`;
  return uploadImage(file, path);
}

/**
 * Supprimer une image de Firebase Storage
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  // Suppression Cloudinary nécessite une signature côté serveur.
  // No-op côté client pour éviter d'exposer le secret API.
  console.warn("Suppression image ignorée (Cloudinary côté client):", imageUrl);
}
