'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, Share2, Camera, MessageCircle, Video, CircleUser } from 'lucide-react'

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

  const socialIcons: Record<string, any> = {
    instagram: Camera,
    facebook: Share2,
    twitter: MessageCircle,
    youtube: Video,
    tiktok: CircleUser,
  }

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
                <MapPin className="w-4 h-4 mt-1 shrink-0" style={{ color: primaryColor }} />
                {address}
              </p>
            )}
            {whatsappNumber && (
              <p 
                className="text-gray-600 mb-2 flex items-center gap-2"
                style={{ fontSize: bodyFontSize }}
              >
                <Phone className="w-4 h-4" style={{ color: primaryColor }} />
                {whatsappNumber}
              </p>
            )}
            {email && (
              <p 
                className="text-gray-600 mb-2 flex items-center gap-2"
                style={{ fontSize: bodyFontSize }}
              >
                <Mail className="w-4 h-4" style={{ color: primaryColor }} />
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

          {/* Social & Newsletter */}
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
                const Icon = socialIcons[key.toLowerCase()]
                if (!Icon) return null
                return (
                  <a
                    key={key}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full transition-colors hover:opacity-70"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    <Icon className="w-5 h-5" />
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
