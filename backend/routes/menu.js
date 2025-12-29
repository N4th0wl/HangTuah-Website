import express from 'express'
import pool from '../config/database.js'

const router = express.Router()

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query
    let query = 'SELECT id, name, category, description, price, image_filename, created_at, updated_at FROM menu_items WHERE 1=1'
    const params = []

    if (category && category !== 'all') {
      query += ' AND category = ?'
      params.push(category)
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm)
    }

    query += ' ORDER BY created_at DESC'

    const connection = await pool.getConnection()
    const [menuItems] = await connection.query(query, params)
    connection.release()

    // Add full image path for items with images
    const itemsWithImages = menuItems.map(item => ({
      ...item,
      image: item.image_filename ? `/uploads/${item.image_filename}` : null
    }))

    res.json({
      success: true,
      data: itemsWithImages,
      count: itemsWithImages.length,
    })
  } catch (error) {
    console.error('Get menu error:', error)
    res.status(500).json({ error: 'Failed to fetch menu items' })
  }
})

// Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const connection = await pool.getConnection()
    const [items] = await connection.query(
      'SELECT id, name, category, description, price, image_filename, created_at, updated_at FROM menu_items WHERE id = ?',
      [id]
    )
    connection.release()

    if (items.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' })
    }

    const item = {
      ...items[0],
      image: items[0].image_filename ? `/uploads/${items[0].image_filename}` : null
    }

    res.json({
      success: true,
      data: item,
    })
  } catch (error) {
    console.error('Get menu item error:', error)
    res.status(500).json({ error: 'Failed to fetch menu item' })
  }
})

// Get menu categories
router.get('/categories/list', async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [categories] = await connection.query(
      'SELECT DISTINCT category FROM menu_items ORDER BY category'
    )
    connection.release()

    res.json({
      success: true,
      data: categories.map((cat) => ({
        id: cat.category,
        name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
      })),
    })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

export default router
