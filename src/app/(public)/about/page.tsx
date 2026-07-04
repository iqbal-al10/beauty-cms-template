import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Users, Target, Eye, Award } from 'lucide-react'

export default async function AboutPage() {
  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  const primaryColor = settings?.colorPrimary || '#c4367b'
  const secondaryColor = settings?.colorSecondary || '#f5dbe8'
  const headingFontSize = settings?.headingFontSize || '32px'
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'
  const fontFamily = settings?.fontFamily || 'Inter'

  const aboutHeroTitle = settings?.aboutHeroTitle || 'About Us'
  const aboutHeroSubtitle = settings?.aboutHeroSubtitle || 'Learn more about our journey'
  const aboutStoryTitle = settings?.aboutStoryTitle || 'Our Story'
  const aboutStoryContent = settings?.aboutStoryContent || 'We are passionate about bringing beauty to everyone...'
  const aboutMission = settings?.aboutMission || 'To bring beauty and confidence to every individual'
  const aboutVision = settings?.aboutVision || 'To be the leading beauty destination in the region'
  const aboutTeamTitle = settings?.aboutTeamTitle || 'Meet Our Team'
  const aboutTeam = settings?.aboutTeam || []
  const siteName = settings?.siteName || 'Beauty Studio'

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: fontFamily }}>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2" style={{ fontSize: smallFontSize }}>
        <Link href="/" className="hover:text-[#c4367b] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-800">About</span>
      </nav>

      {/* Hero */}
      <div 
        className="rounded-2xl p-10 text-center mb-12"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <h1 className="font-bold text-white" style={{ fontSize: headingFontSize }}>
          {aboutHeroTitle}
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto" style={{ fontSize: bodyFontSize }}>
          {aboutHeroSubtitle}
        </p>
      </div>

      {/* Our Story */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="font-bold text-gray-800 text-center mb-4" style={{ fontSize: headingFontSize }}>
          {aboutStoryTitle}
        </h2>
        <p className="text-gray-600 text-center leading-relaxed" style={{ fontSize: bodyFontSize }}>
          {aboutStoryContent}
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
            <Target className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2" style={{ fontSize: bodyFontSize }}>Our Mission</h3>
          <p className="text-gray-600" style={{ fontSize: bodyFontSize }}>{aboutMission}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
            <Eye className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2" style={{ fontSize: bodyFontSize }}>Our Vision</h3>
          <p className="text-gray-600" style={{ fontSize: bodyFontSize }}>{aboutVision}</p>
        </div>
      </div>

      {/* Team */}
      {Array.isArray(aboutTeam) && aboutTeam.length > 0 && (
        <div className="mb-16">
          <h2 className="font-bold text-gray-800 text-center mb-8" style={{ fontSize: headingFontSize }}>
            {aboutTeamTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {aboutTeam.map((member: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border-2" style={{ borderColor: primaryColor }} />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold" style={{ backgroundColor: primaryColor }}>
                    {member.name?.charAt(0) || 'T'}
                  </div>
                )}
                <h4 className="font-semibold text-gray-800" style={{ fontSize: bodyFontSize }}>{member.name}</h4>
                <p className="text-gray-500" style={{ fontSize: smallFontSize }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {[
          { value: '500+', label: 'Happy Customers' },
          { value: '50+', label: 'Products' },
          { value: '20+', label: 'Services' },
          { value: '5+', label: 'Years Experience' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="font-bold" style={{ color: primaryColor, fontSize: headingFontSize }}>{stat.value}</p>
            <p className="text-gray-500" style={{ fontSize: smallFontSize }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div 
        className="rounded-2xl p-10 text-center"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <h2 className="font-bold text-white mb-3" style={{ fontSize: headingFontSize }}>
          Ready to Glow?
        </h2>
        <p className="text-white/80 mb-6 max-w-md mx-auto" style={{ fontSize: bodyFontSize }}>
          Book your appointment today and experience the best beauty services
        </p>
        <Link
          href="/booking"
          className="inline-block px-8 py-3 rounded-full bg-white text-gray-900 font-semibold transition-all hover:scale-105 hover:shadow-lg active:scale-95"
          style={{ fontSize: bodyFontSize }}
        >
          Book Now
        </Link>
      </div>
    </div>
  )
}