import express from 'express'
import bcrypt from 'bcryptjs'
import pool from '../config/database.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

// Get user profile (protected)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    const connection = await pool.getConnection()

    const [users] = await connection.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [userId]
    )

    connection.release()

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      message: 'User profile fetched successfully',
      data: users[0],
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Verify password (protected)
router.post('/verify-password', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body
    const userId = req.user.id

    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    const connection = await pool.getConnection()

    const [users] = await connection.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    )

    connection.release()

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isPasswordValid = await bcrypt.compare(password, users[0].password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    res.json({ message: 'Password verified successfully' })
  } catch (error) {
    console.error('Verify password error:', error)
    res.status(500).json({ error: 'Failed to verify password' })
  }
})

// Update user profile (protected)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, newPassword } = req.body
    const userId = req.user.id

    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' })
    }

    const connection = await pool.getConnection()

    // Check if email or username already exists (excluding current user)
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
      [email, username, userId]
    )

    if (existingUser.length > 0) {
      connection.release()
      return res.status(409).json({ error: 'Email or username already exists' })
    }

    let updateQuery = 'UPDATE users SET username = ?, email = ?'
    const params = [username, email]

    // If new password is provided, hash and update it
    if (newPassword) {
      if (newPassword.length < 8) {
        connection.release()
        return res.status(400).json({ error: 'Password must be at least 8 characters' })
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      updateQuery += ', password = ?'
      params.push(hashedPassword)
    }

    updateQuery += ' WHERE id = ?'
    params.push(userId)

    await connection.execute(updateQuery, params)

    connection.release()

    res.json({
      message: 'Profile updated successfully',
      data: {
        username,
        email,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router
