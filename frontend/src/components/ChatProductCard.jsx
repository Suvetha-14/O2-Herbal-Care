import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function ChatProductCard({ product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    addToCart(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-w-[150px] max-w-[150px] bg-white rounded-lg border border-[var(--color-accent)] shadow-sm overflow-hidden flex-shrink-0">
      <Link to={`/products/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-20 object-cover"
        />
      </Link>
      <div className="p-2">
        <Link to={`/products/${product.id}`}>
          <h4 className="text-xs font-semibold text-[var(--color-primary)] leading-tight line-clamp-2">
            {product.name}
          </h4>
        </Link>
        <p className="text-sm font-bold text-[var(--color-secondary)] mt-1">₹{product.price}</p>
        <div className="flex flex-col gap-1 mt-2">
          <Link
            to={`/products/${product.id}`}
            className="text-[11px] text-center border border-[var(--color-primary)] text-[var(--color-primary)] rounded py-1 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
          >
            View Product
          </Link>
          <button
            onClick={handleAddToCart}
            className={`text-[11px] text-center rounded py-1 transition-colors ${
              added
                ? 'bg-green-600 text-white'
                : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]'
            }`}
          >
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
