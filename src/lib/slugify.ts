/**
 * Génère un slug propre à partir d'un titre
 * Gère les caractères accentués français
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, "") // Garde seulement lettres, chiffres, espaces, tirets
    .trim()
    .replace(/\s+/g, "-") // Remplace les espaces par des tirets
    .replace(/-+/g, "-") // Supprime les tirets consécutifs
    .slice(0, 80); // Limite la longueur
}

/**
 * Génère un slug unique en ajoutant un timestamp
 */
export function generateUniqueSlug(title: string): string {
  const baseSlug = generateSlug(title);
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
}
