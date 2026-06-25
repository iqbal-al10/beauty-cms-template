const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning up invalid bookings...')
  
  // Hapus semua booking
  const deleted = await prisma.booking.deleteMany({})
  
  console.log(`✅ Deleted ${deleted.count} bookings`)
  
  // Cek sisa booking
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
