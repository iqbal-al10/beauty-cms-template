import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white w-full">
      {/* Container untuk center keseluruhan footer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Grid - teks di dalamnya rata kiri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand - Rata Kiri */}
          <div className="text-left">
            <h3 className="text-xl font-bold mb-4">Beauty Studio</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium skincare and beauty products for your glowing skin.
            </p>
          </div>

          {/* Quick Links - Rata Kiri */}
          <div className="text-left">
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-pink-400 transition-colors">Products</Link></li>
              <li><Link href="/blog" className="hover:text-pink-400 transition-colors">Blog</Link></li>
              <li><Link href="/about" className="hover:text-pink-400 transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-pink-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact - Rata Kiri */}
          <div className="text-left">
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>WhatsApp: +62 812-3456-7890</li>
              <li>Email: hello@beautystudio.com</li>
              <li>Jakarta, Indonesia</li>
            </ul>
          </div>

          {/* Social - Rata Kiri */}
          <div className="text-left">
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex flex-col space-y-2 text-sm text-gray-400">
              <a href="#" className="hover:text-pink-400 transition-colors">Instagram</a>
              <a href="#" className="hover:text-pink-400 transition-colors">Facebook</a>
              <a href="#" className="hover:text-pink-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-pink-400 transition-colors">YouTube</a>
            </div>
          </div>
        </div>

        {/* Copyright - Center */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          &copy; {currentYear} Beauty Studio. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
