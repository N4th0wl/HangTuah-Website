import { useEffect, useState } from 'react'
import { Edit2, Trash2, X, Download } from 'lucide-react'
import { adminAPI } from '../../services/api'
import Toast from '../Toast'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionConfirm, setActionConfirm] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDateRangeModal, setShowDateRangeModal] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  })
  const [formData, setFormData] = useState({
    status: 'pending',
    notes: '',
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    // Filter orders based on search query
    if (searchQuery.trim() === '') {
      setFilteredOrders(orders)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = orders.filter(order =>
        order.id.toString().includes(query) ||
        order.status.toLowerCase().includes(query) ||
        (order.notes && order.notes.toLowerCase().includes(query))
      )
      setFilteredOrders(filtered)
      
      // Show toast notification with search results
      if (filtered.length > 0) {
        setToast({ 
          message: `Found ${filtered.length} order${filtered.length !== 1 ? 's' : ''}`, 
          type: 'success' 
        })
      } else {
        setToast({ 
          message: `No orders found for "${searchQuery}"`, 
          type: 'warning' 
        })
      }
    }
  }, [searchQuery, orders])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getOrders()
      setOrders(response.data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (order = null) => {
    if (order) {
      setEditingId(order.id)
      setFormData({
        status: order.status,
        notes: order.notes || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        status: 'pending',
        notes: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
  }

  const handlePrintPDF = async () => {
    try {
      const params = dateRange.startDate && dateRange.endDate
        ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
        : undefined
      const response = await adminAPI.exportOrders(params)
      
      // Create blob and download
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'text/html' })
      const urlObj = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = urlObj
      const dateStr = dateRange.startDate && dateRange.endDate 
        ? `${dateRange.startDate}_to_${dateRange.endDate}`
        : new Date().toISOString().split('T')[0]
      link.download = `orders-report-${dateStr}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(urlObj)
      
      setToast({ message: 'Order report downloaded successfully!', type: 'success' })
      setShowDateRangeModal(false)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to export orders'
      setToast({ message: errorMsg, type: 'error' })
    }
  }

  const performOrderUpdate = async () => {
    setActionConfirm(null)

    try {
      await adminAPI.updateOrder(editingId, formData)
      setToast({ message: 'Order updated successfully!', type: 'success' })
      fetchOrders()
      handleCloseModal()
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update order'
      setToast({ message: errorMsg, type: 'error' })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    setActionConfirm({
      message: `Konfirmasi simpan perubahan untuk Order #${editingId}?`,
      onConfirm: performOrderUpdate,
      onCancel: () => setActionConfirm(null),
    })
  }

  const handleDelete = async (id) => {
    setDeleteConfirm({
      id,
      onConfirm: async () => {
        try {
          await adminAPI.deleteOrder(id)
          setToast({ message: 'Order deleted successfully!', type: 'success' })
          fetchOrders()
          setDeleteConfirm(null)
        } catch (err) {
          const errorMsg = err.response?.data?.error || 'Failed to delete order'
          setToast({ message: errorMsg, type: 'error' })
          setDeleteConfirm(null)
        }
      },
      onCancel: () => {
        setDeleteConfirm(null)
      },
    })
  }

  if (loading) {
    return <div className="admin-section">Loading...</div>
  }

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Order Management</h2>
        <button className="btn btn--secondary" onClick={() => setShowDateRangeModal(true)} title="Download as PDF">
          <Download size={18} />
          Export PDF
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-search">
        <input
          type="text"
          placeholder="Search by order ID, status, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-search__input"
        />
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.username}</td>
                  <td>Rp {order.total_price.toLocaleString('id-ID')}</td>
                  <td>
                    <span className={`status-badge status--${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-icon btn-icon--edit"
                      onClick={() => handleOpenModal(order)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon btn-icon--delete"
                      onClick={() => handleDelete(order.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'rgba(245, 245, 245, 0.5)' }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h3>Edit Order #{editingId}</h3>
              <button className="admin-modal__close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal__form">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="4"
                />
              </div>

              <div className="admin-modal__actions">
                <button type="submit" className="btn btn--primary">
                  Update
                </button>
                <button type="button" className="btn btn--secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {actionConfirm && (
        <Toast
          message={actionConfirm.message}
          type="warning"
          showButtons={true}
          onYes={actionConfirm.onConfirm}
          onNo={actionConfirm.onCancel}
        />
      )}

      {/* Delete Confirmation Toast */}
      {deleteConfirm && (
        <Toast
          message={`Are you sure you want to delete this order?`}
          type="warning"
          showButtons={true}
          onYes={deleteConfirm.onConfirm}
          onNo={deleteConfirm.onCancel}
        />
      )}

      {/* Date Range Modal for PDF Export */}
      {showDateRangeModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h3>Export Orders Report</h3>
              <button className="admin-modal__close" onClick={() => setShowDateRangeModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handlePrintPDF() }} className="admin-modal__form">
              <div className="form-group">
                <label>Start Date (Optional)</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>End Date (Optional)</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>

              <p style={{ fontSize: '0.9rem', color: 'rgba(245, 245, 245, 0.6)', marginBottom: '1rem' }}>
                Leave dates empty to export all orders
              </p>

              <div className="admin-modal__actions">
                <button type="submit" className="btn btn--primary">
                  Download PDF
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setShowDateRangeModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
