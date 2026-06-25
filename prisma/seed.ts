import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Settings
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Beauty Studio',
      colorPrimary: '#e88ea7',
      whatsappNumber: '6281234567890',
      email: 'hello@beautystudio.com',
    },
  })
  console.log('✅ Settings created')

  // Super Admin
  const passwordHash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@beautystudio.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@beautystudio.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })
  console.log('✅ Admin created')

  // Demo Users
  const demoPassword = await bcrypt.hash('password123', 10)
  await prisma.user.upsert({
    where: { email: 'admin2@beautystudio.com' },
    update: {},
    create: {
      name: 'Admin 2',
      email: 'admin2@beautystudio.com',
      passwordHash: demoPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'editor@beautystudio.com' },
    update: {},
    create: {
      name: 'Editor User',
      email: 'editor@beautystudio.com',
      passwordHash: demoPassword,
      role: 'EDITOR',
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'staff@beautystudio.com' },
    update: {},
    create: {
      name: 'Staff User',
      email: 'staff@beautystudio.com',
      passwordHash: demoPassword,
      role: 'STAFF',
      isActive: true,
    },
  })
  console.log('✅ Users created')

  // ... rest of seed data ...
  console.log('🌱 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
