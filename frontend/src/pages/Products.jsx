import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import AddToCartModal from '../components/AddToCartModal'
import { getProducts } from '../services/productApi'
import defaultCatalog from '../data/products'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const searchQuery = searchParams.get('search') || ''
  const categoryQuery = searchParams.get('category') || 'all'

  const [products, setProducts] = useState(defaultCatalog)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryQuery)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showAddToCart, setShowAddToCart] = useState(false)

  // Sync category state when URL changes
  useEffect(() => {
    if (categoryQuery) {
      setSelectedCategory(categoryQuery)
    }
  }, [categoryQuery])

  useEffect(() => {
    let mounted = true
    const fetch = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await getProducts()
        if (mounted && res.data?.products?.length > 0) {
          setProducts(res.data.products)
        }
      } catch (err) {
        if (mounted) {
          console.warn('Using default catalog for products fallback:', err.message)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetch()
    return () => {
      mounted = false
    }
  }, [])

  const categories = ['all', ...new Set(products.map((p) => p.category || 'Herbal Care'))]

  const handleBuyClick = (product) => {
    setSelectedProduct(product)
    setShowAddToCart(true)
  }

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat)
    if (cat === 'all') {
      searchParams.delete('category')
      setSearchParams(searchParams)
    } else {
      searchParams.set('category', cat)
      setSearchParams(searchParams)
    }
  }

  const handleClearFilters = () => {
    setSelectedCategory('all')
    navigate('/products')
  }

  let filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(
          (p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
        )

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filteredProducts = filteredProducts.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.ingredients || []).some((ing) => ing.toLowerCase().includes(q))
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="text-center mb-8">
          <p className="eyebrow justify-center mb-2">Our Natural Dispensary</p>
          <h1 className="heading-font text-3xl sm:text-4xl text-[var(--color-primary)] font-bold">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Botanical Products'}
          </h1>
          {searchQuery && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-xs text-gray-500">Showing matches for "{searchQuery}"</span>
              <button
                onClick={handleClearFilters}
                className="text-xs text-red-600 hover:text-red-800 font-semibold underline"
              >
                Clear Search ✕
              </button>
            </div>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="mb-10">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  selectedCategory.toLowerCase() === category.toLowerCase()
                    ? 'bg-[var(--color-primary)] text-white shadow-card scale-105'
                    : 'bg-[var(--color-cream)] text-[var(--color-ink)] hover:bg-[var(--color-accent)]/30'
                }`}
              >
                {category === 'all' ? 'All Products' : category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-[var(--color-primary)] rounded-full animate-spin" />
            <p className="text-sm text-[var(--color-secondary)]">Loading herbal collection…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-600 space-y-3">
            <p>{error}</p>
            <button onClick={handleClearFilters} className="btn-outline !py-2 !px-4 text-xs">
              Reload Catalog
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product._id || product.name} className="h-full">
                  <ProductCard product={product} onBuyClick={handleBuyClick} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-[var(--color-cream)] rounded-3xl border border-black/5 p-8 max-w-lg mx-auto">
                <span className="text-5xl block mb-3 animate-floatSlow">🌿</span>
                <h3 className="heading-font text-2xl text-[var(--color-primary)] font-bold mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {searchQuery
                    ? `We couldn't find any items matching "${searchQuery}". Try searching for Aloe, Neem, or Shikakai.`
                    : 'No products are currently available in this category.'}
                </p>
                <button onClick={handleClearFilters} className="btn-primary !py-2.5 !px-6 text-sm font-bold">
                  View All Products
                </button>
              </div>
            )}
          </div>
        )}
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