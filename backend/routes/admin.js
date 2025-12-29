import express from 'express'
import bcrypt from 'bcryptjs'
import pool from '../config/database.js'
import authMiddleware from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import { generateUsersPDF, generateMenusPDF, generateOrdersPDF } from '../utils/pdfGenerator.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, '../uploads')

// Middleware to check admin role
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// ============ ADMIN CHECK ============

// Check if user is admin
router.get('/check', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ isAdmin: false, error: 'Not an admin' })
    }

    res.json({
      isAdmin: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
    })
  } catch (error) {
    console.error('Admin check error:', error)
    res.status(500).json({ error: 'Admin check failed' })
  }
})

// ============ DASHBOARD STATS ============

// Get dashboard statistics
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const connection = await pool.getConnection()

    // Get total users
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users')
    const totalUsers = users[0].count

    // Get total orders
    const [orders] = await connection.execute('SELECT COUNT(*) as count FROM orders')
    const totalOrders = orders[0].count

    // Get total menu items
    const [menus] = await connection.execute('SELECT COUNT(*) as count FROM menu_items')
    const totalMenus = menus[0].count

    // Get recent activities
    const [recentUsers] = await connection.execute(
      'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    )

    const [recentOrders] = await connection.execute(
      'SELECT o.id, o.user_id, u.username, o.total_price, o.status, o.created_at FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5'
    )

    const [recentMenus] = await connection.execute(
      'SELECT id, name, category, price, created_at FROM menu_items ORDER BY created_at DESC LIMIT 5'
    )

    connection.release()

    res.json({
      data: {
        stats: {
          totalUsers,
          totalOrders,
          totalMenus,
        },
        activities: {
          users: recentUsers,
          orders: recentOrders,
          menus: recentMenus,
        },
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// ============ USER MANAGEMENT ============

// Get all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [users] = await connection.execute(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    )

    connection.release()

    res.json({
      data: users,
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Get single user
router.get('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const connection = await pool.getConnection()

    const [users] = await connection.execute(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [id]
    )

    connection.release()

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      data: users[0],
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Create new user
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { username, email, password, role } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const connection = await pool.getConnection()

    await connection.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'user']
    )

    connection.release()

    res.status(201).json({
      message: 'User created successfully',
    })
  } catch (error) {
    console.error('Create user error:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username or email already exists' })
    }
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// Update user
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { username, email, role } = req.body

    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' })
    }

    const connection = await pool.getConnection()

    await connection.execute(
      'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
      [username, email, role || 'user', id]
    )

    connection.release()

    res.json({
      message: 'User updated successfully',
    })
  } catch (error) {
    console.error('Update user error:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username or email already exists' })
    }
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// Delete user
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const connection = await pool.getConnection()

    await connection.execute('DELETE FROM users WHERE id = ?', [id])

    connection.release()

    res.json({
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// ============ IMAGE MANAGEMENT ============

// Upload menu image
router.post('/images/upload', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    res.json({
      message: 'Image uploaded successfully',
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    })
  } catch (error) {
    console.error('Upload image error:', error)
    res.status(500).json({ error: 'Failed to upload image' })
  }
})

// Get all images from uploads folder
router.get('/images/list', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ data: [] })
    }

    const files = fs.readdirSync(uploadsDir)
    const images = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
    })

    res.json({
      data: images.map(filename => ({
        filename,
        path: `/uploads/${filename}`
      }))
    })
  } catch (error) {
    console.error('Get images error:', error)
    res.status(500).json({ error: 'Failed to fetch images' })
  }
})

// Delete image from uploads folder
router.delete('/images/:filename', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { filename } = req.params
    const filePath = path.join(uploadsDir, filename)

    // Security: Prevent directory traversal
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(400).json({ error: 'Invalid filename' })
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image not found' })
    }

    fs.unlinkSync(filePath)

    res.json({
      message: 'Image deleted successfully'
    })
  } catch (error) {
    console.error('Delete image error:', error)
    res.status(500).json({ error: 'Failed to delete image' })
  }
})

// ============ MENU MANAGEMENT ============

// Get all menu items
router.get('/menus', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [menus] = await connection.execute(
      'SELECT id, name, category, description, price, image_filename, created_at, updated_at FROM menu_items ORDER BY created_at DESC'
    )

    connection.release()

    // Add full image path for items with images
    const menusWithImages = menus.map(menu => ({
      ...menu,
      image: menu.image_filename ? `/uploads/${menu.image_filename}` : null
    }))

    res.json({
      data: menusWithImages,
    })
  } catch (error) {
    console.error('Get menus error:', error)
    res.status(500).json({ error: 'Failed to fetch menus' })
  }
})

