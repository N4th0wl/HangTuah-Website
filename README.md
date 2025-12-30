# 🍽️ Hang Tuah Toastery

A luxurious restaurant management and ordering system showcasing South East Asian cuisine with a modern, elegant interface.

**Project Status**: ✅ Active Development

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

---

## 🎯 Overview

Hang Tuah Toastery is a full-stack web application designed to provide a premium dining experience with online reservations, menu browsing, and order management. The platform features a sophisticated UI with professional animations, secure authentication, and comprehensive admin controls.

**Key Highlights**:
- 🎬 Professional cutscene animation on app load
- 📧 Email notifications for reservations and inquiries
- 🔐 Secure JWT authentication
- 📱 Responsive design for all devices
- 🖼️ Dynamic image management with Multer
- 💳 Shopping cart and checkout system

---

## ✨ Features

### 🎨 Frontend Features

#### User Interface
- ✅ **Professional Splash Screen Animation**
  - Animated logo with rotating rings
  - Character-by-character text animation
  - Particle effects and gradient backgrounds
  - Duration: 3.5 seconds with smooth fade-out

- ✅ **Responsive Design**
  - Mobile-first approach
  - Adaptive layouts for all screen sizes
  - Touch-friendly navigation

- ✅ **Modern Navigation**
  - Sticky navbar with smooth scrolling
  - WhatsApp integration bubble
  - Toast notifications for user feedback

#### Pages & Sections
- ✅ **Home Page**
  - Hero section with parallax effects
  - Menu highlights carousel
  - Signature locations carousel
  - Find Us section with branch image
  - Contact/Reservation form
  - Professional footer

- ✅ **Menu Page**
  - Dynamic menu items from database
  - Menu item details modal
  - Image display with cache busting
  - Add to cart functionality

- ✅ **Authentication**
  - Login page with form validation
  - Sign up page with password confirmation
  - Secure JWT token management
  - Protected routes

- ✅ **Shopping Cart & Checkout**
  - Add/remove items from cart
  - Quantity adjustment
  - Order summary
  - Checkout process

- ✅ **User Profile**
  - View user information
  - Order history
  - Account settings

- ✅ **Admin Dashboard**
  - Menu management (CRUD operations)
  - Image upload with Multer
  - Image preview and management
  - Delete functionality with file cleanup

#### Interactions
- ✅ **Form Handling**
  - Contact form with validation
  - Reservation form with date/time picker
  - Real-time form validation
  - Toast notifications for feedback

- ✅ **Animations**
  - Scroll reveal animations
  - Parallax effects
  - Carousel animations
  - Smooth transitions

### 🔧 Backend Features

#### Authentication & Security
- ✅ **JWT Authentication**
  - Secure token generation
  - Token expiration (7 days)
  - Protected API endpoints
  - Password hashing with bcryptjs

#### Email System
- ✅ **Nodemailer Integration**
  - Gmail SMTP configuration
  - Contact form email notifications
  - Reservation confirmation emails
  - Admin notification emails
  - Professional HTML email templates

#### File Management
- ✅ **Multer Image Upload**
  - Image upload to `/uploads` folder
  - Filename storage in database
  - Image deletion with file cleanup
  - Cache busting with timestamps
  - Support for PNG, JPG, JPEG, GIF, WebP

#### API Endpoints
- ✅ **Authentication Routes**
  - POST `/api/auth/login` - User login
  - POST `/api/auth/signup` - User registration

- ✅ **Menu Routes**
  - GET `/api/menu` - Get all menu items
  - GET `/api/menu/:id` - Get single menu item

- ✅ **Admin Routes**
  - GET `/api/admin/menus` - Get all menus (admin)
  - POST `/api/admin/menus` - Create menu item
  - PUT `/api/admin/menus/:id` - Update menu item
  - DELETE `/api/admin/menus/:id` - Delete menu item
  - POST `/api/admin/images/upload` - Upload image
  - GET `/api/admin/images/list` - List uploaded images
  - DELETE `/api/admin/images/:filename` - Delete image

- ✅ **Order Routes**
  - POST `/api/orders` - Create order
  - GET `/api/orders` - Get user orders

- ✅ **User Routes**
  - GET `/api/user/profile` - Get user profile
  - PUT `/api/user/profile` - Update user profile

