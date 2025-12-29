import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Mail, User, AlertCircle, CheckCircle, X, Download } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { userAPI, ordersAPI } from '../services/api'
import Navbar from '../components/Navbar'
import logo from '../assets/logo.png'
import '../styles/Profile.css'

// Password strength calculator
const calculatePasswordStrength = (password) => {
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*]/.test(password)) strength++
  return strength
}

const getPasswordStrengthLabel = (strength) => {
  if (strength === 0) return 'Very Weak'
  if (strength === 1) return 'Weak'
  if (strength === 2) return 'Fair'
  if (strength === 3) return 'Good'
  if (strength === 4) return 'Strong'
  return 'Very Strong'
}

const getPasswordStrengthColor = (strength) => {
  if (strength === 0 || strength === 1) return '#dc2626'
  if (strength === 2) return '#f59e0b'
  if (strength === 3) return '#eab308'
  if (strength === 4) return '#84cc16'
  return '#22c55e'
}

// Toast component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast toast--${type}`}>
      <div className="toast__content">
        {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span>{message}</span>
      </div>
      <button className="toast__close" onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  // Edit form state
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordVerification, setPasswordVerification] = useState({
    showVerify: false,
    password: '',
    loading: false,
  })

  // Fetch profile and orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Check if user is logged in
        const token = localStorage.getItem('token')
        if (!token) {
          navigate('/login')
          return
        }

        // Fetch profile
        const profileRes = await userAPI.getProfile()
        setProfile(profileRes.data.data)
        setFormData({
          username: profileRes.data.data.username,
          email: profileRes.data.data.email,
          newPassword: '',
          confirmPassword: '',
        })

        // Fetch orders
        const ordersRes = await ordersAPI.getAll()
        setOrders(ordersRes.data.data || [])
      } catch (err) {
        console.error('Fetch error:', err)
        if (err.response?.status === 401) {
          navigate('/login')
        } else {
          const errorMsg = err.response?.data?.error || 'Failed to load profile'
          setToast({ message: errorMsg, type: 'error' })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Update password strength when password changes
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const handleVerifyPassword = async (e) => {
    e.preventDefault()
    try {
      setPasswordVerification((prev) => ({ ...prev, loading: true }))

      await userAPI.verifyPassword({ password: passwordVerification.password })

      // Password verified, now update profile
      await handleUpdateProfile()
      setPasswordVerification({
        showVerify: false,
        password: '',
        loading: false,
      })
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Password verification failed'
      setToast({ message: errorMsg, type: 'error' })
      setPasswordVerification((prev) => ({ ...prev, loading: false }))
    }
  }

  const handleUpdateProfile = async () => {
    try {
      // Validate form
      if (!formData.username || !formData.email) {
        setToast({ message: 'Username and email are required', type: 'error' })
        return
      }

      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setToast({ message: 'Passwords do not match', type: 'error' })
        return
      }

      if (formData.newPassword && formData.newPassword.length < 8) {
        setToast({ message: 'Password must be at least 8 characters', type: 'error' })
        return
      }

      const updateData = {
        username: formData.username,
        email: formData.email,
      }

      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword
      }

      const response = await userAPI.updateProfile(updateData)

      setToast({ message: 'Profile updated successfully!', type: 'success' })
      setProfile(response.data.data)
      setIsEditing(false)
      setFormData((prev) => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
      }))
      setPasswordStrength(0)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile'
      setToast({ message: errorMsg, type: 'error' })
    }
  }

  const handleSubmitEdit = (e) => {
    e.preventDefault()

    // If password is being changed, require verification
    if (formData.newPassword) {
      setPasswordVerification((prev) => ({ ...prev, showVerify: true }))
    } else {
      handleUpdateProfile()
    }
  }

  const generateAllOrdersPDF = async () => {
    try {
      setGeneratingPDF(true)

      if (orders.length === 0) {
        setToast({ message: 'No orders to print', type: 'warning' })
        return
      }

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 15

      // Function to add header with logo
      const addHeader = () => {
        // Add background rectangle for header
        pdf.setFillColor(245, 245, 245)
        pdf.rect(0, 0, pageWidth, 45, 'F')

        // Add logo image
        try {
          pdf.addImage(logo, 'PNG', pageWidth / 2 - 12, 5, 24, 24)
        } catch {
          console.log('Logo not available, using text only')
        }

        yPosition = 32
        pdf.setFontSize(22)
        pdf.setTextColor(212, 175, 55) // Gold color
        pdf.setFont(undefined, 'bold')
        pdf.text('HANG TUAH', pageWidth / 2, yPosition, { align: 'center' })

        yPosition += 6
        pdf.setFontSize(9)
        pdf.setTextColor(100, 100, 100)
        pdf.setFont(undefined, 'normal')
        pdf.text('SOUTH EAST ASIA CUISINE', pageWidth / 2, yPosition, { align: 'center' })

        // Decorative divider line
        yPosition += 7
        pdf.setDrawColor(212, 175, 55)
        pdf.setLineWidth(0.5)
        pdf.line(10, yPosition, pageWidth - 10, yPosition)

        yPosition += 8
      }

      // Add initial header
      addHeader()

      // Add title
      pdf.setFontSize(18)
      pdf.setTextColor(50, 50, 50)
      pdf.setFont(undefined, 'bold')
      pdf.text('ORDER HISTORY REPORT', pageWidth / 2, yPosition, { align: 'center' })

      yPosition += 8
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.setFont(undefined, 'normal')
      pdf.text(`Customer: ${profile.username}`, pageWidth / 2, yPosition, { align: 'center' })

      yPosition += 5
      pdf.setFontSize(9)
      const reportDate = new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      pdf.text(`Generated: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' })

      yPosition += 10

      // Add summary box
      pdf.setFillColor(240, 248, 255)
      pdf.rect(10, yPosition, pageWidth - 20, 12, 'F')
      pdf.setFontSize(9)
      pdf.setTextColor(50, 50, 50)
      pdf.setFont(undefined, 'bold')
      pdf.text(`Total Orders: ${orders.length}`, 15, yPosition + 4)
      
      const totalAmount = orders.reduce((sum, order) => sum + order.total_price, 0)
      pdf.text(`Total Amount: Rp ${totalAmount.toLocaleString('id-ID')}`, 15, yPosition + 8)
      
      pdf.setFont(undefined, 'normal')
      yPosition += 15

      // Process each order
      orders.forEach((order, orderIndex) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage()
          addHeader()
        }

        // Order card background
        pdf.setFillColor(250, 250, 250)
        pdf.rect(10, yPosition - 2, pageWidth - 20, 2, 'F')

        // Order header with background
        pdf.setFillColor(235, 235, 235)
        pdf.rect(10, yPosition, pageWidth - 20, 8, 'F')
        
        pdf.setFontSize(12)
        pdf.setTextColor(212, 175, 55)
        pdf.setFont(undefined, 'bold')
        pdf.text(`Order #${order.id}`, 12, yPosition + 5)

        const orderDate = new Date(order.created_at).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        
        // Status badge
        const statusColor = order.status === 'pending' ? [255, 193, 7] : order.status === 'completed' ? [76, 175, 80] : [244, 67, 54]
        pdf.setFillColor(...statusColor)
        pdf.rect(pageWidth - 50, yPosition + 1, 38, 6, 'F')
        pdf.setFontSize(8)
        pdf.setTextColor(255, 255, 255)
        pdf.setFont(undefined, 'bold')
        pdf.text(order.status.toUpperCase(), pageWidth - 32, yPosition + 4, { align: 'center' })

        yPosition += 10
        pdf.setFontSize(9)
        pdf.setTextColor(50, 50, 50)
        pdf.setFont(undefined, 'normal')
        pdf.text(`Date: ${orderDate}`, 12, yPosition)

        if (order.table_number) {
          yPosition += 5
          pdf.text(`Table: ${order.table_number}`, 12, yPosition)
        }

        yPosition += 7

        // Items table header with better styling
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
            if (yPosition > pageHeight - 20) {
              pdf.addPage()
              addHeader()
            }

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

        // Order total section
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
        pdf.text(`Rp ${order.total_price.toLocaleString('id-ID')}`, pageWidth - 30, yPosition)

        // Notes
        if (order.notes) {
          yPosition += 7
          pdf.setFillColor(255, 250, 205)
          pdf.rect(10, yPosition - 3, pageWidth - 20, 2, 'F')
          
          pdf.setFontSize(9)
          pdf.setTextColor(50, 50, 50)
          pdf.setFont(undefined, 'bold')
          pdf.text('Notes:', 12, yPosition)
          
          yPosition += 4
          pdf.setFontSize(8)
          pdf.setFont(undefined, 'normal')
          const noteLines = pdf.splitTextToSize(order.notes, pageWidth - 24)
          pdf.text(noteLines, 12, yPosition)
          yPosition += noteLines.length * 4
        }

        yPosition += 6

        // Separator between orders
        if (orderIndex < orders.length - 1) {
          pdf.setDrawColor(212, 175, 55)
          pdf.setLineWidth(0.3)
          pdf.setLineDash([3, 2])
          pdf.line(10, yPosition, pageWidth - 10, yPosition)
          pdf.setLineDash([])
          yPosition += 8
        }
      })

      // Final footer with background
      pdf.setFillColor(245, 245, 245)
      pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F')
      
      yPosition = pageHeight - 14
      pdf.setFontSize(10)
      pdf.setTextColor(212, 175, 55)
      pdf.setFont(undefined, 'bold')
      pdf.text('Thank you for your orders!', pageWidth / 2, yPosition, { align: 'center' })
      
      yPosition += 5
      pdf.setFontSize(9)
      pdf.setTextColor(100, 100, 100)
      pdf.setFont(undefined, 'normal')
      pdf.text('www.hangtuah.com', pageWidth / 2, yPosition, { align: 'center' })

      // Save PDF with username
      const filename = `OrderReport - ${profile.username}.pdf`
      pdf.save(filename)
      setToast({ message: 'Order history PDF downloaded successfully!', type: 'success' })
    } catch (error) {
      console.error('PDF generation error:', error)
      setToast({ message: 'Failed to generate PDF', type: 'error' })
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-container">
          <div className="loading">Loading profile...</div>
        </div>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="profile-container">
          <div className="error-message">Failed to load profile</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="profile-container">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <div className="profile-content">
          {/* Profile Section */}
          <div className="profile-section">
            <h1 className="section-title">My Profile</h1>

            {!isEditing ? (
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">
                    <User size={18} />
                    Username
                  </span>
                  <span className="info-value">{profile.username}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">
                    <Mail size={18} />
                    Email
                  </span>
                  <span className="info-value">{profile.email}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">
                    {new Date(profile.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <button className="btn btn--primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              </div>
            ) : (
              <form className="profile-form" onSubmit={handleSubmitEdit}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password (optional)</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current password"
                  />
                  {formData.newPassword && (
                    <>
                      <div className="password-strength-meter">
                        <div className="strength-bar">
                          <div
                            className="strength-fill"
                            style={{
                              width: `${(passwordStrength / 5) * 100}%`,
                              backgroundColor: getPasswordStrengthColor(passwordStrength),
                            }}
                          />
                        </div>
                        <span className="strength-label">
                          Strength: {getPasswordStrengthLabel(passwordStrength)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {formData.newPassword && (
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      required
                    />
                    {formData.confirmPassword && (
                      <small className="form-hint">
                        {formData.newPassword === formData.confirmPassword
                          ? '✓ Passwords match'
                          : '❌ Passwords do not match'}
                      </small>
                    )}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={passwordVerification.showVerify}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        username: profile.username,
                        email: profile.email,
                        newPassword: '',
                        confirmPassword: '',
                      })
                      setPasswordStrength(0)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Password Verification Modal */}
            {passwordVerification.showVerify && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Verify Your Password</h3>
                  <p>Please enter your current password to confirm changes</p>

                  <form onSubmit={handleVerifyPassword}>
                    <div className="form-group">
                      <label htmlFor="verifyPassword">Current Password</label>
                      <input
                        type="password"
                        id="verifyPassword"
                        value={passwordVerification.password}
                        onChange={(e) =>
                          setPasswordVerification((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder="Enter your current password"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="modal-actions">
                      <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={passwordVerification.loading}
                      >
                        {passwordVerification.loading ? 'Verifying...' : 'Verify & Save'}
                      </button>
                      <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={() =>
                          setPasswordVerification({
                            showVerify: false,
                            password: '',
                            loading: false,
                          })
                        }
                        disabled={passwordVerification.loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Orders History Section */}
          <div className="orders-section">
            <div className="orders-header">
              <h2 className="section-title">Order History</h2>
              {orders.length > 0 && (
                <button
                  className="btn btn--secondary"
                  onClick={generateAllOrdersPDF}
                  disabled={generatingPDF}
                  title="Download all orders as PDF"
                >
                  <Download size={16} />
                  {generatingPDF ? 'Generating...' : 'Print All Orders'}
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="empty-state">
                <p>No orders yet</p>
                <div className="empty-state__button-wrapper">
                  <button className="btn btn--primary" onClick={() => navigate('/menu')}>
                    Start Ordering
                  </button>
                </div>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h4>Order #{order.id}</h4>
                        <p className="order-date">
                          {new Date(order.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge status--${order.status}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item) => (
                          <div key={item.id} className="order-item">
                            <span className="item-name">{item.name}</span>
                            <span className="item-qty">x{item.quantity}</span>
                            <span className="item-price">
                              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p>No items in this order</p>
                      )}
                    </div>

                    <div className="order-footer">
                      <div className="order-total">
                        <strong>Total:</strong>
                        <strong>Rp {order.total_price.toLocaleString('id-ID')}</strong>
                      </div>
                      {order.notes && (
                        <div className="order-notes">
                          <strong>Notes:</strong> {order.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
