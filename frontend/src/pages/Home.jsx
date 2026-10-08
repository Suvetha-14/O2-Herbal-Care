import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Carousel from '../components/Carousel'
import ProductCarousel from '../components/ProductCarousel'
import AddToCartModal from '../components/AddToCartModal'
import { getProducts } from '../services/productApi'
import defaultCatalog from '../data/products'

// Real high-resolution banner assets from project public folder
const HERO_SLIDES = [
  {
    image: '/SLIDES/SLIDE1.png',
    title: 'Pure Herbal Soaps',
    subtitle: 'Handcrafted with Aloe Vera, Neem & Essential Oils',
    cta: 'Explore Soaps',
    category: 'Herbal Soap',
  },
  {
    image: '/SLIDES/SLIDE2.png',
    title: 'Ayurvedic Hair Cleansers',
    subtitle: 'Gentle Shikakai & Bhringraj for Strong, Healthy Roots',
    cta: 'Explore Shampoos',
    category: 'Shampoo',
  },
  {
    image: '/SLIDES/SLIDE3.png',
    title: 'Natural Glow Skincare',
    subtitle: 'Small-batch, chemical-free botanicals crafted in Coimbatore',
    cta: 'Shop Collection',
    category: 'all',
  },
]

const TRUST_POINTS = [
  { icon: '🌱', title: '100% Chemical-Free', desc: 'Free from sulphates, parabens & toxins' },
  { icon: '🐰', title: 'Cruelty-Free', desc: 'Ethically tested, never on animals' },
  { icon: '✋', title: 'Handmade in India', desc: 'Crafted in small batches in Coimbatore' },
  { icon: '♻️', title: 'Eco-Friendly', desc: 'Sustainable botanical ingredients' },
]

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showAddToCart, setShowAddToCart] = useState(false)
  const [products, setProducts] = useState(defaultCatalog)

  useEffect(() => {
    let mounted = true
    const fetchProducts = async () => {
      try {
        const res = await getProducts()
        if (mounted && res.data?.products?.length > 0) {
          setProducts(res.data.products)
        }
      } catch (err) {
        console.warn('Using default catalog as live fallback:', err.message)
      }
    }
    fetchProducts()
    return () => {
      mounted = false
    }
  }, [])

  const handleBuyClick = (product) => {
    setSelectedProduct(product)
    setShowAddToCart(true)
  }

  const soapProducts = products.filter((p) =>
    (p.category || '').toLowerCase().includes('soap')
  )
  const shampooProducts = products.filter((p) =>
    (p.category || '').toLowerCase().includes('shampoo')
  )
  const otherProducts = products.filter(
    (p) =>
      !(p.category || '').toLowerCase().includes('soap') &&
      !(p.category || '').toLowerCase().includes('shampoo')
  )

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Welcome header strip */}
        <section className="bg-[var(--color-cream)] py-6 sm:py-8 border-b border-black/5 text-center px-4 relative overflow-hidden">
          <span className="absolute -left-4 top-2 text-4xl opacity-15 select-none pointer-events-none">🌿</span>
          <span className="absolute right-4 bottom-2 text-3xl opacity-15 select-none pointer-events-none">🍃</span>
          <p className="eyebrow justify-center mb-2">Nature's Touch, Bottled with Care</p>
          <h1 className="heading-font text-2xl sm:text-4xl text-[var(--color-primary)] font-bold">
            Welcome to O2 Herbal Care
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--color-secondary)] max-w-xl mx-auto">
            Gentle, nourishing botanical formulations for your daily skin and hair routine.
          </p>
        </section>

        {/* Hero Slideshow Section */}
        <section className="w-full relative bg-gray-100 overflow-hidden">
          <Carousel autoPlayInterval={5500}>
            {HERO_SLIDES.map((slide, index) => (
              <div key={index} className="relative w-full aspect-[16/8] sm:aspect-[21/9] md:aspect-[24/8] min-h-[220px] max-h-[520px] overflow-hidden group">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to SVG slide if PNG is blocked
                    e.currentTarget.src = `/images/slides/slide${(index % 3) + 1}.svg`
                  }}
                />

                {/* Subtle gradient overlay to enhance text readability & CTAs */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center">
                  <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full">
                    <div className="max-w-lg text-white space-y-2 sm:space-y-3">
                      <span className="inline-block bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                        Featured Collection
                      </span>
                      <h2 className="heading-font text-xl sm:text-3xl md:text-4xl font-bold leading-tight drop-shadow-sm">
                        {slide.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 max-w-md">
                        {slide.subtitle}
                      </p>
                      <div className="pt-1">
                        <Link
                          to={slide.category === 'all' ? '/products' : `/products?category=${encodeURIComponent(slide.category)}`}
                          className="btn-primary !bg-[var(--color-gold)] !text-[var(--color-ink)] hover:!bg-white text-xs sm:text-sm font-bold shadow-lift"
                        >
                          {slide.cta} →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </section>

        {/* Trust Badges Strip */}
        <section className="bg-[var(--color-primary)] py-8 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className="flex flex-col items-center gap-1.5 p-2">
                <span className="text-3xl transition-transform duration-300 hover:scale-125">
                  {point.icon}
                </span>
                <h3 className="text-white font-bold text-sm">{point.title}</h3>
                <p className="text-white/70 text-xs">{point.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Product Row — Handcrafted Soaps */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="eyebrow mb-1">Handcrafted Cleansers</p>
              <h2 className="heading-font text-2xl sm:text-3xl text-[var(--color-primary)]">
                Herbal Soaps
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-secondary)] underline flex items-center gap-1"
            >
              View All Soaps →
            </Link>
          </div>

          <ProductCarousel>
            <div className="flex gap-5 px-1">
              {(soapProducts.length > 0 ? soapProducts : products.slice(0, 5)).map((p) => (
                <div key={p._id || p.name} className="flex-shrink-0 w-64 sm:w-72">
                  <ProductCard product={p} onBuyClick={handleBuyClick} />
                </div>
              ))}
            </div>
          </ProductCarousel>
        </section>

        {/* Product Row — Shampoos */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="eyebrow mb-1">Root-Strengthening Care</p>
              <h2 className="heading-font text-2xl sm:text-3xl text-[var(--color-primary)]">
                Herbal Shampoos
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-secondary)] underline flex items-center gap-1"
            >
              View All Shampoos →
            </Link>
          </div>

          <ProductCarousel>
            <div className="flex gap-5 px-1">
              {(shampooProducts.length > 0 ? shampooProducts : products.slice(5, 10)).map((p) => (
                <div key={p._id || p.name} className="flex-shrink-0 w-64 sm:w-72">
                  <ProductCard product={p} onBuyClick={handleBuyClick} />
                </div>
              ))}
            </div>
          </ProductCarousel>
        </section>

        {/* Product Row — Herbal Oils & Skincare (if available) */}
        {otherProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <p className="eyebrow mb-1">Daily Wellness</p>
                <h2 className="heading-font text-2xl sm:text-3xl text-[var(--color-primary)]">
                  Hair Oils & Botanical Care
                </h2>
              </div>
              <Link
                to="/products"
                className="text-xs sm:text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-secondary)] underline flex items-center gap-1"
              >
                View Collection →
              </Link>
            </div>

            <ProductCarousel>
              <div className="flex gap-5 px-1">
                {otherProducts.map((p) => (
                  <div key={p._id || p.name} className="flex-shrink-0 w-64 sm:w-72">
                    <ProductCard product={p} onBuyClick={handleBuyClick} />
                  </div>
                ))}
              </div>
            </ProductCarousel>
          </section>
        )}

        {/* Phase 6: Short About Preview Section (NOT duplicated full About page) */}
        <section className="bg-[var(--color-cream)] py-16 px-4 border-t border-black/5">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="text-3xl block">🌿</span>
            <p className="eyebrow justify-center">Our Heritage & Mission</p>
            <h2 className="heading-font text-3xl sm:text-4xl text-[var(--color-primary)] font-bold">
              About O2 Herbal Care
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
              Rooted in Coimbatore, O2 Herbal Care crafts small-batch, plant-powered essentials
              free from harsh chemicals and artificial fillers. We blend traditional wisdom
              with modern purity for radiant skin and resilient hair.
            </p>
            <div className="pt-2">
              <Link to="/about" className="btn-outline !py-2.5 !px-6 text-sm">
                Learn More About Our Story →
              </Link>
            </div>
          </div>
        </section>

        {/* Phase 7: Final CTA Section before Footer */}
        <section className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] py-16 px-4 text-center text-white">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-4xl block">🍃</span>
            <h2 className="heading-font text-3xl sm:text-4xl font-bold">
              Discover Nature's Care Today
            </h2>
            <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto">
              Upgrade your self-care routine with wholesome, handmade herbal formulas delivered right to your doorstep.
            </p>
            <div className="pt-3">
              <Link
                to="/products"
                className="btn-primary !bg-[var(--color-gold)] !text-[var(--color-ink)] hover:!bg-white font-bold text-sm shadow-lift"
              >
                Explore Full Collection ({products.length} Products)
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Add to Cart Modal */}
      {selectedProduct && (
        <AddToCartModal
          isOpen={showAddToCart}
          onClose={() => {
            setShowAddToCart(false)
            setSelectedProduct(null)
          }}
          product={selectedProduct}
        />
      )}

      <Footer />
    </div>
  )
}
