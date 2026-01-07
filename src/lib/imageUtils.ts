// URL Supabase
const SUPABASE_URL = 'https://minwoumfgutampcgrcbr.supabase.co';

/**
 * Génère l'URL complète pour une image stockée dans Supabase Storage
 */
export function getSupabaseImageUrl(storagePath: string): string {
  if (!storagePath) return '';
  
  // Si le path commence déjà par une URL complète, on la retourne telle quelle
  if (storagePath.startsWith('http')) {
    return storagePath;
  }
  
  // Si le path commence par 'storage/v1/object/public/', on ajoute juste l'URL de base
  if (storagePath.startsWith('storage/v1/object/public/')) {
    return `${SUPABASE_URL}/${storagePath}`;
  }
  
  // Si le path commence par 'medias/', 'etablissements/' ou un autre bucket, on construit l'URL complète
  if (storagePath.startsWith('medias/') || storagePath.startsWith('etablissements/')) {
    return `${SUPABASE_URL}/storage/v1/object/public/${storagePath}`;
  }
  
  // Par défaut, on assume que c'est un path relatif dans le bucket medias (nouveau défaut depuis migration)
  return `${SUPABASE_URL}/storage/v1/object/public/medias/${storagePath}`;
}

/**
 * Génère l'URL pour l'API Next.js Image (avec optimisation)
 */
export function getOptimizedImageUrl(storagePath: string): string {
  const fullUrl = getSupabaseImageUrl(storagePath);
  return `/api/imageproxy?url=${encodeURIComponent(fullUrl)}`;
}