// Get single menu item
router.get('/menus/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const connection = await pool.getConnection()

    const [menus] = await connection.execute(
      'SELECT id, name, category, description, price FROM menu_items WHERE id = ?',
      [id]
    )

    connection.release()

    if (menus.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' })
    }

    res.json({
      data: menus[0],
    })
  } catch (error) {
    console.error('Get menu error:', error)
    res.status(500).json({ error: 'Failed to fetch menu' })
  }
})

// Create menu item
router.post('/menus', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, category, description, price } = req.body
    const imageFilename = req.file ? req.file.filename : null

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' })
    }

    const connection = await pool.getConnection()

    await connection.execute(
      'INSERT INTO menu_items (name, category, description, price, image_filename) VALUES (?, ?, ?, ?, ?)',
      [name, category, description || '', price, imageFilename]
    )

    connection.release()

    res.status(201).json({
      message: 'Menu item created successfully',
      data: { image_filename: imageFilename }
    })
  } catch (error) {
    console.error('Create menu error:', error)
    res.status(500).json({ error: error.message || 'Failed to create menu item' })
  }
})

// Update menu item
router.put('/menus/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params
    const { name, category, description, price, removeImage } = req.body
    const imageFilename = req.file ? req.file.filename : null

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' })
    }

    const connection = await pool.getConnection()

    // Get current image filename to delete old file if replacing
    const [currentMenu] = await connection.query(
      'SELECT image_filename FROM menu_items WHERE id = ?',
      [id]
    )
    const oldImageFilename = currentMenu[0]?.image_filename

    // If new image is provided, update with new image
    if (imageFilename) {
      // Delete old image file if exists
      if (oldImageFilename) {
        const oldFilePath = path.join(uploadsDir, oldImageFilename)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }
      
      await connection.execute(
        'UPDATE menu_items SET name = ?, category = ?, description = ?, price = ?, image_filename = ? WHERE id = ?',
        [name, category, description || '', price, imageFilename, id]
      )
    } else if (removeImage === 'true') {
      // If removeImage flag is true, delete old image file and set to null
      if (oldImageFilename) {
        const oldFilePath = path.join(uploadsDir, oldImageFilename)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }
      
      await connection.execute(
        'UPDATE menu_items SET name = ?, category = ?, description = ?, price = ?, image_filename = NULL WHERE id = ?',
        [name, category, description || '', price, id]
      )
    } else {
      // Otherwise, keep existing image
      await connection.execute(
        'UPDATE menu_items SET name = ?, category = ?, description = ?, price = ? WHERE id = ?',
        [name, category, description || '', price, id]
      )
    }

    connection.release()

    res.json({
      message: 'Menu item updated successfully',
      data: { image_filename: imageFilename }
    })
  } catch (error) {
    console.error('Update menu error:', error)
    res.status(500).json({ error: error.message || 'Failed to update menu item' })
  }
})

// Delete menu item
router.delete('/menus/:id', authMiddleware, adminMiddleware, async (req, res) => {
  let connection
  try {
    const { id } = req.params
    connection = await pool.getConnection()

    const [menuRows] = await connection.query(
      'SELECT image_filename FROM menu_items WHERE id = ?',
      [id]
    )

    if (menuRows.length === 0) {
      connection.release()
      connection = null
      return res.status(404).json({ error: 'Menu item not found' })
    }

    const imageFilename = menuRows[0]?.image_filename

    await connection.beginTransaction()

    const [relatedItems] = await connection.query(
      'SELECT order_id, quantity, price FROM order_items WHERE menu_item_id = ?',
      [id]
    )

    let removedOrderItems = 0
    let affectedOrders = 0

    if (relatedItems.length > 0) {
      removedOrderItems = relatedItems.length

      const orderAdjustments = relatedItems.reduce((acc, item) => {
        const adjustment = item.quantity * item.price
        acc[item.order_id] = (acc[item.order_id] || 0) + adjustment
        return acc
      }, {})

      const orderIds = Object.keys(orderAdjustments)
      affectedOrders = orderIds.length

      for (const orderId of orderIds) {
        const adjustmentAmount = orderAdjustments[orderId]
        await connection.execute(
          'UPDATE orders SET total_price = GREATEST(total_price - ?, 0) WHERE id = ?',
          [adjustmentAmount, orderId]
        )
      }

      await connection.execute('DELETE FROM order_items WHERE menu_item_id = ?', [id])
    }

    await connection.execute('DELETE FROM menu_items WHERE id = ?', [id])

    await connection.commit()
    connection.release()
    connection = null

    if (imageFilename) {
      const filePath = path.join(uploadsDir, imageFilename)
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
        } catch (fileError) {
          console.warn('Failed to delete menu image file:', fileError)
        }
      }
    }

    res.json({
      message: 'Menu item deleted successfully',
      data: {
        removedOrderItems,
        affectedOrders,
      },
    })
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Rollback error on delete menu:', rollbackError)
      }
      connection.release()
    }

    console.error('Delete menu error:', error)
    res.status(500).json({ error: 'Failed to delete menu item' })
  }
})

