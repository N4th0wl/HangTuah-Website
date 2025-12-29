import { useState } from 'react'
import { X, Check } from 'lucide-react'
import ReceiptModal from './ReceiptModal'
import '../styles/PaymentModal.css'

export default function PaymentModal({ order, onClose, onPaymentSuccess }) {
  const [step, setStep] = useState('method') // method, confirm, success
  const [selectedMethod, setSelectedMethod] = useState('qris')
  const [loading, setLoading] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)

  const subtotal = order?.subtotal ?? order?.sub_total ?? order?.totalPrice ?? order?.total_price ?? 0
  const taxAmount = order?.taxAmount ?? order?.tax_amount ?? 0
  const grandTotal = order?.totalPrice ?? order?.total_price ?? subtotal + taxAmount

  const handleConfirmPayment = async () => {
    try {
      setLoading(true)
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStep('success')
      // Call parent callback with payment method
      if (onPaymentSuccess) {
        onPaymentSuccess(selectedMethod)
      }
    } catch (error) {
      console.error('Payment error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        {/* Header */}
        <div className="payment-modal__header">
          <h2>Payment</h2>
          {step !== 'success' && (
            <button className="payment-modal__close" onClick={onClose}>
              <X size={24} />
            </button>
          )}
        </div>

        {/* Payment Method Selection */}
        {step === 'method' && (
          <div className="payment-modal__content">
            <div className="payment-methods">
              <h3>Select Payment Method</h3>

              <div className="payment-method-option">
                <input
                  type="radio"
                  id="qris"
                  name="payment-method"
                  value="qris"
                  checked={selectedMethod === 'qris'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                />
                <label htmlFor="qris" className="payment-method-label">
                  <div className="payment-method-content">
                    <div className="payment-method-icon">
                      <svg viewBox="0 0 100 100" width="60" height="60">
                        <rect x="10" y="10" width="30" height="30" fill="#d4af37" />
                        <rect x="60" y="10" width="30" height="30" fill="#d4af37" />
                        <rect x="10" y="60" width="30" height="30" fill="#d4af37" />
                        <rect x="60" y="60" width="30" height="30" fill="#d4af37" />
                        <rect x="25" y="25" width="10" height="10" fill="white" />
                        <rect x="75" y="25" width="10" height="10" fill="white" />
                        <rect x="25" y="75" width="10" height="10" fill="white" />
                      </svg>
                    </div>
                    <div className="payment-method-info">
                      <h4>QRIS</h4>
                      <p>Scan QR code to pay</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="payment-summary">
              <h3>Order Summary</h3>
              <div className="summary-item">
                <span>Subtotal:</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {(taxAmount ?? 0) > 0 && (
                <div className="summary-item">
                  <span>Tax:</span>
                  <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="summary-total">
                <span>Total:</span>
                <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="payment-modal__actions">
              <button className="btn btn--secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn--primary"
                onClick={() => setStep('confirm')}
                disabled={!selectedMethod}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Payment Confirmation */}
        {step === 'confirm' && (
          <div className="payment-modal__content">
            <div className="payment-confirmation">
              <div className="qr-code-container">
                <h3>Scan QR Code to Pay</h3>
                <div className="qr-code-placeholder">
                  <svg viewBox="0 0 200 200" width="200" height="200">
                    {/* QR Code Placeholder */}
                    <rect x="20" y="20" width="160" height="160" fill="white" stroke="#d4af37" strokeWidth="2" />
                    <rect x="30" y="30" width="40" height="40" fill="#d4af37" />
                    <rect x="130" y="30" width="40" height="40" fill="#d4af37" />
                    <rect x="30" y="130" width="40" height="40" fill="#d4af37" />
                    {/* Random pattern for QR */}
                    {Array.from({ length: 100 }).map((_, i) => (
                      <rect
                        key={i}
                        x={50 + (i % 10) * 10}
                        y={50 + Math.floor(i / 10) * 10}
                        width="8"
                        height="8"
                        fill={Math.random() > 0.5 ? '#d4af37' : 'white'}
                      />
                    ))}
                  </svg>
                </div>
                <p className="qr-code-amount">
                  Amount: Rp {grandTotal.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="payment-instructions">
                <h4>Payment Instructions:</h4>
                <ol>
                  <li>Open your mobile banking or e-wallet app</li>
                  <li>Select "Scan QR Code" option</li>
                  <li>Scan the QR code above</li>
                  <li>Confirm the payment amount</li>
                  <li>Complete the transaction</li>
                </ol>
              </div>

              <div className="payment-confirmation-actions">
                <button
                  className="btn btn--secondary"
                  onClick={() => setStep('method')}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  className="btn btn--primary"
                  onClick={handleConfirmPayment}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'I Have Paid'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success */}
        {step === 'success' && !showReceipt && (
          <div className="payment-modal__content">
            <div className="payment-success">
              <div className="success-icon">
                <Check size={64} />
              </div>
              <h3>Payment Successful!</h3>
              <p>Your order has been confirmed and will be prepared shortly.</p>

              <div className="success-details">
                <div className="detail-item">
                  <span>Order ID:</span>
                  <span className="detail-value">#{order?.id || 'Processing...'}</span>
                </div>
                <div className="detail-item">
                  <span>Amount Paid:</span>
                  <span className="detail-value">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="detail-item">
                  <span>Payment Method:</span>
                  <span className="detail-value">{selectedMethod.toUpperCase()}</span>
                </div>
              </div>

              <div className="success-actions">
                <button className="btn btn--secondary" onClick={() => setShowReceipt(true)}>
                  View Receipt
                </button>
                <button className="btn btn--primary" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <ReceiptModal
          order={order}
          onClose={() => setShowReceipt(false)}
          onBackToHome={onClose}
        />
      )}
    </div>
  )
}
