import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, ShoppingCart } from 'lucide-react'
import { menuAPI, API_ROOT_URL } from '../services/api'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import '../styles/Menu.css'

export default function Menu() {
  const navigate = useNavigate()
  const [filteredItems, setFilteredItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [toast, setToast] = useState(null)

  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Menu' },
  ])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await menuAPI.getCategories()
        const allCategories = [{ id: 'all', name: 'All Menu' }, ...response.data.data]
        setCategories(allCategories)
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }

    fetchCategories()
  }, [])

  // Fetch menu from backend
  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true)
      setError('')
      try {
        const params = {}
        if (selectedCategory !== 'all') {
          params.category = selectedCategory
        }
        if (searchQuery.trim()) {
          params.search = searchQuery
        }

        const response = await menuAPI.getAll(params)
        setFilteredItems(response.data.data)
      } catch (err) {
        console.error('Failed to fetch menu:', err)
        setError('Failed to load menu items')
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchMenu()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [selectedCategory, searchQuery])


  // Load cart on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart)
        setCartCount(cart.length)
      } catch (err) {
        console.error('Failed to load cart:', err)
      }
    }
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleOrderClick = (item) => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    // Add item to cart
    const savedCart = localStorage.getItem('cart')
    let cart = []
    if (savedCart) {
      try {
        cart = JSON.parse(savedCart)
      } catch (err) {
        console.error('Failed to parse cart:', err)
      }
    }

    // Check if item already in cart
    const existingItem = cart.find((cartItem) => cartItem.id === item.id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
      })
    }

    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart))
    setCartCount(cart.length)

    // Show toast notification
    setToast({
      message: `${item.name} added to cart!`,
      type: 'success',
    })
  }

  return (
    <>
      <Navbar />
      <div className="menu-container">
        <div className="menu__background" aria-hidden="true" />
        <div className="menu__motif menu__motif--left" aria-hidden="true" />
        <div className="menu__motif menu__motif--right" aria-hidden="true" />

        <div className="menu__content">
        {/* Header */}
        <div className="menu__header">
          <h1 className="menu__title">Our Menu</h1>
          <p className="menu__subtitle">Discover our delicious South East Asian cuisine</p>
        </div>

        {/* Search Bar with Cart Button */}
        <div className="menu__search-wrapper">
          <div className="menu__search">
            <Search size={20} className="menu__search-icon" />
            <input
              type="text"
              className="menu__search-input"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {cartCount > 0 && (
            <button
              className="menu__cart-btn"
              onClick={() => navigate('/checkout')}
              title={`View cart (${cartCount} items)`}
            >
              <ShoppingCart size={20} />
              <span className="menu__cart-count">{cartCount}</span>
            </button>
          )}
        </div>

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Category Filter */}
        <div className="menu__categories">
          <div className="menu__filter-label">
            <Filter size={18} />
            <span>Filter by Category</span>
          </div>
          <div className="menu__category-buttons">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`menu__category-btn ${selectedCategory === category.id ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="menu__category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="menu__loading">
            <div className="menu__spinner" />
            <p>Loading menu...</p>
          </div>
        ) : error ? (
          <div className="menu__empty">
            <p>{error}</p>
            <p className="menu__empty-subtitle">Please try again later</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="menu__grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu__card reveal">
                <div className="menu__card-image">
                  {item.image ? (
                    <img src={`${API_ROOT_URL}${item.image}?v=${item.updated_at || item.created_at}`} alt={item.name} />
                  ) : (
                    <div className="menu__card-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="menu__card-content">
                  <h3 className="menu__card-title">{item.name}</h3>
                  <p className="menu__card-description">{item.description}</p>
                  <div className="menu__card-footer">
                    <span className="menu__card-price">{formatPrice(item.price)}</span>
                    <button
                      className="menu__card-btn"
                      onClick={() => handleOrderClick(item)}
                      title="Add to cart and checkout"
                    >
                      <ShoppingCart size={16} />
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="menu__empty">
            <p>No menu items found</p>
            <p className="menu__empty-subtitle">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
      </div>
    </>
  )
}
