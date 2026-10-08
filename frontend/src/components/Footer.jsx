import { useState } from 'react'
import { Link } from 'react-router-dom'

const POLICIES = {
  refund: {
    title: 'Refund & Returns Policy',
    content:
      'At O2 Herbal Care, we take immense pride in crafting fresh, small-batch botanical personal care products. Due to hygiene considerations, opened personal care items cannot be returned. If you receive a damaged or incorrect product, notify us within 48 hours of delivery with photographic evidence, and our team will issue an immediate replacement or store refund.',
  },
  privacy: {
    title: 'Privacy Policy',
    content:
      'We respect your privacy. O2 Herbal Care collects only the essential customer information required to process and dispatch your orders safely. We do not sell, rent, or trade your personal details with third-party marketers. Passwords and sensitive data are encrypted using industry-standard security protocols.',
  },
  terms: {
    title: 'Terms of Service',
    content:
      'By accessing and shopping on O2 Herbal Care, you agree to our standard terms of service. All herbal product formulations are crafted for cosmetic and personal care wellness and are not intended to diagnose, treat, or cure medical diseases. Individual skin tolerance may vary; a patch test is recommended.',
  },
  shipping: {
    title: 'Shipping Policy',
    content:
      'We dispatch orders across India within 1-2 business days. Standard delivery takes 3-5 working days depending on your postal PIN code. We offer FREE SHIPPING on all orders over ₹500. For orders under ₹500, a nominal shipping charge of ₹50 applies. Cash on Delivery (COD) is available nationwide.',
  },
}

export default function Footer() {
  const [activePolicy, setActivePolicy] = useState(null)

  return (
    <footer className="bg-[#12372A] text-[#ADBC9F] py-14 px-4 sm:px-8 lg:px-12 relative overflow-hidden border-t border-white/5">
      <span className="absolute -bottom-8 -right-4 text-8xl opacity-[0.03] select-none pointer-events-none">🌿</span>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10 relative">
        {/* Brand & Mission */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2 text-white heading-font text-2xl font-bold">
            <span>🌿</span>
            <span>O2 Herbal Care</span>
          </div>
          <p className="text-xs sm:text-sm text-[#ADBC9F]/90 leading-relaxed">
            Coimbatore-crafted homemade herbal skincare & haircare. 100% pure botanical extracts,
            chemical-free formulations, and eco-conscious care.
          </p>
          <div className="pt-2 text-xs text-white/80">
            <p><strong>FSSAI / Reg:</strong> 33AAJCN06391ZM</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h3 className="heading-font text-lg font-bold text-white tracking-wide">Quick Links</h3>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              <Link to="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-[var(--color-gold)] transition-colors">All Products</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-[var(--color-gold)] transition-colors">About Us</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[var(--color-gold)] transition-colors">Contact Us</Link>
            </li>
            <li>
              <Link to="/my-orders" className="hover:text-[var(--color-gold)] transition-colors">Track Orders</Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h3 className="heading-font text-lg font-bold text-white tracking-wide">Categories</h3>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              <Link to="/products?category=Herbal%20Soap" className="hover:text-[var(--color-gold)] transition-colors">
                Herbal Soaps
              </Link>
            </li>
            <li>
              <Link to="/products?category=Shampoo" className="hover:text-[var(--color-gold)] transition-colors">
                Herbal Shampoos
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-[var(--color-gold)] transition-colors">
                Hair Oils & Serums
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-[var(--color-gold)] transition-colors">
                Aloe Vera & Skin Gels
              </Link>
            </li>
          </ul>
        </div>

        {/* Real Contact Details */}
        <div className="space-y-3">
          <h3 className="heading-font text-lg font-bold text-white tracking-wide">Get in Touch</h3>
          <p className="text-xs sm:text-sm text-[#ADBC9F]/90 leading-relaxed">
            📍 23/2 Nehru Nagar, Swamy Settipalayam, Coimbatore, Tamil Nadu - 641047
          </p>
          <p className="text-xs sm:text-sm">
            📞 <a href="tel:9688199900" className="hover:text-[var(--color-gold)] transition-colors">96881 99900</a> / <a href="tel:9944558086" className="hover:text-[var(--color-gold)] transition-colors">99445 58086</a>
          </p>
          <p className="text-xs sm:text-sm">
            📧 <a href="mailto:kumart1973@gmail.com" className="hover:text-[var(--color-gold)] transition-colors">kumart1973@gmail.com</a>
          </p>
        </div>
      </div>

      {/* Policies & Copyright */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#ADBC9F]/80">
        <p>© 2026 O2 Herbal Care. All Rights Reserved.</p>

        {/* Policy Modals Triggers */}
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <button
            onClick={() => setActivePolicy('refund')}
            className="hover:text-white transition-colors underline"
          >
            Refund Policy
          </button>
          <button
            onClick={() => setActivePolicy('shipping')}
            className="hover:text-white transition-colors underline"
          >
            Shipping Policy
          </button>
          <button
            onClick={() => setActivePolicy('privacy')}
            className="hover:text-white transition-colors underline"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActivePolicy('terms')}
            className="hover:text-white transition-colors underline"
          >
            Terms of Service
          </button>
        </div>
      </div>

      {/* Policy Modal */}
      {activePolicy && POLICIES[activePolicy] && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-2xl shadow-lift max-w-lg w-full p-6 animate-fadeUp space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="heading-font text-xl text-[var(--color-primary)] font-bold">
                {POLICIES[activePolicy].title}
              </h3>
              <button
                onClick={() => setActivePolicy(null)}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold"
                aria-label="Close policy"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {POLICIES[activePolicy].content}
            </p>
            <div className="text-right pt-2">
              <button
                onClick={() => setActivePolicy(null)}
                className="btn-primary !py-2 !px-5 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
