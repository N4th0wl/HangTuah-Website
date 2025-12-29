import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard, Users, ShoppingCart, UtensilsCrossed, Menu, X, UserCircle } from 'lucide-react'
import { adminAPI } from '../services/api'
import logoImg from '../assets/logo.png'
import AdminDashboard from '../components/Admin/AdminDashboard'
import AdminUsers from '../components/Admin/AdminUsers'
import AdminOrders from '../components/Admin/AdminOrders'
import AdminMenus from '../components/Admin/AdminMenus'
import AdminProfile from '../components/Admin/AdminProfile'
import '../styles/Admin.css'

export default function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          navigate('/login')
          return
        }

        // Verify admin status with backend
        const response = await adminAPI.check()
        
        if (response.data.isAdmin) {
          setUser(response.data.user)
        } else {
          navigate('/login')
        }
      } catch (error) {
        console.error('Admin check failed:', error)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    window.dispatchEvent(new Event('userLoggedOut'))
    navigate('/login')
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false)
      }
    }

    const handleEscape = event => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const tabLabels = {
    dashboard: 'Dashboard',
    users: 'Users',
    orders: 'Orders',
    menus: 'Menus',
    profile: 'Profile'
  }

  const handleTabChange = tab => {
    setActiveTab(tab)

    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false)
    }
  }

  const userInitial = user?.username?.charAt(0)?.toUpperCase() ?? '?'

  if (loading) {
    return <div className="admin-loading">Verifying admin access...</div>
  }

  if (!user) {
    return <div className="admin-loading">Redirecting...</div>
  }

  return (
    <div className="admin-container">
      <header className="admin-mobile-header">
        <button
          className="admin-mobile-menu-btn"
          type="button"
          onClick={() => setIsSidebarOpen(prev => !prev)}
          aria-label={isSidebarOpen ? 'Tutup navigasi' : 'Buka navigasi'}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="admin-mobile-header__info">
          <p className="admin-mobile-header__title">{tabLabels[activeTab]}</p>
          <span className="admin-mobile-header__subtitle">Admin Panel · Hang Tuah</span>
        </div>

        <div className="admin-mobile-header__actions">
          <button
            type="button"
            className="admin-mobile-user"
            onClick={() => {
              setActiveTab('profile')
              if (window.innerWidth <= 768) {
                setIsSidebarOpen(false)
              }
            }}
            aria-label="Buka profil admin"
          >
            <span className="admin-mobile-user__initial" aria-hidden>{userInitial}</span>
            <span className="admin-mobile-user__name">{user.username}</span>
          </button>
          <button
            className="admin-mobile-logout"
            type="button"
            onClick={handleLogout}
            aria-label="Keluar"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__brand">
            <img src={logoImg} alt="Hang Tuah" className="admin-sidebar__logo" />
            <div>
              <h1 className="admin-sidebar__title">Hang Tuah</h1>
              <p className="admin-sidebar__subtitle">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <button
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'is-active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'users' ? 'is-active' : ''}`}
            onClick={() => handleTabChange('users')}
          >
            <Users size={20} />
            <span>Users</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'orders' ? 'is-active' : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            <ShoppingCart size={20} />
            <span>Orders</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'menus' ? 'is-active' : ''}`}
            onClick={() => handleTabChange('menus')}
          >
            <UtensilsCrossed size={20} />
            <span>Menus</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'profile' ? 'is-active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <UserCircle size={20} />
            <span>Profile</span>
          </button>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-user-info">
            <p className="admin-user-name">{user.username}</p>
            <p className="admin-user-role">{user.role}</p>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div
        className={`admin-overlay ${isSidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        role="presentation"
      />

      {/* Main Content */}
      <main className="admin-main">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'menus' && <AdminMenus />}
        {activeTab === 'profile' && (
          <AdminProfile
            currentUser={user}
            onProfileUpdate={(updates) => {
              setUser((prev) => ({ ...prev, ...updates }))
              if (updates?.username) {
                localStorage.setItem('username', updates.username)
              }
            }}
          />
        )}
      </main>
    </div>
  )
}
