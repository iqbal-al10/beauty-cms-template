'use client'

import Link from 'next/link'
import { 
  FaInstagram, 
  FaFacebook, 
  FaYoutube, 
  FaTwitter, 
  FaLinkedin, 
  FaPinterest,
  FaTiktok
} from 'react-icons/fa'
import { RiThreadsFill } from 'react-icons/ri'

interface Settings {
  siteName: string
  colorPrimary: string
  colorSecondary: string
  fontFamily: string
  address: string | null
  whatsappNumber: string | null
  email: string | null
  socialLinks: any
  footerContent: any
  bodyFontSize: string
  smallFontSize: string
  headingFontSize: string
}

interface FooterProps {
  settings: Settings | null
}

// Map social media keys to React Icons
const SOCIAL_ICONS: Record<string, any> = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  youtube: FaYoutube,
  twitter: FaTwitter,
  linkedin: FaLinkedin,
  pinterest: FaPinterest,
  threads: RiThreadsFill,
  tiktok: FaTiktok,
}

// Platform labels
const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  threads: 'Threads',
  tiktok: 'TikTok',
}

export default function Footer({ settings }: FooterProps) {
  const siteName = settings?.siteName || 'Beauty Studio'
  const primaryColor = settings?.colorPrimary || '#c4367b'
  const fontFamily = settings?.fontFamily || 'Inter'
  const address = settings?.address || null
  const whatsappNumber = settings?.whatsappNumber || null
  const email = settings?.email || null
  const socialLinks = settings?.socialLinks || {}
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'
  const headingFontSize = settings?.headingFontSize || '32px'

  const currentYear = new Date().getFullYear()

  return (
    <footer 
      className="border-t"
      style={{ 
        fontFamily: fontFamily,
        backgroundColor: '#f8f9fa',
        borderColor: `${primaryColor}20`,
      }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 
              className="font-bold mb-4"
              style={{ 
                color: primaryColor,
                fontSize: headingFontSize,
              }}
            >
              {siteName}
            </h3>
            {address && (
              <p 
                className="text-gray-600 mb-2 flex items-start gap-2"
                style={{ fontSize: bodyFontSize }}
              >
                <span>📍</span>
                {address}
              </p>
            )}
            {whatsappNumber && (
              <p 
                className="text-gray-600 mb-2 flex items-center gap-2"
                style={{ fontSize: bodyFontSize }}
              >
                <span>📞</span>
                {whatsappNumber}
              </p>
            )}
            {email && (
              <p 
                className="text-gray-600 mb-2 flex items-center gap-2"
                style={{ fontSize: bodyFontSize }}
              >
                <span>📧</span>
                {email}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 
              className="font-semibold mb-4"
              style={{ 
                color: primaryColor,
                fontSize: bodyFontSize,
              }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { href: '/products', label: 'Products' },
                { href: '/booking', label: 'Booking' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:opacity-70 transition-colors"
                    style={{ fontSize: smallFontSize }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 
              className="font-semibold mb-4"
              style={{ 
                color: primaryColor,
                fontSize: bodyFontSize,
              }}
            >
              Services
            </h4>
            <ul className="space-y-2">
              {[
                'Facial Treatment',
                'Body Care',
                'Hair Care',
                'Nail Art',
                'Makeup',
              ].map((service) => (
                <li key={service}>
                  <span 
                    className="text-gray-600"
                    style={{ fontSize: smallFontSize }}
                  >
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 
              className="font-semibold mb-4"
              style={{ 
                color: primaryColor,
                fontSize: bodyFontSize,
              }}
            >
              Follow Us
            </h4>
            <div className="flex gap-3 mb-4 flex-wrap">
              {Object.entries(socialLinks).map(([key, url]) => {
                if (!url) return null
                
                const IconComponent = SOCIAL_ICONS[key.toLowerCase()]
                if (!IconComponent) return null

                const label = platformLabels[key.toLowerCase()] || key

                return (
                  <a
                    key={key}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full transition-all hover:scale-110 hover:shadow-md"
                    style={{ 
                      backgroundColor: `${primaryColor}15`, 
                      color: primaryColor 
                    }}
                    title={label}
                    aria-label={label}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
            <p 
              className="text-gray-500"
              style={{ fontSize: smallFontSize }}
            >
              © {currentYear} {siteName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
