import { useEffect, useState } from 'react'
import { Edit2, Trash2, Plus, X, Download } from 'lucide-react'
import { adminAPI, API_ROOT_URL } from '../../services/api'
import Toast from '../Toast'

export default function AdminMenus() {
  const [menus, setMenus] = useState([])
  const [filteredMenus, setFilteredMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionConfirm, setActionConfirm] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    category: 'mains',
    description: '',
    price: '',
    image: null,
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [hasNewImage, setHasNewImage] = useState(false)

  useEffect(() => {
    fetchMenus()
  }, [])

  useEffect(() => {
    // Filter menus based on search query
    if (searchQuery.trim() === '') {
      setFilteredMenus(menus)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = menus.filter(menu =>
        menu.name.toLowerCase().includes(query) ||
        menu.category.toLowerCase().includes(query) ||
        menu.description.toLowerCase().includes(query) ||
        menu.price.toString().includes(query)
      )
      setFilteredMenus(filtered)
      
      // Show toast notification with search results
      if (filtered.length > 0) {
        setToast({ 
          message: `Found ${filtered.length} menu${filtered.length !== 1 ? 's' : ''}`, 
          type: 'success' 
        })
      } else {
        setToast({ 
          message: `No menus found for "${searchQuery}"`, 
          type: 'warning' 
        })
      }
    }
  }, [searchQuery, menus])

  const fetchMenus = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getMenus()
      setMenus(response.data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch menus')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (menu = null) => {
    if (menu) {
      setEditingId(menu.id)
      setFormData({
        name: menu.name,
        category: menu.category,
        description: menu.description,
        price: menu.price,
        image: null,
      })
      // Set preview to image path if exists
      setImagePreview(menu.image || null)
      setHasNewImage(false)
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        category: 'mains',
        description: '',
        price: '',
        image: null,
      })
      setImagePreview(null)
      setHasNewImage(false)
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setHasNewImage(false)
  }

  const handlePrintPDF = async () => {
    try {
      const response = await adminAPI.exportMenus()

      // Create blob and download
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `menus-report-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      setToast({ message: 'Menu report downloaded successfully!', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to export menus'
      setToast({ message: errorMsg, type: 'error' })
    }
  }

  const performMenuSave = async () => {
    setActionConfirm(null)

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('category', formData.category)
      data.append('description', formData.description)
      data.append('price', formData.price)

      if (formData.image) {
        data.append('image', formData.image)
      }

      if (editingId && imagePreview === null && !hasNewImage) {
        data.append('removeImage', 'true')
      }

      if (editingId) {
        await adminAPI.updateMenu(editingId, data)
        setToast({ message: 'Menu updated successfully!', type: 'success' })
      } else {
        await adminAPI.addMenu(data)
        setToast({ message: 'Menu created successfully!', type: 'success' })
      }

      await fetchMenus()
      handleCloseModal()
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save menu'
      setToast({ message: errorMsg, type: 'error' })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    setActionConfirm({
      message: editingId ? 'Konfirmasi simpan perubahan menu?' : 'Konfirmasi simpan menu baru?',
      onConfirm: performMenuSave,
      onCancel: () => setActionConfirm(null),
    })
  }

  const handleDelete = async (id) => {
    setDeleteConfirm({
      id,
      onConfirm: async () => {
        try {
          await adminAPI.deleteMenu(id)
          setToast({ message: 'Menu deleted successfully!', type: 'success' })
          fetchMenus()
          setDeleteConfirm(null)
        } catch (err) {
          const errorMsg = err.response?.data?.error || 'Failed to delete menu'
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
        <h2 className="admin-section__title">Menu Management</h2>
        <div className="admin-section__actions">
          <button className="btn btn--secondary" onClick={handlePrintPDF} title="Download as PDF">
            <Download size={18} />
            Export PDF
          </button>
          <button className="btn btn--primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Add Menu
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-search">
        <input
          type="text"
          placeholder="Search by name, category, description, or price..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-search__input"
        />
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMenus.length > 0 ? (
              filteredMenus.map((menu) => (
                <tr key={menu.id}>
                  <td className="image-cell">
                    {menu.image ? (
                      <img src={`${API_ROOT_URL}${menu.image}?v=${menu.updated_at || menu.created_at}`} alt={menu.name} className="menu-thumbnail" />
                    ) : (
                      <div className="menu-thumbnail-placeholder">No Image</div>
                    )}
                  </td>
                  <td>{menu.name}</td>
                  <td>{menu.category}</td>
                  <td>Rp {menu.price.toLocaleString('id-ID')}</td>
                  <td className="description-cell">{menu.description}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-icon btn-icon--edit"
                      onClick={() => handleOpenModal(menu)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon btn-icon--delete"
                      onClick={() => handleDelete(menu.id)}
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
                  No menus found
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
              <h3>{editingId ? 'Edit Menu' : 'Add New Menu'}</h3>
              <button className="admin-modal__close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal__form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="mains">Mains</option>
                  <option value="appetizers">Appetizers</option>
                  <option value="beverages">Beverages</option>
                  <option value="desserts">Desserts</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData({ ...formData, image: file })
                      setImagePreview(URL.createObjectURL(file))
                      setHasNewImage(true)
                    }
                  }}
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img 
                      src={imagePreview.startsWith('blob:') ? imagePreview : `${API_ROOT_URL}${imagePreview}`} 
                      alt="Preview" 
                    />
                    <button
                      type="button"
                      className="btn btn--danger btn--small"
                      onClick={() => {
                        setFormData({ ...formData, image: null })
                        setImagePreview(null)
                        setHasNewImage(false)
                      }}
                      style={{ marginTop: '0.5rem' }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <div className="admin-modal__actions">
                <button type="submit" className="btn btn--primary">
                  {editingId ? 'Update' : 'Create'}
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
          message={`Are you sure you want to delete this menu?`}
          type="warning"
          showButtons={true}
          onYes={deleteConfirm.onConfirm}
          onNo={deleteConfirm.onCancel}
        />
      )}
    </div>
  )
}
