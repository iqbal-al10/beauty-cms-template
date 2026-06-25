import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import { prisma } from '@/lib/prisma'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  return {
    title: settings?.siteName || 'Beauty Studio',
    description: 'Premium skincare and beauty products',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings?.siteName || 'Beauty Studio',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    logo: settings?.logoUrl || '',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings?.whatsappNumber || '',
      contactType: 'Customer Service',
    },
  }

  const gaTrackingId = settings?.gaTrackingId || ''

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>

        {gaTrackingId && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaTrackingId}');
                `,
              }}
            />
          </>
        )}

        <Script
          id="visitor-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function trackPageView() {
                try {
                  fetch('/api/public/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      page: window.location.pathname,
                      referrer: document.referrer || '',
                    })
                  }).catch(() => {});
                } catch (e) {}
              })();

              if (typeof window !== 'undefined') {
                const originalPushState = history.pushState;
                const originalReplaceState = history.replaceState;

                const trackNavigation = function(url) {
                  try {
                    const pathname = new URL(url, window.location.origin).pathname;
                    fetch('/api/public/analytics', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        page: pathname,
                        referrer: window.location.pathname,
                      })
                    }).catch(() => {});
                  } catch (e) {}
                };

                history.pushState = function() {
                  originalPushState.apply(this, arguments);
                  if (arguments[2]) {
                    trackNavigation(arguments[2]);
                  }
                };

                history.replaceState = function() {
                  originalReplaceState.apply(this, arguments);
                  if (arguments[2]) {
                    trackNavigation(arguments[2]);
                  }
                };

                window.addEventListener('popstate', function() {
                  trackNavigation(window.location.pathname);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
