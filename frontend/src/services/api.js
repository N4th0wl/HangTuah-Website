import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const API_ROOT_URL = API_BASE_URL.replace(/\/api$/, '')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// Menu API
export const menuAPI = {
  getAll: (params) => api.get('/menu', { params }),
  getById: (id) => api.get(`/menu/${id}`),
  getCategories: () => api.get('/menu/categories/list'),
}

// Orders API (requires authentication)
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
}

// User API (requires authentication)
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  verifyPassword: (data) => api.post('/user/verify-password', data),
}

// Admin API (requires admin role)
export const adminAPI = {
  check: () => api.get('/admin/check'),
  getStats: () => api.get('/admin/stats'),
  getOrders: () => api.get('/admin/orders'),
  updateOrder: (id, data) => api.put(`/admin/orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/admin/orders/${id}`),
  exportOrders: (params) => api.get('/admin/export/orders/pdf', {
    params,
    responseType: 'blob',
  }),
  getMenus: () => api.get('/admin/menus'),
  addMenu: (data) => api.post('/admin/menus', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateMenu: (id, data) => api.put(`/admin/menus/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteMenu: (id) => api.delete(`/admin/menus/${id}`),
  exportMenus: () => api.get('/admin/export/menus/pdf', { responseType: 'blob' }),
  getUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  addUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  exportUsers: () => api.get('/admin/export/users/pdf', { responseType: 'blob' }),
}

export const reservationAPI = {
  create: (data) => api.post('/reservation', data),
}

// Health check
export const healthCheck = () => api.get('/health')

export { api, API_BASE_URL, API_ROOT_URL }

export default api
