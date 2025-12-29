import express from 'express'
import pool from '../config/database.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

// Create order (protected - requires login)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, totalPrice, tableNumber, notes, paymentMethod = 'qris' } = req.body
    const userId = req.user.id

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' })
    }

    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({ error: 'Invalid total price' })
    }

    if (!tableNumber || tableNumber < 1 || tableNumber > 25) {
      return res.status(400).json({ error: 'Invalid table number (must be 1-25)' })
    }

    const connection = await pool.getConnection()

    // Insert order with payment status
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total_price, table_number, status, payment_method, payment_status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [userId, totalPrice, tableNumber, 'pending', paymentMethod, 'paid', notes || null]
    )

    const orderId = orderResult.insertId

    // Insert order items
    for (const item of items) {
      await connection.execute(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.menuItemId, item.quantity, item.price]
      )
    }

    connection.release()

    res.status(201).json({
      message: 'Order created successfully',
      data: {
        orderId,
        userId,
        totalPrice,
        tableNumber,
        status: 'pending',
        paymentMethod,
        paymentStatus: 'paid',
        createdAt: new Date(),
      },
    })
  } catch (err) {
    console.error('Error creating order:', err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// Get user orders (protected - requires login)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    const connection = await pool.getConnection()

    const [orders] = await connection.execute(
      `SELECT o.id, o.user_id, o.total_price, o.table_number, o.status, o.payment_method, o.payment_status, o.notes, o.created_at
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    )

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await connection.execute(
          `SELECT oi.id, oi.menu_item_id, oi.quantity, oi.price, m.name, m.description
           FROM order_items oi
           JOIN menu_items m ON oi.menu_item_id = m.id
           WHERE oi.order_id = ?`,
          [order.id]
        )
        return { ...order, items }
      })
    )

    connection.release()

    res.json({ data: ordersWithItems })
  } catch (err) {
    console.error('Error fetching orders:', err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Get order by ID (protected - requires login)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const connection = await pool.getConnection()

    const [orders] = await connection.execute(
      `SELECT o.id, o.user_id, o.total_price, o.table_number, o.status, o.payment_method, o.payment_status, o.notes, o.created_at
       FROM orders o
       WHERE o.id = ? AND o.user_id = ?`,
      [id, userId]
    )

    if (orders.length === 0) {
      connection.release()
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = orders[0]

    const [items] = await connection.execute(
      `SELECT oi.id, oi.menu_item_id, oi.quantity, oi.price, m.name, m.description
       FROM order_items oi
       JOIN menu_items m ON oi.menu_item_id = m.id
       WHERE oi.order_id = ?`,
      [id]
    )

    connection.release()

    res.json({ data: { ...order, items } })
  } catch (err) {
    console.error('Error fetching order:', err)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// Cancel order (protected - requires login)
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const connection = await pool.getConnection()

    // Check if order belongs to user and is cancellable
    const [orders] = await connection.execute(
      `SELECT o.id, o.status FROM orders o WHERE o.id = ? AND o.user_id = ?`,
      [id, userId]
    )

    if (orders.length === 0) {
      connection.release()
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = orders[0]

    if (order.status !== 'pending') {
      connection.release()
      return res.status(400).json({ error: 'Only pending orders can be cancelled' })
    }

    // Update order status
    await connection.execute('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', id])

    connection.release()

    res.json({ message: 'Order cancelled successfully' })
  } catch (err) {
    console.error('Error cancelling order:', err)
    res.status(500).json({ error: 'Failed to cancel order' })
  }
})

export default router
