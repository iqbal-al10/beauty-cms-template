/**
 * Slug Generator - Super Robust
 * Digunakan untuk semua kebutuhan slug di seluruh aplikasi
 * Products, Categories, Bookings, dll.
 */

export const generateSlug = (text: string): string => {
  if (!text) return ''
  
  // Step 1: Normalisasi teks
  let slug = text
    .normalize('NFKD')                    // Normalisasi unicode (é → e, etc)
    .replace(/[\u0300-\u036f]/g, '')      // Hapus diacritics (áéíóú → aeiou)
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')     // Karakter aneh jadi spasi
    .trim()                               // Hapus spasi di ujung
  
  // Step 2: Ganti spasi dengan -
  slug = slug.replace(/\s+/g, '-')
  
  // Step 3: Ganti multiple - dengan single -
  slug = slug.replace(/-+/g, '-')
  
  // Step 4: Hapus - di awal dan akhir
  slug = slug.replace(/^-+|-+$/g, '')
  
  // Step 5: Convert ke lowercase
  slug = slug.toLowerCase()
  
  return slug
}

/**
 * Generate canonical URL berdasarkan slug dan prefix
 */
export const generateCanonicalUrl = (slug: string, prefix: string = 'products'): string => {
  if (!slug) return ''
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                  (typeof window !== 'undefined' ? window.location.origin : '')
  
  return `${baseUrl}/${prefix}/${slug}`
}