import { useState } from 'react'
import { X, Download, Home } from 'lucide-react'
import { jsPDF } from 'jspdf'
import logo from '../assets/logo.png'
import '../styles/ReceiptModal.css'

export default function ReceiptModal({ order, onClose, onBackToHome }) {
  const [loading, setLoading] = useState(false)

  // Safe data extraction with defaults
  const totalPrice = order?.total_price || order?.totalPrice || 0
  const taxAmount = Math.round(totalPrice * 0.1)
  const grandTotal = totalPrice + taxAmount

  const generateReceiptPDF = async () => {
    try {
      setLoading(true)

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 15

      // Add background
      pdf.setFillColor(245, 245, 245)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')

      // Add header with logo
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pageWidth, 50, 'F')

      try {
        pdf.addImage(logo, 'PNG', pageWidth / 2 - 12, 5, 24, 24)
      } catch {
        console.log('Logo not available')
      }

      yPosition = 32
      pdf.setFontSize(22)
      pdf.setTextColor(212, 175, 55)
      pdf.setFont(undefined, 'bold')
      pdf.text('HANG TUAH', pageWidth / 2, yPosition, { align: 'center' })

      yPosition += 6
      pdf.setFontSize(9)
      pdf.setTextColor(100, 100, 100)
      pdf.setFont(undefined, 'normal')
      pdf.text('SOUTH EAST ASIA CUISINE', pageWidth / 2, yPosition, { align: 'center' })

      yPosition += 8
      pdf.setDrawColor(212, 175, 55)
      pdf.setLineWidth(0.5)
      pdf.line(10, yPosition, pageWidth - 10, yPosition)

      yPosition += 8

      // Receipt title
      pdf.setFontSize(16)
      pdf.setTextColor(50, 50, 50)
      pdf.setFont(undefined, 'bold')
      pdf.text('PAYMENT RECEIPT', pageWidth / 2, yPosition, { align: 'center' })

      yPosition += 10

      // Receipt details box
      pdf.setFillColor(240, 248, 255)
      pdf.rect(10, yPosition, pageWidth - 20, 50, 'F')

      yPosition += 4
      pdf.setFontSize(10)
      pdf.setTextColor(50, 50, 50)
      pdf.setFont(undefined, 'bold')

      pdf.text('RECEIPT DETAILS', 12, yPosition)

      yPosition += 7
      pdf.setFontSize(9)
      pdf.setFont(undefined, 'normal')

      // Receipt info
      const receiptInfo = [
        { label: 'Receipt Number:', value: `#${order?.id || 'N/A'}` },
        { label: 'Date & Time:', value: order?.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) : 'N/A' },
        { label: 'Table Number:', value: `Table ${order?.table_number || 'N/A'}` },
        { label: 'Payment Method:', value: order?.paymentMethod?.toUpperCase() || order?.payment_method?.toUpperCase() || 'QRIS' },
        { label: 'Payment Status:', value: order?.paymentStatus?.toUpperCase() || order?.payment_status?.toUpperCase() || 'PAID' },
      ]

      receiptInfo.forEach((info) => {
        pdf.text(info.label, 12, yPosition)
        pdf.text(info.value, pageWidth - 12, yPosition, { align: 'right' })
        yPosition += 5
      })

      yPosition += 8

      // Items table header
      pdf.setFillColor(212, 175, 55)
      pdf.rect(10, yPosition - 3, pageWidth - 20, 5, 'F')
      pdf.setFontSize(9)
      pdf.setTextColor(255, 255, 255)
      pdf.setFont(undefined, 'bold')
      pdf.text('Item', 12, yPosition)
      pdf.text('Qty', pageWidth - 50, yPosition)
      pdf.text('Price', pageWidth - 30, yPosition)

      yPosition += 6
      pdf.setFont(undefined, 'normal')

      // Items
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, itemIndex) => {
          const itemName = item.name || 'Unknown Item'
          const qty = item.quantity || 1
          const price = item.price || 0
          const subtotal = price * qty

          // Alternate row background
          if (itemIndex % 2 === 0) {
            pdf.setFillColor(248, 248, 248)
            pdf.rect(10, yPosition - 3, pageWidth - 20, 5, 'F')
          }

          pdf.setFontSize(8)
          pdf.setTextColor(50, 50, 50)
          pdf.text(itemName, 12, yPosition)
          pdf.text(`x${qty}`, pageWidth - 50, yPosition)
          pdf.text(`Rp ${subtotal.toLocaleString('id-ID')}`, pageWidth - 30, yPosition)

          yPosition += 5
        })
      }

      // Total section
      yPosition += 3
      pdf.setDrawColor(212, 175, 55)
      pdf.setLineWidth(0.8)
      pdf.line(10, yPosition, pageWidth - 10, yPosition)

      yPosition += 6
      pdf.setFillColor(250, 250, 250)
      pdf.rect(10, yPosition - 4, pageWidth - 20, 6, 'F')

      pdf.setFontSize(11)
      pdf.setTextColor(212, 175, 55)
      pdf.setFont(undefined, 'bold')
      pdf.text('TOTAL:', 12, yPosition)

      pdf.text(`Rp ${totalPrice.toLocaleString('id-ID')}`, pageWidth - 30, yPosition)

      // Footer
      yPosition = pageHeight - 20
      pdf.setFillColor(245, 245, 245)
      pdf.rect(0, yPosition - 5, pageWidth, 25, 'F')

      yPosition += 2
      pdf.setFontSize(10)
      pdf.setTextColor(212, 175, 55)
      pdf.setFont(undefined, 'bold')
      pdf.text('Thank you for your order!', pageWidth / 2, yPosition, { align: 'center' })

      yPosition += 5
      pdf.setFontSize(9)
      pdf.setTextColor(100, 100, 100)
      pdf.setFont(undefined, 'normal')
      pdf.text('www.hangtuah.com', pageWidth / 2, yPosition, { align: 'center' })

      // Save PDF
      const filename = `Receipt-${order?.id || 'receipt'}.pdf`
      pdf.save(filename)
    } catch (error) {
      console.error('PDF generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="receipt-modal-overlay">
      <div className="receipt-modal">
        {/* Header */}
        <div className="receipt-modal__header">
          <h2>Payment Receipt</h2>
          <button className="receipt-modal__close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="receipt-modal__content">
          {/* Logo and Restaurant Info */}
          <div className="receipt-header">
            <img src={logo} alt="Hang Tuah Logo" className="receipt-logo" />
            <h3>HANG TUAH</h3>
            <p>SOUTH EAST ASIA CUISINE</p>
          </div>

        {/* Receipt Number and Date */}
        <div className="receipt-info">
          <div className="info-row">
            <span className="info-label">Receipt Number:</span>
            <span className="info-value">#{order?.id || order?.orderId || 'Pending'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Date & Time:</span>
            <span className="info-value">
              {order?.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'N/A'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Table Number:</span>
            <span className="info-value">Table {order?.table_number || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Payment Method:</span>
            <span className="info-value">{order?.paymentMethod?.toUpperCase() || order?.payment_method?.toUpperCase() || 'QRIS'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Payment Status:</span>
            <span className="info-value payment-status-paid">
              {order?.paymentStatus?.toUpperCase() || order?.payment_status?.toUpperCase() || 'PAID'}
            </span>
          </div>
        </div>

          {/* Items */}
          <div className="receipt-items">
            <h4>Order Items</h4>
            <div className="items-table">
              <div className="table-header">
                <div className="col-item">Item</div>
                <div className="col-qty">Qty</div>
                <div className="col-price">Price</div>
              </div>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="table-row">
                    <div className="col-item">{item.name}</div>
                    <div className="col-qty">x{item.quantity}</div>
                    <div className="col-price">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-row">
                  <div className="col-item">No items</div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="receipt-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%):</span>
              <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total Amount Paid:</span>
              <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="receipt-notes">
              <h4>Special Notes</h4>
              <p>{order.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="receipt-actions">
            <button
              className="btn btn--secondary"
              onClick={generateReceiptPDF}
              disabled={loading}
            >
              <Download size={18} />
              {loading ? 'Generating...' : 'Download PDF'}
            </button>
            <button className="btn btn--primary" onClick={onBackToHome}>
              <Home size={18} />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
