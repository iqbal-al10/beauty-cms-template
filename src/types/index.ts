export interface Settings {
  id: string
  siteName: string
  colorPrimary: string
  colorSecondary: string
  colorButton: string
  fontFamily: string
  logoUrl: string | null
  faviconUrl: string | null
  heroBannerUrl: string | null
  whatsappNumber: string | null
  email: string | null
  address: string | null
  footerContent: any
  operatingHours: any
  googleMapsEmbedUrl: string | null
  socialLinks: any
  gaTrackingId: string | null
  metaTitle: string | null
  metaDescription: string | null
  defaultOgImage: string | null
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compareAtPrice: number | null
  stock: number
  status: string
  isFeatured: boolean
  categoryId: string
  imageUrl: string | null
  metaTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  ogImageUrl: string | null
  createdAt: Date
  updatedAt: Date
  category: Category | null
  tags: ProductTag[]
}

export interface Category {
  id: string
  name: string
  slug: string
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  products?: Product[]
}

export interface ProductTag {
  id: string
  name: string
  slug: string
  color: string | null
  createdAt: Date
  updatedAt: Date
  products?: Product[]
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImageUrl: string | null
  status: string
  publishedAt: Date | null
  categoryId: string | null
  metaTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  ogImageUrl: string | null
  createdAt: Date
  updatedAt: Date
  category: BlogCategory | null
  tags: BlogTag[]
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  posts?: BlogPost[]
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
  posts?: BlogPost[]
}

export interface Booking {
  id: string
  customerName: string
  whatsapp: string
  email: string | null
  bookingDate: Date
  bookingTime: string
  serviceId: string | null
  notes: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  service: Service | null
}

export interface Service {
  id: string
  name: string
  slug: string
  description: string | null
  duration: number
  price: number
  categoryId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  bookings?: Booking[]
}

export interface Testimonial {
  id: string
  customerName: string
  customerPhotoUrl: string | null
  rating: number
  reviewText: string
  isPublished: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface FAQ {
  id: string
  question: string
  answer: string
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Promo {
  id: string
  title: string
  type: string
  voucherCode: string | null
  discountValue: number | null
  discountType: string | null
  startDate: Date
  endDate: Date
  bannerUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  products: PromoProduct[]
}

export interface PromoProduct {
  id: string
  promoId: string
  productId: string
  price: number | null
  createdAt: Date
  product: Product
  promo: Promo
}

export interface Order {
  id: string
  customerName: string
  customerWhatsapp: string
  address: string | null
  productId: string
  productName: string
  quantity: number
  price: number
  discountAmount: number | null
  finalPrice: number
  voucherCode: string | null
  paymentMethod: string | null
  paymentProof: string | null
  status: string
  note: string | null
  approvedBy: string | null
  approvedAt: Date | null
  createdAt: Date
  updatedAt: Date
  product: Product
  user: User | null
}

export interface PaymentMethod {
  id: string
  name: string
  type: string
  accountNumber: string | null
  accountName: string | null
  qrCodeUrl: string | null
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface MediaFile {
  id: string
  url: string
  fileName: string
  fileType: string
  sizeBytes: number
  folder: string | null
  altText: string | null
  uploadedAt: Date
}

export interface StockHistory {
  id: string
  productId: string
  oldStock: number
  newStock: number
  change: number
  reason: string | null
  note: string | null
  userId: string
  createdAt: Date
  product: Product
  user: User
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string | null
  metadata: any
  createdAt: Date
  user: User
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  whatsapp: string | null
  message: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface BeforeAfter {
  id: string
  title: string
  category: string
  beforeImageUrl: string
  afterImageUrl: string
  description: string | null
  sortOrder: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface VideoContent {
  id: string
  title: string
  sourceType: string
  url: string
  thumbnailUrl: string | null
  sortOrder: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  productId: string
  customerName: string
  rating: number
  comment: string | null
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  product: Product
}