import express from 'express'
import { sendContactEmail, sendReservationConfirmation } from '../utils/emailService.js'

const router = express.Router()

/**
 * POST /api/contact
 * Send contact form email
 */
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    // Validation
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        error: 'All fields are required',
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      })
    }

    // Send email
    await sendContactEmail({
      name,
      email,
      phone,
      subject,
      message,
    })

    res.json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon!',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    res.status(500).json({
      error: 'Failed to send contact form. Please try again later.',
    })
  }
})

/**
 * POST /api/contact/reservation
 * Send reservation confirmation email
 */
router.post('/reservation', async (req, res) => {
  try {
    const { name, email, date, time, guests, occasion, requests } = req.body

    // Validation
    if (!name || !email || !date || !time || !guests) {
      return res.status(400).json({
        error: 'Name, email, date, time, and number of guests are required',
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      })
    }

    // Send confirmation email
    await sendReservationConfirmation({
      name,
      email,
      date,
      time,
      guests,
      occasion,
      requests,
    })

    res.json({
      success: true,
      message: 'Reservation confirmed! A confirmation email has been sent to you.',
    })
  } catch (error) {
    console.error('Reservation error:', error)
    res.status(500).json({
      error: 'Failed to process reservation. Please try again later.',
    })
  }
})

export default router