- ✅ **Contact Routes**
  - POST `/api/contact` - Send contact form
  - POST `/api/reservation` - Send reservation

#### Database
- ✅ **MySQL Database**
  - Users table with authentication
  - Menu items with image support
  - Orders and order items
  - Secure password storage

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | 18.x |
| **Vite** | Build tool & dev server | 5.x |
| **React Router** | Client-side routing | 6.x |
| **Axios** | HTTP client | 1.x |
| **CSS3** | Styling & animations | Latest |
| **JavaScript ES6+** | Programming language | Latest |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime environment | 22.x |
| **Express.js** | Web framework | 5.x |
| **MySQL2** | Database driver | 3.x |
| **Nodemailer** | Email service | 6.x |
| **Multer** | File upload middleware | Latest |
| **bcryptjs** | Password hashing | 3.x |
| **jsonwebtoken** | JWT authentication | 9.x |
| **dotenv** | Environment variables | 17.x |
| **CORS** | Cross-origin requests | 2.x |

### Database
| Technology | Purpose |
|-----------|---------|
| **MySQL** | Relational database |
| **SQL** | Database queries |

### Tools & Services
| Tool | Purpose |
|------|---------|
| **Gmail SMTP** | Email sending |
| **Nodemon** | Development auto-reload |
| **npm** | Package manager |

---

## 📁 Project Structure

```
HangTuah/
├── frontend/                          # React frontend application
│   ├── src/
│   │   ├── assets/                   # Images and static files
│   │   │   ├── logo.png
│   │   │   ├── hangtuah.jpg
│   │   │   ├── Banner.png
│   │   │   ├── kopiO.jpg
│   │   │   └── nasigoreng.jpeg
│   │   ├── components/               # Reusable React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── WhatsAppBubble.jsx
│   │   │   ├── SplashScreen.jsx
│   │   │   └── Admin/
│   │   │       └── AdminMenus.jsx
│   │   ├── pages/                    # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Admin.jsx
│   │   ├── styles/                   # CSS files
│   │   │   ├── SplashScreen.css
│   │   │   └── (component styles)
│   │   ├── App.jsx                   # Main app component
│   │   ├── App.css                   # Main styles
│   │   └── main.jsx                  # Entry point
│   ├── index.html                    # HTML template
│   ├── package.json                  # Dependencies
│   └── vite.config.js                # Vite configuration
│
├── backend/                           # Express.js backend
│   ├── routes/                       # API route handlers
│   │   ├── auth.js                  # Authentication routes
│   │   ├── menu.js                  # Menu routes
│   │   ├── orders.js                # Order routes
│   │   ├── user.js                  # User routes
│   │   ├── admin.js                 # Admin routes
│   │   └── contact.js               # Contact/Email routes
│   ├── utils/                        # Utility functions
│   │   └── emailService.js          # Nodemailer configuration
│   ├── uploads/                      # Uploaded images directory
│   ├── database.sql                  # Database schema
│   ├── server.js                     # Express server setup
│   ├── .env                          # Environment variables
│   ├── package.json                  # Dependencies
│   └── README.md                     # Backend documentation
│
└── README.md                         # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v22 or higher)
- npm (v10 or higher)
- MySQL Server (v5.7 or higher)
- Git

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd HangTuah
```

### Step 2: Setup Backend

#### 2.1 Install Dependencies
```bash
cd backend
npm install
```

#### 2.2 Setup Database
1. Open MySQL client
2. Create database:
```sql
CREATE DATABASE hang_tuah;
USE hang_tuah;
```
3. Run database schema:
```sql
source database.sql;
```

#### 2.3 Configure Environment
Create `.env` file in `backend/` directory:
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hang_tuah
DB_PORT=3306

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Email Configuration (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
CONTACT_EMAIL=admin@hangtuah.com
```

**Email Setup**:
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Use the 16-character password in EMAIL_PASSWORD

### Step 3: Setup Frontend

#### 3.1 Install Dependencies
```bash
cd frontend
npm install
```

#### 3.2 Configure Environment (Optional)
Frontend uses backend URL: `http://localhost:5000`

---

## ▶️ Running the Application

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```
Expected output:
```
Server running on http://localhost:5000
✅ Email service is ready to send messages
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```
Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 📡 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { token, user }
```

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: { token, user }
```

### Menu Endpoints

#### Get All Menus
```http
GET /api/menu
Response: [{ id, name, description, price, image, ... }]
```

#### Get Single Menu
```http
GET /api/menu/:id
Response: { id, name, description, price, image, ... }
```

### Contact Endpoints

#### Send Reservation
```http
POST /api/reservation
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "date": "2025-12-20",
  "time": "19:00",
  "guests": 4,
  "occasion": "Anniversary",
  "requests": "Window seating"
}

