import { fileExists } from 'next/dist/lib/file-exists';

export const MAX_MEDIA_SIZE_BYTES = 2 * 1024 * 1024;

export const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;

export function validateMediaFile(file: File): string | null {
  const allowed = ALLOWED_MEDIA_TYPES as readonly string[];
  if (!allowed.includes(file.type)) {
    return 'Format non autorisé. Utilisez un fichier JPEG, PNG, GIF ou WebP.';
  }
  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    return 'Fichier trop volumineux (maximum 2 Mo).';
  }
  return null;
}
