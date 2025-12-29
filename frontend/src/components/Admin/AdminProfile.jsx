import { useEffect, useMemo, useState } from 'react'
import { User, Mail, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react'
import Toast from '../Toast'
import { userAPI } from '../../services/api'

export default function AdminProfile({ currentUser, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    username: currentUser?.username ?? '',
    email: currentUser?.email ?? '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [toast, setToast] = useState(null)
  const [actionConfirm, setActionConfirm] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      username: currentUser?.username ?? '',
      email: currentUser?.email ?? '',
    }))
  }, [currentUser?.username, currentUser?.email])

  const hasProfileChanges = useMemo(() => {
    return (
      formData.username !== (currentUser?.username ?? '') ||
      formData.email !== (currentUser?.email ?? '') ||
      Boolean(formData.newPassword)
    )
  }, [formData, currentUser])

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const resetPasswords = () => {
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    }))
    setShowPassword(false)
    setShowConfirmPassword(false)
    setShowCurrentPassword(false)
  }

  const performProfileUpdate = async () => {
    setActionConfirm(null)

    try {
      setIsSubmitting(true)

      const requiresPassword = true

      if (requiresPassword) {
        await userAPI.verifyPassword({ password: formData.currentPassword })
      }

      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
      }

      if (formData.newPassword) {
        payload.newPassword = formData.newPassword
      }

      const response = await userAPI.updateProfile(payload)

      setToast({
        message: formData.newPassword ? 'Profil & password berhasil diperbarui!' : 'Profil berhasil diperbarui!',
        type: 'success',
      })

      if (typeof onProfileUpdate === 'function') {
        onProfileUpdate(response.data?.data ?? {
          username: payload.username,
          email: payload.email,
        })
      }

      resetPasswords()
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Gagal memperbarui profil'
      setToast({ message: errorMsg, type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!hasProfileChanges) {
      setToast({ message: 'Tidak ada perubahan untuk disimpan', type: 'warning' })
      return
    }

    if (!formData.username.trim() || !formData.email.trim()) {
      setToast({ message: 'Username dan email wajib diisi', type: 'error' })
      return
    }

    if (!formData.currentPassword) {
      setToast({ message: 'Masukkan password saat ini untuk konfirmasi', type: 'error' })
      return
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      setToast({ message: 'Password baru minimal 8 karakter', type: 'error' })
      return
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      setToast({ message: 'Konfirmasi password tidak cocok', type: 'error' })
      return
    }

    setActionConfirm({
      message: formData.newPassword
        ? 'Simpan perubahan profil dan password?'
        : 'Simpan perubahan profil?',
      onConfirm: performProfileUpdate,
      onCancel: () => setActionConfirm(null),
    })
  }

  return (
    <div className="admin-section admin-profile">
      <div className="profile-card">
        <div className="profile-card__header">
          <div className="profile-card__icon profile-card__icon--primary">
            <User size={20} />
          </div>
          <div>
            <h3>Informasi Akun</h3>
            <p>Perbarui data akun admin yang terlihat oleh pengguna lain.</p>
          </div>
        </div>

        <div className="profile-card__body">
          <div className="form-group">
            <label>Username</label>
            <div className="input-with-icon">
              <User size={16} />
              <input
                type="text"
                value={formData.username}
                onChange={handleChange('username')}
                placeholder="Username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="Alamat email"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card__header">
          <div className="profile-card__icon profile-card__icon--accent">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3>Keamanan</h3>
            <p>Ganti password secara berkala untuk menjaga keamanan akun.</p>
          </div>
        </div>

        <div className="profile-card__body">
          <div className="form-group">
            <label>Password Saat Ini</label>
            <div className="password-input-wrapper">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleChange('currentPassword')}
                placeholder="Masukkan password saat ini"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowCurrentPassword(prev => !prev)}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <small className="input-hint">Password saat ini dibutuhkan untuk menyimpan perubahan.</small>
          </div>

          <div className="form-group">
            <label>Password Baru</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleChange('newPassword')}
                placeholder="Password baru"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Konfirmasi Password Baru</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmNewPassword}
                onChange={handleChange('confirmNewPassword')}
                placeholder="Ulangi password baru"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(prev => !prev)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <form className="profile-actions" onSubmit={handleSubmit}>
        <div className="profile-summary">
          <div className="profile-summary__icon">
            <KeyRound size={22} />
          </div>
          <div>
            <h4>Konfirmasi Perubahan</h4>
            <p>
              Simpan perubahan setelah memastikan data sudah benar. Password saat ini wajib untuk konfirmasi.
            </p>
          </div>
        </div>

        <div className="profile-actions__buttons">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setFormData({
                username: currentUser?.username ?? '',
                email: currentUser?.email ?? '',
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
              })
              setToast({ message: 'Perubahan dibatalkan', type: 'warning' })
            }}
          >
            Reset
          </button>

          <button
            type="submit"
            className="btn btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>

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
    </div>
  )
}