Response: { success: true, message: "..." }
```

#### Send Contact Form
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+62 812 3456 7890",
  "subject": "Inquiry",
  "message": "Message content..."
}

Response: { success: true, message: "..." }
```

### Admin Endpoints

#### Get All Menus (Admin)
```http
GET /api/admin/menus
Authorization: Bearer <token>
Response: [{ id, name, description, price, image_filename, ... }]
```

#### Create Menu Item
```http
POST /api/admin/menus
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Nasi Goreng",
  "description": "Fried rice...",
  "price": 45000,
  "image": <file>
}

Response: { id, name, ... }
```

#### Update Menu Item
```http
PUT /api/admin/menus/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Nasi Goreng Updated",
  "description": "Updated description...",
  "price": 50000,
  "image": <file>,
  "removeImage": false
}

Response: { id, name, ... }
```

#### Delete Menu Item
```http
DELETE /api/admin/menus/:id
Authorization: Bearer <token>
Response: { message: "Menu deleted successfully" }
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Menu Items Table
```sql
CREATE TABLE menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_filename VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  menu_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (menu_id) REFERENCES menu_items(id)
);
```

---

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | Database host | `localhost` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | `password` |
| `DB_NAME` | Database name | `hang_tuah` |
| `DB_PORT` | Database port | `3306` |
| `JWT_SECRET` | JWT secret key | `your_secret_key` |
| `JWT_EXPIRE` | Token expiration | `7d` |
| `CORS_ORIGIN` | CORS origin | `http://localhost:5173` |
| `EMAIL_USER` | Gmail address | `your_email@gmail.com` |
| `EMAIL_PASSWORD` | Gmail app password | `16-char-password` |
| `CONTACT_EMAIL` | Admin email | `admin@hangtuah.com` |

---

## 📝 Features Implementation Details

### 🎬 Splash Screen Animation
- **File**: `frontend/src/components/SplashScreen.jsx`
- **Styles**: `frontend/src/styles/SplashScreen.css`
- **Duration**: 3.5 seconds
- **Features**: Logo animation, particle effects, text animation, loading bar

### 📧 Email System
- **File**: `backend/utils/emailService.js`
- **Service**: Gmail SMTP via Nodemailer
- **Templates**: Professional HTML templates for contact and reservation
- **Features**: Admin notifications, guest confirmations, reply-to functionality

### 🖼️ Image Management
- **Upload**: Multer middleware in `backend/routes/admin.js`
- **Storage**: `/backend/uploads` folder
- **Database**: Filename stored in `image_filename` column
- **Features**: Cache busting, file deletion on update/delete

### 🔐 Authentication
- **Method**: JWT tokens
- **Storage**: LocalStorage on frontend
- **Expiration**: 7 days
- **Password**: bcryptjs hashing

### 🎨 UI/UX
- **Framework**: React with CSS3 animations
- **Responsive**: Mobile-first design
- **Animations**: Scroll reveals, parallax, carousels
- **Notifications**: Toast system for user feedback

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📄 License

This project is part of the UAS (Final Exam) for IF451 - Advanced Web Programming at Universitas Multimedia Nusantara.

---

## 👥 Team

**Project**: Hang Tuah Toastery - Community Service Project
**Course**: IF451 - Advanced Web Programming
**Institution**: Universitas Multimedia Nusantara (UMN)

---

## 📞 Support

For issues or questions:
- 📧 Email: ivandernathanaelk@gmail.com
- 💬 WhatsApp: +62877 1565 8420

---

## 🎯 Future Enhancements

- [ ] Payment gateway integration (Midtrans/Stripe)
- [ ] Real-time order tracking
- [ ] Customer reviews and ratings
- [ ] Loyalty program
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Social media integration

---

**Last Updated**: December 30, 2025
**Status**: ✅ Active Development
