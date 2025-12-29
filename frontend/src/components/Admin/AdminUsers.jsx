import { useEffect, useState } from 'react'
import { Edit2, Trash2, Plus, X, Eye, EyeOff, Download } from 'lucide-react'
import { adminAPI } from '../../services/api'
import Toast from '../Toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [toast, setToast] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionConfirm, setActionConfirm] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      )
      setFilteredUsers(filtered)
      
      // Show toast notification with search results
      if (filtered.length > 0) {
        setToast({ 
          message: `Found ${filtered.length} user${filtered.length !== 1 ? 's' : ''}`, 
          type: 'success' 
        })
      } else {
        setToast({ 
          message: `No users found for "${searchQuery}"`, 
          type: 'warning' 
        })
      }
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getUsers()
      setUsers(response.data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingId(user.id)
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role,
      })
    } else {
      setEditingId(null)
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
      })
    }
    setShowPassword(false)
    setShowConfirmPassword(false)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
  }

  const handlePrintPDF = async () => {
    try {
      const response = await adminAPI.exportUsers()

      // Create blob and download
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users-report-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      setToast({ message: 'User report downloaded successfully!', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to export users'
      setToast({ message: errorMsg, type: 'error' })
    }
  }

  const performUserSave = async () => {
    setActionConfirm(null)

    try {
      const dataToSend = { ...formData }
      delete dataToSend.confirmPassword

      if (editingId) {
        await adminAPI.updateUser(editingId, dataToSend)
        setToast({ message: 'User updated successfully!', type: 'success' })
      } else {
        await adminAPI.addUser(dataToSend)
        setToast({ message: 'User created successfully!', type: 'success' })
      }

      fetchUsers()
      handleCloseModal()
      setError('')
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save user'
      setToast({ message: errorMsg, type: 'error' })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!editingId) {
      if (formData.password.length < 8) {
        setToast({ message: 'Password must be at least 8 characters', type: 'error' })
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setToast({ message: 'Passwords do not match', type: 'error' })
        return
      }
    }

    setActionConfirm({
      message: editingId ? 'Konfirmasi simpan perubahan user?' : 'Konfirmasi simpan user baru?',
      onConfirm: performUserSave,
      onCancel: () => setActionConfirm(null),
    })
  }

  const handleDelete = async (id) => {
    setDeleteConfirm({
      id,
      onConfirm: async () => {
        try {
          await adminAPI.deleteUser(id)
          setToast({ message: 'User deleted successfully!', type: 'success' })
          fetchUsers()
          setDeleteConfirm(null)
        } catch (err) {
          const errorMsg = err.response?.data?.error || 'Failed to delete user'
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
        <h2 className="admin-section__title">User Management</h2>
        <div className="admin-section__actions">
          <button className="btn btn--secondary" onClick={handlePrintPDF} title="Download as PDF">
            <Download size={18} />
            Export PDF
          </button>
          <button className="btn btn--primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Add User
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-search">
        <input
          type="text"
          placeholder="Search by username, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-search__input"
        />
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role--${user.role}`}>{user.role}</span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-icon btn-icon--edit"
                      onClick={() => handleOpenModal(user)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon btn-icon--delete"
                      onClick={() => handleDelete(user.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'rgba(245, 245, 245, 0.5)' }}>
                  No users found
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
              <h3>{editingId ? 'Edit User' : 'Add New User'}</h3>
              <button className="admin-modal__close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal__form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {!editingId && (
                <>
                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
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
          message={`Are you sure you want to delete this user?`}
          type="warning"
          showButtons={true}
          onYes={deleteConfirm.onConfirm}
          onNo={deleteConfirm.onCancel}
        />
      )}
    </div>
  )
}
