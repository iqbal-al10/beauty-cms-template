'use client'

import Link from 'next/link'

interface Settings {
  siteName: string
  address: string | null
  whatsappNumber: string | null
  email: string | null
  socialLinks: {
    instagram?: string
    facebook?: string
    tiktok?: string
    youtube?: string
    twitter?: string
    linkedin?: string
    pinterest?: string
    threads?: string
  } | null
  operatingHours: Record<string, { open: string; close: string }> | null
  footerContent: string | null
  colorPrimary: string
}

interface FooterProps {
  settings?: Settings | null
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const socialLinks = settings?.socialLinks || {}
  const operatingHours = settings?.operatingHours || {}
  const siteName = settings?.siteName || 'Beauty Studio'
  const primaryColor = settings?.colorPrimary || '#c4367b'

  let footerText = settings?.footerContent || ''
  let footerLinks: { label: string; href: string }[] = []
  
  try {
    if (footerText && typeof footerText === 'string') {
      const parsed = JSON.parse(footerText)
      if (parsed.copyright) footerText = parsed.copyright
      if (parsed.links) footerLinks = parsed.links
    }
  } catch {
    // Jika bukan JSON, gunakan sebagai plain text
  }

  const dayMap: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  }

  // Cek apakah ada social media yang terisi
  const hasSocialLinks = socialLinks && Object.values(socialLinks).some(v => v && v !== '')

  return (
    <footer className="bg-[#1a1a2e] text-white w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3
              className="text-xl font-bold mb-4"
              style={{ color: primaryColor }}
            >
              {siteName}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {footerText || 'Premium beauty services for your perfect look.'}
            </p>
            
            {hasSocialLinks && (
              <div className="flex gap-3 mt-4 flex-wrap">
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                    aria-label="TikTok"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.76-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                    aria-label="YouTube"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.pinterest && (
                  <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                    aria-label="Pinterest"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.244 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.414 0-5.42 2.557-5.42 5.198 0 1.03.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.783 2.748-7.264 7.929-7.264 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.616 0 11.983-5.367 11.983-11.987C24 5.367 18.633 0 12.017 0z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.threads && (
                  <a href={socialLinks.threads} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                    aria-label="Threads"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.452 7.824c-1.628 0-2.734 1.094-2.734 2.676 0 1.582 1.106 2.676 2.734 2.676 1.628 0 2.734-1.094 2.734-2.676 0-1.582-1.106-2.676-2.734-2.676zM16.878 0C9.186 0 3.268 4.188 1.66 9.656c-.104.348-.104.348.262.348h2.656c.458 0 .562-.1.666-.3C6.2 7.11 8.546 4.894 12.452 4.894c4.01 0 6.922 2.906 6.922 6.906 0 3.99-2.912 6.896-6.922 6.896-2.18 0-3.99-.96-5.086-2.53-.982 1.112-2.514 1.828-4.268 2.038-.458.104-.562.208-.666.312.104.104.208.208.312.312 1.3 1.3 2.84 2.218 4.54 2.636 1.214.298 2.302.298 3.4.298 6.484 0 11.64-5.156 11.64-11.64C22.34 5.156 17.184 0 10.7 0c-3.536 0-6.87 1.56-9.27 4.27C.292 5.364 0 6.456 0 7.656 0 12.4 3.78 16.28 8.42 16.28c1.6 0 3.08-.456 4.32-1.26 1.44-.936 2.46-2.36 2.82-4.04.2-.94.16-1.86-.06-2.74-.16-.68-.38-1.32-.66-1.92-.68-1.48-1.74-2.62-3.08-3.38-1.04-.6-2.18-.94-3.4-1.02-.56-.04-1.1-.04-1.64.02-1.1.12-2.08.52-2.96 1.16-.84.6-1.48 1.4-1.88 2.32-.38.84-.5 1.74-.46 2.64.06 1.06.38 2.04.94 2.9.52.82 1.2 1.48 2.04 1.98.76.44 1.62.74 2.54.84.76.08 1.54.04 2.28-.18.54-.16 1.04-.42 1.48-.78.38-.3.68-.7.88-1.16.16-.38.2-.8.1-1.18-.08-.28-.24-.5-.44-.68-.16-.14-.36-.24-.56-.32-.2-.08-.42-.12-.64-.14-.42-.04-.86.02-1.26.12-.22.06-.44.14-.64.24-.32.16-.6.38-.82.64-.12.14-.2.3-.26.48-.08.18-.08.38-.04.56.06.18.16.34.28.48.1.12.22.2.34.28.14.1.28.16.42.2.2.06.4.08.6.08.24.02.48-.02.7-.08.24-.06.46-.18.66-.34.2-.16.38-.36.5-.58.14-.24.22-.52.24-.82.02-.32.02-.64-.04-.96-.04-.28-.14-.54-.28-.78-.12-.2-.28-.38-.46-.52-.24-.2-.52-.34-.82-.44-.32-.1-.66-.14-1-.1-.32.04-.62.14-.9.3-.3.16-.56.38-.78.64-.2.24-.34.52-.44.82-.08.26-.1.54-.08.82.04.3.12.58.26.84.14.24.32.44.54.6.2.14.42.24.64.3.2.06.42.08.62.06.26-.02.52-.1.74-.24.22-.14.4-.34.52-.56.14-.26.2-.56.18-.86-.02-.28-.1-.54-.24-.78-.12-.2-.28-.36-.46-.48-.16-.1-.34-.16-.52-.18-.18-.02-.36 0-.52.04-.14.04-.28.1-.4.18-.12.08-.22.18-.3.3-.06.1-.1.22-.1.34 0 .12.04.22.1.32.06.1.14.18.24.24.08.06.18.1.28.12.12.02.24.02.34-.02.08-.02.16-.06.22-.12.06-.06.1-.14.1-.22 0-.08-.02-.14-.06-.2-.04-.06-.08-.1-.14-.14-.04-.02-.08-.04-.12-.04-.04 0-.08.02-.12.04-.04.02-.06.06-.08.1 0 .04-.02.08-.02.12 0 .04.02.08.04.1.02.02.04.04.06.04.02 0 .04-.02.06-.04.02-.02.02-.04.02-.06 0-.02-.02-.04-.04-.06-.02-.02-.04-.02-.06-.02-.02 0-.04.02-.06.04z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-pink-400 transition-colors">Products</Link></li>
              <li><Link href="/blog" className="hover:text-pink-400 transition-colors">Blog</Link></li>
              <li><Link href="/gallery" className="hover:text-pink-400 transition-colors">Gallery</Link></li>
              <li><Link href="/testimonials" className="hover:text-pink-400 transition-colors">Testimonials</Link></li>
              <li><Link href="/contact" className="hover:text-pink-400 transition-colors">Contact</Link></li>
              <li><Link href="/booking" className="hover:text-pink-400 transition-colors">Booking</Link></li>
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-pink-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {settings?.address && (
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>{settings.address}</span>
                </li>
              )}
              {settings?.whatsappNumber && (
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {settings.whatsappNumber}
                  </a>
                </li>
              )}
              {settings?.email && (
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Operating Hours</h4>
            {operatingHours && Object.keys(operatingHours).length > 0 ? (
              <ul className="space-y-1.5 text-sm text-gray-400">
                {Object.entries(operatingHours).map(([day, hours]) => (
                  <li key={day} className="flex justify-between">
                    <span>{dayMap[day] || day}</span>
                    <span>{hours.open} - {hours.close}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No hours available</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          &copy; {currentYear} {siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
