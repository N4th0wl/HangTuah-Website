import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react'
import { ordersAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import PaymentModal from '../components/PaymentModal'
import '../styles/Checkout.css'

export default function Checkout() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [tableNumber, setTableNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [pendingOrder, setPendingOrder] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (err) {
        console.error('Failed to load cart:', err)
      }
    }
  }, [navigate])

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId)
      return
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const handleRemoveItem = (itemId) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== itemId)
      if (updated.length === 0) {
        localStorage.removeItem('cart')
      } else {
        localStorage.setItem('cart', JSON.stringify(updated))
      }
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: updated.length } }))
      return updated
    })
  }

  useEffect(() => {
    if (cartItems.length === 0) {
      localStorage.removeItem('cart')
    } else {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
    window.dispatchEvent(
      new CustomEvent('cartUpdated', { detail: { count: cartItems.length } })
    )
  }, [cartItems])

  const handleClearCart = () => {
    setToast({
      message: 'Are you sure you want to clear your cart?',
      type: 'warning',
      showButtons: true,
      onYes: () => {
        setCartItems([])
        localStorage.removeItem('cart')
        setToast({ message: 'Cart cleared', type: 'success' })
      },
      onNo: () => {
        setToast(null)
      },
    })
  }

  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
    const taxAmount = Math.round(subtotal * 0.1)
    const grandTotal = subtotal + taxAmount

    return { subtotal, taxAmount, grandTotal }
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      setToast({ message: 'Your cart is empty', type: 'error' })
      return
    }

    if (!tableNumber) {
      setToast({ message: 'Please select a table number', type: 'error' })
      return
    }

    const { subtotal, taxAmount, grandTotal } = calculateTotals()

    // Store pending order and show payment modal
    const orderData = {
      items: cartItems.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
      taxAmount,
      totalPrice: grandTotal,
      tableNumber: parseInt(tableNumber),
      notes: notes.trim(),
    }

    setPendingOrder(orderData)
    setShowPayment(true)
  }

  const handlePaymentSuccess = async (paymentMethod) => {
    try {
      setLoading(true)

      // Store items before clearing cart
      const itemsData = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }))

      // Submit order to backend after payment confirmation with payment method
      const orderWithPayment = {
        ...pendingOrder,
        paymentMethod: paymentMethod || 'qris',
      }
      const response = await ordersAPI.create(orderWithPayment)

      // Clear cart and localStorage
      setCartItems([])
      localStorage.removeItem('cart')
      localStorage.removeItem('cartCount')

      // Update pending order with response data and items
      const updatedOrder = {
        ...response.data.data,
        items: itemsData,
        paymentMethod: paymentMethod || 'qris',
        table_number: pendingOrder.tableNumber,
        notes: pendingOrder.notes,
        subtotal: pendingOrder.subtotal,
        taxAmount: pendingOrder.taxAmount,
      }
      setPendingOrder(updatedOrder)

      // Keep payment modal open to show receipt
      setToast({ message: 'Order placed successfully!', type: 'success' })
    } catch (err) {
      setToast({
        message: err.response?.data?.error || 'Failed to place order',
        type: 'error',
      })
      setShowPayment(false)
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, taxAmount, grandTotal } = calculateTotals()

  return (
    <>
      <Navbar />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          showButtons={toast.showButtons}
          onYes={toast.onYes}
          onNo={toast.onNo}
        />
      )}
      {showPayment && pendingOrder && (
        <PaymentModal
          order={pendingOrder}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      <div className="checkout-container">
        <button className="checkout-back-btn" onClick={() => navigate('/menu')}>
          <ArrowLeft size={20} />
          Back to Menu
        </button>

        <div className="checkout-content">
          {/* Cart Items */}
          <div className="checkout-section">
            <h2 className="checkout-section__title">
              <ShoppingCart size={24} />
              Your Cart
            </h2>

            {cartItems.length === 0 ? (
              <div className="checkout-empty">
                <p>Your cart is empty</p>
                <button className="btn btn--primary" onClick={() => navigate('/menu')}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="checkout-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="checkout-item">
                      <div className="checkout-item__info">
                        <h4 className="checkout-item__name">{item.name}</h4>
                        <p className="checkout-item__price">
                          Rp {item.price.toLocaleString('id-ID')} each
                        </p>
                      </div>

                      <div className="checkout-item__controls">
                        <button
                          className="checkout-item__btn"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          title="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="checkout-item__quantity">{item.quantity}</span>
                        <button
                          className="checkout-item__btn"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          title="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="checkout-item__subtotal">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </div>

                      <button
                        className="checkout-item__delete"
                        onClick={() => handleRemoveItem(item.id)}
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button className="checkout-clear-btn" onClick={handleClearCart}>
                  Clear Cart
                </button>
              </>
            )}
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="checkout-section">
              <h2 className="checkout-section__title">Order Summary</h2>

              <form onSubmit={handleSubmitOrder} className="checkout-form">
                <div className="form-group">
                  <label htmlFor="tableNumber">Table Number *</label>
                  <select
                    id="tableNumber"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    required
                  >
                    <option value="">Select a table...</option>
                    {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        Table {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Special Notes (Optional)</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special requests or notes..."
                    rows="4"
                  />
                </div>

                <div className="checkout-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (10%):</span>
                    <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="summary-row summary-row--total">
                    <span>Total:</span>
                    <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn--primary btn--lg checkout-submit-btn"
                  disabled={loading || cartItems.length === 0}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
