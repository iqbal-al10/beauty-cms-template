import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create default Settings
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Beauty Studio',
      colorPrimary: '#c4367b',
      colorSecondary: '#f5dbe8',
      colorButton: '#aa1d68',
      fontFamily: 'Inter',
      whatsappNumber: '6285710379820',
      email: 'admin@beautystudio.com',
      enableCart: true,
      enableWhatsAppOrder: true,
      enableGuestCheckout: true,
      enableReviews: true,
      enableTestimonials: true,
      enableBlog: true,
      enableGallery: true,
      enableFaq: true,
    },
  })
  console.log('✅ Settings created')

  // 2. Create Admin User (password: admin123)
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  // Hapus user lama jika ada
  await prisma.user.deleteMany({
    where: { email: 'admin@beautystudio.com' },
  })

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@beautystudio.com',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })
  console.log(`✅ Admin user created: ${admin.email} (password: admin123)`)

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