// ============ ORDER MANAGEMENT ============

// Get all orders
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [orders] = await connection.execute(
      `SELECT o.id, o.user_id, u.username, o.total_price, o.table_number, o.status, o.notes, o.created_at 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
    )

    // Get order items for each order
    for (let order of orders) {
      const [items] = await connection.execute(
        `SELECT oi.id, oi.menu_item_id, mi.name, oi.quantity, oi.price 
         FROM order_items oi 
         JOIN menu_items mi ON oi.menu_item_id = mi.id 
         WHERE oi.order_id = ?`,
        [order.id]
      )
      order.items = items
    }

    connection.release()

    res.json({
      data: orders,
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Get single order
router.get('/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const connection = await pool.getConnection()

    const [orders] = await connection.execute(
      `SELECT o.id, o.user_id, u.username, o.total_price, o.table_number, o.status, o.notes, o.created_at 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.id = ?`,
      [id]
    )

    if (orders.length === 0) {
      connection.release()
      return res.status(404).json({ error: 'Order not found' })
    }

    const [items] = await connection.execute(
      `SELECT oi.id, oi.menu_item_id, mi.name, oi.quantity, oi.price 
       FROM order_items oi 
       JOIN menu_items mi ON oi.menu_item_id = mi.id 
       WHERE oi.order_id = ?`,
      [id]
    )

    connection.release()

    orders[0].items = items

    res.json({
      data: orders[0],
    })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// Update order status
router.put('/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }

    const connection = await pool.getConnection()

    await connection.execute(
      'UPDATE orders SET status = ?, notes = ? WHERE id = ?',
      [status, notes || '', id]
    )

    connection.release()

    res.json({
      message: 'Order updated successfully',
    })
  } catch (error) {
    console.error('Update order error:', error)
    res.status(500).json({ error: 'Failed to update order' })
  }
})

// Delete order
router.delete('/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const connection = await pool.getConnection()

    await connection.execute('DELETE FROM orders WHERE id = ?', [id])

    connection.release()

    res.json({
      message: 'Order deleted successfully',
    })
  } catch (error) {
    console.error('Delete order error:', error)
    res.status(500).json({ error: 'Failed to delete order' })
  }
})

// Export Users as PDF
router.get('/export/users/pdf', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [users] = await connection.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    )
    connection.release()

    const htmlContent = generateUsersPDF(users)
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="users-report.html"')
    res.send(htmlContent)
  } catch (error) {
    console.error('Export users error:', error)
    res.status(500).json({ error: 'Failed to export users' })
  }
})

// Export Menus as PDF
router.get('/export/menus/pdf', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [menus] = await connection.query(
      'SELECT id, name, category, description, price, created_at FROM menu_items ORDER BY created_at DESC'
    )
    connection.release()

    const htmlContent = generateMenusPDF(menus)
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="menus-report.html"')
    res.send(htmlContent)
  } catch (error) {
    console.error('Export menus error:', error)
    res.status(500).json({ error: 'Failed to export menus' })
  }
})

// Export Orders as PDF with optional date range
router.get('/export/orders/pdf', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const connection = await pool.getConnection()
    
    let query = 'SELECT o.id, u.username, o.total_price, o.status, o.created_at FROM orders o JOIN users u ON o.user_id = u.id'
    const params = []
    
    if (startDate && endDate) {
      query += ' WHERE o.created_at >= ? AND o.created_at <= ?'
      params.push(startDate, endDate)
    }
    
    query += ' ORDER BY o.created_at DESC'
    
    const [orders] = await connection.query(query, params)
    connection.release()

    const htmlContent = generateOrdersPDF(orders, startDate, endDate)
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="orders-report.html"')
    res.send(htmlContent)
  } catch (error) {
    console.error('Export orders error:', error)
    res.status(500).json({ error: 'Failed to export orders' })
  }
})

export default router
