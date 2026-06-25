import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning up invalid bookings...')
  
  // 1. Cari booking dengan serviceId kosong atau null
  const invalidBookings = await prisma.booking.findMany({
    where: {
      OR: [
        { serviceId: '' },
        { serviceId: { equals: '' } },
      ],
    },
  })
  
  console.log(`Found ${invalidBookings.length} invalid bookings`)
  
  // 2. Hapus booking yang tidak memiliki serviceId
  const deleted = await prisma.booking.deleteMany({
    where: {
      OR: [
        { serviceId: '' },
        { serviceId: { equals: '' } },
      ],
    },
  })
  
  console.log(`✅ Deleted ${deleted.count} invalid bookings`)
  
  // 3. Cek sisa booking
  const remaining = await prisma.booking.count()
  console.log(`📊 Remaining bookings: ${remaining}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
