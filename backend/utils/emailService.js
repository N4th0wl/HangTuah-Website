import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Email template functions
const getContactEmailTemplate = (name, email, phone, subject, message) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #d4af37 0%, #8b7500 100%); padding: 30px 20px; text-align: center; }
        .logo { height: 50px; margin-bottom: 15px; }
        .header h1 { color: white; font-size: 28px; font-weight: 300; letter-spacing: 1px; }
        .content { padding: 40px 30px; }
        .greeting { color: #333; font-size: 16px; margin-bottom: 20px; line-height: 1.6; }
        .info-box { background-color: #f9f9f9; border-left: 4px solid #d4af37; padding: 20px; margin: 25px 0; }
        .info-row { display: flex; margin-bottom: 12px; }
        .info-label { font-weight: 600; color: #333; min-width: 100px; }
        .info-value { color: #666; flex: 1; }
        .message-box { background-color: #fafaf8; border: 1px solid #e8e8e8; padding: 20px; margin: 25px 0; border-radius: 4px; }
        .message-label { font-weight: 600; color: #333; margin-bottom: 10px; }
        .message-content { color: #555; line-height: 1.8; white-space: pre-wrap; word-wrap: break-word; }
        .footer { background-color: #f5f5f5; padding: 20px 30px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999; }
        .divider { height: 1px; background-color: #e0e0e0; margin: 20px 0; }
        a { color: #d4af37; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✉️ New Contact Form Submission</h1>
        </div>
        
        <div class="content">
          <p class="greeting">A new message has been received from your website contact form.</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value"><a href="mailto:${email}">${email}</a></span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${phone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Subject:</span>
              <span class="info-value">${subject}</span>
            </div>
          </div>
          
          <div class="message-box">
            <div class="message-label">Message:</div>
            <div class="message-content">${message}</div>
          </div>
          
          <div class="divider"></div>
          <p style="color: #999; font-size: 12px; text-align: center;">
            This email was sent from the Hang Tuah Toastery contact form.<br>
            Reply directly to this email to respond to the sender.
          </p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 Hang Tuah Toastery. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

const getReservationEmailTemplate = (name, date, time, guests, occasion, requests) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #d4af37 0%, #8b7500 100%); padding: 30px 20px; text-align: center; }
        .logo { height: 50px; margin-bottom: 15px; }
        .header h1 { color: white; font-size: 28px; font-weight: 300; letter-spacing: 1px; }
        .header p { color: rgba(255,255,255,0.9); font-size: 14px; margin-top: 5px; }
        .content { padding: 40px 30px; }
        .greeting { color: #333; font-size: 16px; margin-bottom: 10px; line-height: 1.6; }
        .subtext { color: #666; font-size: 14px; margin-bottom: 30px; }
        .details-box { background: linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(139,117,0,0.05) 100%); border: 1px solid #e8dcc8; border-radius: 8px; padding: 25px; margin: 25px 0; }
        .detail-item { margin-bottom: 18px; }
        .detail-label { font-weight: 600; color: #8b7500; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-value { color: #333; font-size: 16px; margin-top: 5px; }
        .highlight { color: #d4af37; font-weight: 600; }
        .contact-box { background-color: #f9f9f9; border-left: 4px solid #d4af37; padding: 20px; margin: 25px 0; border-radius: 4px; }
        .contact-title { font-weight: 600; color: #333; margin-bottom: 12px; }
        .contact-item { color: #666; margin-bottom: 8px; font-size: 14px; }
        .cta-box { background: linear-gradient(135deg, #d4af37 0%, #8b7500 100%); color: white; padding: 20px; text-align: center; margin: 25px 0; border-radius: 4px; }
        .cta-text { font-size: 14px; line-height: 1.6; }
        .footer { background-color: #f5f5f5; padding: 20px 30px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999; }
        .divider { height: 1px; background-color: #e0e0e0; margin: 20px 0; }
        a { color: #d4af37; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Reservation Confirmed</h1>
          <p>Your table is reserved at Hang Tuah Toastery</p>
        </div>
        
        <div class="content">
          <p class="greeting">Dear <span class="highlight">${name}</span>,</p>
          <p class="subtext">Thank you for choosing Hang Tuah Toastery! We're delighted to welcome you and look forward to providing you with an exceptional dining experience.</p>
          
          <div class="details-box">
            <div class="detail-item">
              <div class="detail-label">📅 Date</div>
              <div class="detail-value">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">🕐 Time</div>
              <div class="detail-value">${time}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">👥 Number of Guests</div>
              <div class="detail-value">${guests} ${guests === 1 ? 'Guest' : 'Guests'}</div>
            </div>
            ${occasion ? `
            <div class="detail-item">
              <div class="detail-label">🎊 Occasion</div>
              <div class="detail-value">${occasion}</div>
            </div>
            ` : ''}
            ${requests ? `
            <div class="detail-item">
              <div class="detail-label">📝 Special Requests</div>
              <div class="detail-value">${requests}</div>
            </div>
            ` : ''}
          </div>
          
          <div class="cta-box">
            <p class="cta-text">If you need to make any changes to your reservation, please contact us as soon as possible.</p>
          </div>
          
          <div class="contact-box">
            <div class="contact-title">📞 Contact Information</div>
            <div class="contact-item"><strong>Phone:</strong> +62 877 1111 2222</div>
            <div class="contact-item"><strong>Email:</strong> <a href="mailto:admin@hangtuah.com">admin@hangtuah.com</a></div>
            <div class="contact-item"><strong>Address:</strong> Grand Kota Bintang, Bekasi, Indonesia</div>
          </div>
          
          <div class="divider"></div>
          <p style="color: #666; font-size: 14px; line-height: 1.6; text-align: center;">
            We look forward to serving you and creating wonderful memories together.<br>
            <strong>See you soon!</strong>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Hang Tuah Toastery</strong></p>
          <p>A Sanctuary in the Urban | Culinary Excellence Since 2024</p>
          <p>&copy; 2025 Hang Tuah Toastery. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Create transporter using Gmail SMTP
// You can also use other email services like SendGrid, Mailgun, etc.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error)
  } else {
    console.log('✅ Email service is ready to send messages')
  }
})

/**
 * Send contact form email
 * @param {Object} contactData - Contact form data
 * @param {string} contactData.name - Sender name
 * @param {string} contactData.email - Sender email
 * @param {string} contactData.phone - Sender phone
 * @param {string} contactData.subject - Email subject
 * @param {string} contactData.message - Email message
 * @returns {Promise<Object>} Email send result
 */
export const sendContactEmail = async (contactData) => {
  const { name, email, phone, subject, message } = contactData

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
    replyTo: email,
    subject: `New Contact Form Submission: ${subject}`,
    html: getContactEmailTemplate(name, email, phone, subject, message),
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.response)
    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

const getAdminReservationNotificationTemplate = (name, email, date, time, guests, occasion, requests) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #d4af37 0%, #8b7500 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; font-size: 28px; font-weight: 300; letter-spacing: 1px; }
        .header p { color: rgba(255,255,255,0.9); font-size: 14px; margin-top: 5px; }
        .content { padding: 40px 30px; }
        .alert-box { background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 15px; margin-bottom: 20px; }
        .alert-box p { color: #856404; margin: 0; }
        .details-box { background: linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(139,117,0,0.05) 100%); border: 1px solid #e8dcc8; border-radius: 8px; padding: 25px; margin: 25px 0; }
        .detail-item { margin-bottom: 18px; }
        .detail-label { font-weight: 600; color: #8b7500; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-value { color: #333; font-size: 16px; margin-top: 5px; }
        .guest-info { background-color: #f9f9f9; border-left: 4px solid #d4af37; padding: 20px; margin: 25px 0; border-radius: 4px; }
        .guest-title { font-weight: 600; color: #333; margin-bottom: 12px; }
        .guest-item { color: #666; margin-bottom: 8px; font-size: 14px; }
        .action-box { background: linear-gradient(135deg, #d4af37 0%, #8b7500 100%); color: white; padding: 20px; text-align: center; margin: 25px 0; border-radius: 4px; }
        .action-text { font-size: 14px; line-height: 1.6; }
        .footer { background-color: #f5f5f5; padding: 20px 30px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999; }
        a { color: #d4af37; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 New Reservation Received</h1>
          <p>A new reservation has been made</p>
        </div>
        
        <div class="content">
          <div class="alert-box">
            <p><strong>⏰ Action Required:</strong> Please confirm this reservation or contact the guest if needed.</p>
          </div>
          
          <div class="details-box">
            <div class="detail-item">
              <div class="detail-label">📅 Date</div>
              <div class="detail-value">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">🕐 Time</div>
              <div class="detail-value">${time}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">👥 Number of Guests</div>
              <div class="detail-value">${guests} ${guests === 1 ? 'Guest' : 'Guests'}</div>
            </div>
            ${occasion ? `
            <div class="detail-item">
              <div class="detail-label">🎊 Occasion</div>
              <div class="detail-value">${occasion}</div>
            </div>
            ` : ''}
            ${requests ? `
            <div class="detail-item">
              <div class="detail-label">📝 Special Requests</div>
              <div class="detail-value">${requests}</div>
            </div>
            ` : ''}
          </div>
          
          <div class="guest-info">
            <div class="guest-title">👤 Guest Information</div>
            <div class="guest-item"><strong>Name:</strong> ${name}</div>
            <div class="guest-item"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></div>
          </div>
          
          <div class="action-box">
            <p class="action-text">Please contact the guest to confirm the reservation or make any necessary arrangements.</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Hang Tuah Toastery - Admin Notification</strong></p>
          <p>&copy; 2025 Hang Tuah Toastery. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Send reservation confirmation email
 * @param {Object} reservationData - Reservation data
 * @param {string} reservationData.name - Guest name
 * @param {string} reservationData.email - Guest email
 * @param {string} reservationData.date - Reservation date
 * @param {string} reservationData.time - Reservation time
 * @param {number} reservationData.guests - Number of guests
 * @returns {Promise<Object>} Email send result
 */
export const sendReservationConfirmation = async (reservationData) => {
  const { name, email, date, time, guests, occasion, requests } = reservationData

  // Send confirmation email to guest
  const guestMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reservation Confirmation - Hang Tuah Toastery',
    html: getReservationEmailTemplate(name, date, time, guests, occasion, requests),
  }

  // Send notification email to admin
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
    replyTo: email,
    subject: `New Reservation: ${name} - ${new Date(date).toLocaleDateString()}`,
    html: getAdminReservationNotificationTemplate(name, email, date, time, guests, occasion, requests),
  }

  try {
    // Send both emails
    const [guestInfo, adminInfo] = await Promise.all([
      transporter.sendMail(guestMailOptions),
      transporter.sendMail(adminMailOptions),
    ])
    console.log('Confirmation email sent to guest:', guestInfo.response)
    console.log('Admin notification sent:', adminInfo.response)
    return {
      success: true,
      messageId: guestInfo.messageId,
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    throw error
  }
}

export default transporter
