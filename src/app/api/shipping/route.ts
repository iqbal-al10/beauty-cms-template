import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Default shipping zones
const DEFAULT_SHIPPING_ZONES = [
  {
    id: 1,
    name: 'Mojokerto & Sekitarnya',
    cities: ['Mojokerto', 'Mojokerto Kota', 'Jombang', 'Gresik', 'Lamongan', 'Sidoarjo'],
    cost: 10000,
    estimate: '1-2 hari'
  },
  {
    id: 2,
    name: 'Surabaya Raya',
    cities: ['Surabaya', 'Surabaya Kota', 'Bangkalan', 'Madura'],
    cost: 12000,
    estimate: '1-2 hari'
  },
  {
    id: 3,
    name: 'Malang Raya',
    cities: ['Malang', 'Batu', 'Pasuruan', 'Probolinggo', 'Kediri', 'Blitar'],
    cost: 15000,
    estimate: '2-3 hari'
  },
  {
    id: 4,
    name: 'Jawa Timur Lainnya',
    cities: ['Tulungagung', 'Trenggalek', 'Ponorogo', 'Madiun', 'Ngawi', 'Magetan', 'Bojonegoro', 'Tuban', 'Pamekasan', 'Sumenep', 'Sampang', 'Bondowoso', 'Situbondo', 'Jember', 'Banyuwangi', 'Lumajang'],
    cost: 20000,
    estimate: '3-4 hari'
  },
  {
    id: 5,
    name: 'Jawa Tengah & Yogyakarta',
    cities: ['Semarang', 'Surakarta', 'Yogyakarta', 'Solo', 'Pekalongan', 'Tegal', 'Purwokerto', 'Cilacap', 'Kebumen', 'Kudus', 'Demak', 'Magelang', 'Salatiga', 'Klaten', 'Sragen'],
    cost: 25000,
    estimate: '3-5 hari'
  },
  {
    id: 6,
    name: 'Jakarta & Sekitarnya',
    cities: ['Jakarta', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Utara', 'Bekasi', 'Tangerang', 'Depok', 'Bogor', 'Cibinong', 'Cikarang', 'Karawang'],
    cost: 28000,
    estimate: '3-5 hari'
  },
  {
    id: 7,
    name: 'Jawa Barat',
    cities: ['Bandung', 'Cimahi', 'Sukabumi', 'Cianjur', 'Cirebon', 'Indramayu', 'Subang', 'Purwakarta', 'Sumedang', 'Garut', 'Tasikmalaya', 'Kuningan', 'Majalengka'],
    cost: 25000,
    estimate: '4-6 hari'
  },
  {
    id: 8,
    name: 'Bali & NTB',
    cities: ['Denpasar', 'Badung', 'Gianyar', 'Tabanan', 'Mataram', 'Lombok'],
    cost: 35000,
    estimate: '5-7 hari'
  },
  {
    id: 9,
    name: 'Sumatera & Kalimantan',
    cities: ['Medan', 'Pekanbaru', 'Padang', 'Palembang', 'Banda Aceh', 'Pontianak', 'Balikpapan', 'Samarinda', 'Banjarmasin', 'Jambi', 'Bengkulu', 'Lampung', 'Batam', 'Tanjung Pinang'],
    cost: 40000,
    estimate: '7-10 hari'
  },
  {
    id: 10,
    name: 'Sulawesi & Papua',
    cities: ['Makassar', 'Manado', 'Palu', 'Kendari', 'Jayapura', 'Sorong', 'Timika', 'Merauke', 'Gorontalo', 'Ambon'],
    cost: 50000,
    estimate: '10-14 hari'
  },
  {
    id: 11,
    name: 'Lainnya',
    cities: [],
    cost: 35000,
    estimate: '5-7 hari'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    // Get shipping zones from settings
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
    })

    let zones = DEFAULT_SHIPPING_ZONES
    if (settings?.shippingZones) {
      try {
        const parsed = typeof settings.shippingZones === 'string' 
          ? JSON.parse(settings.shippingZones) 
          : settings.shippingZones
        if (Array.isArray(parsed) && parsed.length > 0) {
          zones = parsed
        }
      } catch (e) {
        console.error('Error parsing shipping zones:', e)
      }
    }

    const freeShippingThreshold = settings?.freeShippingThreshold || 300000

    // If city specified, find shipping cost
    if (city) {
      const found = zones.find((zone: any) => 
        zone.cities.some((c: string) => 
          c.toLowerCase().includes(city.toLowerCase())
        )
      )

      if (found) {
        return NextResponse.json({
          cost: found.cost,
          estimate: found.estimate,
          zone: found.name,
          freeShippingThreshold,
        })
      }

      // Return default cost if not found
      const defaultZone = zones.find((z: any) => z.cities.length === 0) || zones[zones.length - 1]
      return NextResponse.json({
        cost: defaultZone?.cost || 35000,
        estimate: defaultZone?.estimate || '5-7 hari',
        zone: defaultZone?.name || 'Lainnya',
        freeShippingThreshold,
      })
    }

    // Return all zones
    return NextResponse.json({
      zones,
      freeShippingThreshold,
    })
  } catch (error) {
    console.error('Error fetching shipping:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping data' },
      { status: 500 }
    )
  }
}
