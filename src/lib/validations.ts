import { z } from 'zod'

// ===== AUTH =====
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token harus diisi'),
  newPassword: z.string().min(6, 'Password minimal 6 karakter'),
})

// ===== CONTACT =====
export const contactSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  whatsapp: z.string().optional(),
  message: z.string().min(1, 'Pesan tidak boleh kosong'),
})

// ===== BOOKING =====
export const bookingSchema = z.object({
  customerName: z.string().min(2, 'Nama minimal 2 karakter'),
  whatsapp: z.string().min(10, 'Nomor WhatsApp tidak valid'),
  email: z.string().email('Email tidak valid').optional(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  bookingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format jam tidak valid'),
  serviceId: z.string().min(1, 'Service harus dipilih'),
  notes: z.string().optional(),
})

// ===== PRODUCT =====
export const productSchema = z.object({
  name: z.string().min(2, 'Nama produk minimal 2 karakter'),
  slug: z.string().min(2, 'Slug minimal 2 karakter'),
  description: z.string().optional(),
  price: z.number().positive('Harga harus lebih dari 0'),
  stock: z.number().int().min(0, 'Stok minimal 0'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  categoryId: z.string().min(1, 'Kategori harus dipilih'),
})

// ===== USER =====
export const userSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']).optional(),
})

export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  email: z.string().email('Email tidak valid').optional(),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']).optional(),
  isActive: z.boolean().optional(),
})

// ===== REVIEW =====
export const reviewSchema = z.object({
  productId: z.string().min(1, 'Product harus dipilih'),
  customerName: z.string().min(2, 'Nama minimal 2 karakter'),
  rating: z.number().int().min(1).max(5, 'Rating harus 1-5'),
  comment: z.string().optional(),
  isPublished: z.boolean().optional(),
})
