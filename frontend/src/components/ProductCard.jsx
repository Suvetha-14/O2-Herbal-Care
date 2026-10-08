import { Link } from 'react-router-dom'

// Star Rating Component
function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-xs ${star <= rating ? 'text-[var(--color-gold)]' : 'text-gray-200'}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23f4f6f0"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="36" fill="%232d6a4f">🌿</text><text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2352796f">O2 Herbal Care</text></svg>'

export default function ProductCard({ product, onBuyClick }) {
  const pId = product._id || product.id
  const mainImage = product.image || (product.images && product.images[0]) || FALLBACK_IMAGE

  // Authentic pricing and discount computation
  const hasOriginalPrice = typeof product.discountPrice === 'number' && product.discountPrice > product.price
  const mrp = hasOriginalPrice ? product.discountPrice : Math.round(product.price * 1.15)
  const discountPct = hasOriginalPrice
    ? Math.round(((product.discountPrice - product.price) / product.discountPrice) * 100)
    : 0

  const reviewCount = product.numReviews || (Array.isArray(product.reviews) ? product.reviews.length : 0)

  return (
    <div className="card-surface group flex flex-col h-full overflow-hidden border border-gray-100 hover:border-[var(--color-accent)] transition-all duration-300">
      <Link to={`/products/${pId}`} className="relative block overflow-hidden bg-[var(--color-cream)]">
        {discountPct > 0 ? (
          <span className="badge-ribbon">{discountPct}% OFF</span>
        ) : (
          <span className="badge-ribbon !bg-[var(--color-primary)]/80">PURE HERBAL</span>
        )}
        <div className="aspect-square w-full overflow-hidden flex items-center justify-center">
          <img
            src={mainImage}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_IMAGE) {
                e.currentTarget.src = FALLBACK_IMAGE
              }
            }}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <div className="mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-secondary)]">
            {product.category || 'Herbal Care'}
          </span>
        </div>

        <Link to={`/products/${pId}`} className="block mb-2">
          <h3 className="heading-font text-base text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={Math.round(product.rating || 0)} />
          <span className="text-[11px] text-gray-500 font-medium">({reviewCount})</span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-[var(--color-ink)]">₹{product.price}</span>
            {hasOriginalPrice && (
              <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (onBuyClick) onBuyClick(product)
            }}
            disabled={product.stock === 0}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
              product.stock === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] hover:shadow-card active:scale-95'
            }`}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
