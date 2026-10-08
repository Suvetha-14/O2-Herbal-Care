import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { cartItems } = useCart()
  const { isLoggedIn, userInfo, handleLogout } = useAuth()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const userMenuRef = useRef(null)

  const linkClass = ({ isActive }) =>
    `leaf-underline px-1 py-2 text-sm font-medium tracking-wide text-[var(--color-gold)] hover:text-[var(--color-cream)] transition-colors ${
      isActive ? 'is-active text-[var(--color-cream)] font-bold' : ''
    }`

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    if (e.type === 'click' || e.key === 'Enter') {
      e.preventDefault()
      if (searchInput.trim()) {
        navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`)
        setSearchInput('')
        setMobileOpen(false)
      }
    }
  }

  const handleLogoutClick = () => {
    handleLogout()
    setShowUserMenu(false)
    navigate('/')
  }

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  return (
    <nav
      className={`sticky top-0 z-40 bg-[var(--color-primary)]/95 backdrop-blur-md text-white transition-all duration-300 ${
        isScrolled ? 'shadow-lift py-0' : 'shadow-none py-1'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="group flex items-center gap-2 text-[var(--color-gold)] heading-font text-2xl sm:text-3xl tracking-wide shrink-0"
            >
              <span className="inline-block transition-transform duration-500 group-hover:rotate-[18deg]">🌿</span>
              <span>O2 Herbal Care</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/" className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/products" className={linkClass}>
                Products
              </NavLink>
              <NavLink to="/about" className={linkClass}>
                About Us
              </NavLink>
              <NavLink to="/contact" className={linkClass}>
                Contact
              </NavLink>

              {/* Desktop Search Bar */}
              <div className="relative ml-2">
                <input
                  placeholder="Search herbs, soaps..."
                  className="bg-white/95 focus:bg-white px-4 py-1.5 rounded-full w-48 lg:w-56 outline-none text-black text-sm shadow-inner transition-all duration-300 focus:ring-2 focus:ring-[var(--color-gold)] pr-9"
                  name="search"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearch}
                />
                <button
                  onClick={handleSearch}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-500 hover:text-[var(--color-primary)] cursor-pointer"
                  type="button"
                  aria-label="Search products"
                >
                  <svg className="w-4 h-4" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" fill="none">
                    <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Action Icons (Cart, Account, Mobile Toggle) */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative text-[var(--color-gold)] hover:text-[var(--color-cream)] transition-all p-1.5"
              aria-label="Shopping Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center">
                  <span className="relative bg-[var(--color-gold)] text-[var(--color-ink)] text-[11px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                </span>
              )}
            </Link>

            {/* Auth Section */}
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-[var(--color-gold)] hover:text-[var(--color-cream)] transition-colors p-1"
                  aria-label="User account menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="font-semibold text-sm hidden sm:inline max-w-[120px] truncate">
                    {userInfo?.name || 'Account'}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-xl shadow-lift z-50 overflow-hidden animate-fadeUp origin-top-right border border-gray-100">
                    <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/25 rounded-full flex items-center justify-center font-bold">
                          {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{userInfo?.name}</p>
                          <p className="text-xs text-white/80 truncate">{userInfo?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/my-orders"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700 font-medium text-sm"
                      >
                        <span className="text-base">📦</span>
                        My Orders
                      </Link>
                    </div>
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600 font-semibold text-sm"
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary !bg-[var(--color-gold)] !text-[var(--color-ink)] hover:!bg-white !py-1.5 !px-4 text-xs font-bold shadow-sm"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              className="md:hidden text-white p-1.5 focus:outline-none"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-5 pt-2 flex flex-col gap-2 border-t border-white/10 animate-fadeUp">
            <NavLink
              to="/"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-[var(--color-gold)]"
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-[var(--color-gold)]"
            >
              All Products
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-[var(--color-gold)]"
            >
              About Us
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-[var(--color-gold)]"
            >
              Contact
            </NavLink>
            {isLoggedIn && (
              <NavLink
                to="/my-orders"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-[var(--color-gold)]"
              >
                My Orders
              </NavLink>
            )}

            {/* Mobile Search Input */}
            <div className="relative mt-2 px-1">
              <input
                placeholder="Search products..."
                className="bg-white px-4 py-2 rounded-full w-full outline-none text-black text-sm shadow-inner pr-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearch}
              />
              <button
                onClick={handleSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label="Submit search"
              >
                <svg className="w-4 h-4" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" fill="none">
                  <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
