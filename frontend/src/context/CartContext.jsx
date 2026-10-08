import { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import cartApi from '../services/cartApi'

const CartContext = createContext()

export function calculateCartSummary(items = []) {
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price || item.product?.price || 0)
    const qty = Number(item.quantity || 0)
    return sum + price * qty
  }, 0)

  let discount = 0
  if (subtotal >= 2000) discount = 200
  else if (subtotal >= 1500) discount = 150
  else if (subtotal >= 1000) discount = 100
  else if (subtotal >= 500) discount = 50

  // Free shipping on ₹500 and above; ₹50 below ₹500
  const shipping = subtotal >= 500 || subtotal === 0 ? 0 : 50
  const tax = 0
  const total = Math.max(0, subtotal - discount + shipping + tax)

  return { subtotal, discount, shipping, tax, total }
}

export function CartProvider({ children }) {
  const { isLoggedIn, handleLogout } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Standardize server cart items to consistent client shape
  const mapServerItems = (serverItems = []) => {
    return serverItems.map((item) => {
      const p = item.product || {}
      return {
        _id: p._id || item.product || item._id,
        name: p.name || item.productName || 'Product',
        price: Number(item.price ?? p.price ?? 0),
        image: p.image || (p.images && p.images[0]) || item.image || '',
        category: p.category || item.category || 'Herbal Care',
        stock: typeof p.stock === 'number' ? p.stock : 99,
        quantity: Number(item.quantity || 1),
      }
    })
  }

  // Load guest cart from localStorage
  const loadGuestCart = () => {
    const saved = localStorage.getItem('guestCart')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      } catch (e) {
        console.error('Failed to parse guest cart:', e)
      }
    }
    return []
  }

  // Save guest cart to localStorage and state
  const saveGuestCart = (items) => {
    setCartItems(items)
    localStorage.setItem('guestCart', JSON.stringify(items))
  }

  // Fetch cart
  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token')

    if (isLoggedIn && token) {
      try {
        setLoading(true)

        // Check if there are guest items to merge upon login
        const guestItems = loadGuestCart()
        if (guestItems.length > 0) {
          try {
            const mergeRes = await cartApi.mergeGuestCart(guestItems)
            if (mergeRes.data?.success) {
              localStorage.removeItem('guestCart')
              setCartItems(mapServerItems(mergeRes.data.cart?.items))
              return
            }
          } catch (mergeErr) {
            console.warn('Guest cart merge notice:', mergeErr.message)
          }
        }

        // Fetch user cart from server
        const response = await cartApi.getCart()
        if (response.data?.success) {
          setCartItems(mapServerItems(response.data.cart?.items))
        }
      } catch (err) {
        console.warn('Cart fetch failed:', err.message)
        // If unauthorized/expired token, revert gracefully to guest cart
        if (err.message && (err.message.includes('authorized') || err.message.includes('401'))) {
          if (handleLogout) handleLogout()
          setCartItems(loadGuestCart())
        } else {
          setCartItems(loadGuestCart())
        }
      } finally {
        setLoading(false)
      }
    } else {
      // Guest cart
      setCartItems(loadGuestCart())
      setLoading(false)
    }
  }, [isLoggedIn, handleLogout])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (product, quantity = 1) => {
    const pId = product._id || product.id
    if (!pId) {
      console.error('Cannot add product without canonical ID:', product)
      throw new Error('Product identifier missing')
    }

    const token = localStorage.getItem('token')

    if (isLoggedIn && token) {
      try {
        const res = await cartApi.addToCart(pId, quantity)
        if (res.data?.success) {
          setCartItems(mapServerItems(res.data.cart?.items))
          return { success: true }
        } else {
          throw new Error(res.data?.message || 'Failed to add item')
        }
      } catch (err) {
        // If token expired or unauthorized, seamlessly fall back to local guest cart
        if (err.message && (err.message.includes('authorized') || err.message.includes('401'))) {
          if (handleLogout) handleLogout()
          // Fall through to guest cart below
        } else {
          throw err
        }
      }
    }

    // Guest cart fallback logic (guaranteed never to fail on auth)
    const currentGuest = loadGuestCart()
    const existingIndex = currentGuest.findIndex((item) => (item._id || item.id) === pId)
    let updated
    if (existingIndex > -1) {
      updated = currentGuest.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      )
    } else {
      updated = [
        ...currentGuest,
        {
          _id: pId,
          name: product.name,
          price: Number(product.price || 0),
          image: product.image || (product.images && product.images[0]) || '',
          category: product.category || 'Herbal Care',
          stock: typeof product.stock === 'number' ? product.stock : 99,
          quantity,
        },
      ]
    }
    saveGuestCart(updated)
    return { success: true }
  }

  const removeFromCart = async (productId) => {
    const token = localStorage.getItem('token')
    if (isLoggedIn && token) {
      try {
        const res = await cartApi.removeCartItem(productId)
        if (res.data?.success) {
          setCartItems(mapServerItems(res.data.cart?.items))
          return
        }
      } catch (err) {
        console.warn('Remove cart API notice:', err.message)
      }
    }

    // Guest cart
    const current = loadGuestCart()
    const updated = current.filter((item) => (item._id || item.id) !== productId)
    saveGuestCart(updated)
  }

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId)
      return
    }

    const token = localStorage.getItem('token')
    if (isLoggedIn && token) {
      try {
        const res = await cartApi.updateCartItem(productId, quantity)
        if (res.data?.success) {
          setCartItems(mapServerItems(res.data.cart?.items))
          return
        }
      } catch (err)
        {
        console.warn('Update quantity API notice:', err.message)
      }
    }

    // Guest cart
    const current = loadGuestCart()
    const updated = current.map((item) =>
      (item._id || item.id) === productId ? { ...item, quantity } : item
    )
    saveGuestCart(updated)
  }

  const clearCart = async () => {
    const token = localStorage.getItem('token')
    if (isLoggedIn && token) {
      try {
        await cartApi.clearCart()
        setCartItems([])
        return
      } catch (err) {
        console.warn('Clear cart API notice:', err.message)
      }
    }
    saveGuestCart([])
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0)
  }

  const summary = calculateCartSummary(cartItems)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        summary,
        refetchCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
