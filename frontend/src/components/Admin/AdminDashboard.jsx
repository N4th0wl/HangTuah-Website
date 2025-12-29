import { useEffect, useState } from 'react'
import { Users, ShoppingCart, UtensilsCrossed, TrendingUp } from 'lucide-react'
import { adminAPI } from '../../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getStats()

      setStats(response.data.data.stats)
      setActivities(response.data.data.activities)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="admin-section">Loading...</div>
  }

  if (error) {
    return <div className="admin-section error">{error}</div>
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section__title">Dashboard</h2>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--users">
            <Users size={24} />
          </div>
          <div className="stat-card__content">
            <p className="stat-card__label">Total Users</p>
            <p className="stat-card__value">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--orders">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-card__content">
            <p className="stat-card__label">Total Orders</p>
            <p className="stat-card__value">{stats?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--menus">
            <UtensilsCrossed size={24} />
          </div>
          <div className="stat-card__content">
            <p className="stat-card__label">Total Menus</p>
            <p className="stat-card__value">{stats?.totalMenus || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--trending">
            <TrendingUp size={24} />
          </div>
          <div className="stat-card__content">
            <p className="stat-card__label">Active</p>
            <p className="stat-card__value">100%</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="activities-section">
        <div className="activity-card">
          <h3 className="activity-card__title">Recent Users</h3>
          <div className="activity-list">
            {activities?.users && activities.users.length > 0 ? (
              activities.users.map((user) => (
                <div key={user.id} className="activity-item">
                  <div className="activity-item__content">
                    <p className="activity-item__name">{user.username}</p>
                    <p className="activity-item__email">{user.email}</p>
                  </div>
                  <p className="activity-item__date">
                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              ))
            ) : (
              <p className="activity-empty">No users yet</p>
            )}
          </div>
        </div>

        <div className="activity-card">
          <h3 className="activity-card__title">Recent Orders</h3>
          <div className="activity-list">
            {activities?.orders && activities.orders.length > 0 ? (
              activities.orders.map((order) => (
                <div key={order.id} className="activity-item">
                  <div className="activity-item__content">
                    <p className="activity-item__name">Order #{order.id}</p>
                    <p className="activity-item__email">by {order.username}</p>
                  </div>
                  <p className="activity-item__date">
                    Rp {order.total_price.toLocaleString('id-ID')}
                  </p>
                </div>
              ))
            ) : (
              <p className="activity-empty">No orders yet</p>
            )}
          </div>
        </div>

        <div className="activity-card">
          <h3 className="activity-card__title">Recent Menus</h3>
          <div className="activity-list">
            {activities?.menus && activities.menus.length > 0 ? (
              activities.menus.map((menu) => (
                <div key={menu.id} className="activity-item">
                  <div className="activity-item__content">
                    <p className="activity-item__name">{menu.name}</p>
                    <p className="activity-item__email">{menu.category}</p>
                  </div>
                  <p className="activity-item__date">
                    Rp {menu.price.toLocaleString('id-ID')}
                  </p>
                </div>
              ))
            ) : (
              <p className="activity-empty">No menus yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
