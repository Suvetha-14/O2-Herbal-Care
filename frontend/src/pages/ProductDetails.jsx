import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AddToCartModal from '../components/AddToCartModal'
import { useAuth } from '../context/AuthContext'
import { useToastNotification } from '../context/ToastContext'
import { getProducts, getProductById, addProductReview, deleteProductReview } from '../services/productApi'

const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f4f6f0"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="%232d6a4f">🌿</text><text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%2352796f">O2 Herbal Care</text></svg>'

function StarRating({ rating, onRatingChange, readonly = false }) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-lg ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          disabled={readonly}
        >
          <span className={`${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

function ReviewItem({ review, currentUser, onDelete }) {
  const isOwnerOrAdmin =
    currentUser &&
    (currentUser.role === 'admin' || (review.user && (review.user === currentUser.id || review.user._id === currentUser.id)))

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">{review.userName || review.name || 'Customer'}</span>
          <StarRating rating={review.rating} readonly />
        </div>
        {isOwnerOrAdmin && (
          <button
            onClick={() => onDelete(review._id)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Delete
          </button>
        )}
      </div>
      <p className="text-gray-700">{review.comment}</p>
      <span className="text-xs text-gray-500 mt-2 block">
        {new Date(review.createdAt || review.date || Date.now()).toLocaleDateString()}
      </span>
    </div>
  )
}

function ReviewForm({ product, onReviewSubmitted, isLoggedIn, onLoginRequired }) {
  const { userInfo } = useAuth()
  const [rating, setRating] = useState(0)
  const [name, setName] = useState(userInfo?.name || '')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userInfo?.name) {
      setName(userInfo.name)
    }
  }, [userInfo])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isLoggedIn) {
      onLoginRequired()
      return
    }

    if (rating === 0 || !comment.trim()) {
      setError('Please provide a star rating and review comment')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await addProductReview(product._id, {
        rating: Number(rating),
        comment: comment.trim(),
        userName: name.trim() || userInfo?.name || 'Customer',
      })

      setRating(0)
      setComment('')
      if (onReviewSubmitted) onReviewSubmitted()
    } catch (err) {
      setError(err.message || 'Failed to post review')
      console.error('Review error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      {!isLoggedIn && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Please <span className="font-semibold">log in</span> to post a review.
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Your Rating</label>
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[var(--color-primary)]"
          placeholder="Enter your name"
          disabled={!isLoggedIn || isSubmitting}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Your Review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[var(--color-primary)]"
          rows="4"
          placeholder="Share your experience with this product..."
          disabled={!isLoggedIn || isSubmitting}
          required
        />
      </div>

      <button
        type="submit"
        disabled={!isLoggedIn || isSubmitting}
        className="bg-[var(--color-primary)] text-white px-6 py-2 rounded hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Posting...' : 'Submit Review'}
      </button>
    </form>
  )
}

export default function ProductDetails() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, userInfo } = useAuth()
  const { success: toastSuccess, error: toastError } = useToastNotification()
  const [selectedImage, setSelectedImage] = useState(0)
  const [showAddToCart, setShowAddToCart] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProduct = async () => {
    try {
      setLoading(true)
      let prod = null
      try {
        const res = await getProductById(productId)
        prod = res.data.product
      } catch {
        // Search in list fallback if slug requested
        const res = await getProducts()
        const list = res.data.products || []
        const slugify = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        prod = list.find((p) => p._id === productId || slugify(p.name) === productId)
      }
      setProduct(prod || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const handleReviewDelete = async (reviewId) => {
    if (!product) return
    try {
      await deleteProductReview(product._id, reviewId)
      toastSuccess('Review deleted successfully')
      await fetchProduct()
    } catch (err) {
      toastError(err.message || 'Failed to delete review')
      console.error('Delete review error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-[var(--color-primary)] rounded-full animate-spin" />
            <p className="text-sm text-[var(--color-secondary)]">Loading product details…</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Product Not Found'}</h1>
            <button
              onClick={() => navigate('/products')}
              className="bg-[var(--color-primary)] text-white px-6 py-2 rounded hover:bg-[var(--color-secondary)] transition-colors"
            >
              Back to Products
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Phase 17: Genuine product images array
  const rawImages = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image].filter(Boolean)
  const productImages = rawImages.length > 0 ? rawImages : ['/SOAP/aloeverasoap.png']
  const reviewsList = product.reviews || []
  const averageRating = product.rating || 0

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto p-6 w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="mb-6 flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors text-sm font-semibold"
        >
          ← Back to Products
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl border bg-[var(--color-cream)]">
              <img
                src={productImages[selectedImage] || productImages[0]}
                alt={product.name}
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_IMAGE) {
                    e.currentTarget.src = FALLBACK_IMAGE
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${
                      selectedImage === index ? 'border-[var(--color-primary)] scale-105' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      onError={(e) => {
                        if (e.currentTarget.src !== FALLBACK_IMAGE) {
                          e.currentTarget.src = FALLBACK_IMAGE
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)]">
                  {product.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                </span>
              </div>
              <h1 className="heading-font text-3xl text-[var(--color-primary)] mb-3">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={Math.round(averageRating)} readonly />
                <span className="text-base font-bold text-gray-800">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({product.numReviews || reviewsList.length} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-[var(--color-primary)]">₹{product.price}</span>
                {typeof product.discountPrice === 'number' && product.discountPrice > product.price ? (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{product.discountPrice}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-semibold">
                      {Math.round(((product.discountPrice - product.price) / product.discountPrice) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                    100% Pure & Handmade
                  </span>
                )}
              </div>

              {/* Add to Cart */}
              <button
                onClick={() => setShowAddToCart(true)}
                disabled={product.stock === 0}
                className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
                  product.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] shadow-soft'
                }`}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* Description */}
            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">Description</h2>
              <p className="text-gray-700 leading-relaxed text-sm">{product.description}</p>
            </div>

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="border-t pt-4">
                <h2 className="text-lg font-semibold mb-2 text-gray-900">Key Ingredients</h2>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, index) => (
                    <span key={index} className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100">
                      🌿 {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">Customer Reviews</h2>

          {/* Review Summary */}
          <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center sm:text-left">
                <div className="text-4xl font-bold text-[var(--color-primary)] mb-1">{averageRating.toFixed(1)}</div>
                <StarRating rating={Math.round(averageRating)} readonly />
                <div className="text-xs text-gray-500 mt-1">{reviewsList.length} verified reviews</div>
              </div>
            </div>
          </div>

          {/* Individual Reviews List */}
          <div className="space-y-4 mb-8">
            {reviewsList.map((review) => (
              <ReviewItem
                key={review._id}
                review={review}
                currentUser={userInfo}
                onDelete={handleReviewDelete}
              />
            ))}
            {reviewsList.length === 0 && (
              <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
                No reviews yet. Be the first to review this product!
              </p>
            )}
          </div>

          {/* Review Form */}
          <ReviewForm
            product={product}
            onReviewSubmitted={fetchProduct}
            isLoggedIn={isLoggedIn}
            onLoginRequired={() => setShowLoginPrompt(true)}
          />

          {/* Login Prompt Modal */}
          {showLoginPrompt && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <h3 className="text-xl font-bold text-[var(--color-primary)] mb-3">Login Required</h3>
                <p className="text-gray-600 mb-6 text-sm">Please log in to post a review for this product.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigate('/login')
                      setShowLoginPrompt(false)
                    }}
                    className="flex-1 bg-[var(--color-primary)] text-white py-2 rounded-lg font-semibold hover:bg-[var(--color-secondary)] transition-colors text-sm"
                  >
                    Go to Login
                  </button>
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <AddToCartModal product={product} isOpen={showAddToCart} onClose={() => setShowAddToCart(false)} />

      <Footer />
    </div>
  )
}