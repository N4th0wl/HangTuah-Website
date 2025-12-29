# Hang Tuah Toastery Backend

Express.js backend server untuk aplikasi Hang Tuah Toastery.

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database
- Buka MySQL client
- Jalankan script di `database.sql`:
```sql
source database.sql
```

Atau copy-paste isi `database.sql` ke MySQL client.

### 3. Configure Environment
Edit `.env` file dengan konfigurasi database Anda:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hang_tuah
```

### 4. Run Server
Development mode (dengan auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user

### Menu
- `GET /api/menu` - Get semua menu items
  - Query params: `category`, `search`
- `GET /api/menu/:id` - Get menu item by ID
- `GET /api/menu/categories/list` - Get semua categories

### Health Check
- `GET /api/health` - Check server status

## Request Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Menu
```bash
curl http://localhost:5000/api/menu
curl http://localhost:5000/api/menu?category=mains
curl http://localhost:5000/api/menu?search=nasi
```

## Database Schema

### users
- id (INT, PK)
- username (VARCHAR, UNIQUE)
- email (VARCHAR, UNIQUE)
- password (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### menu_items
- id (INT, PK)
- name (VARCHAR)
- category (VARCHAR)
- description (TEXT)
- price (INT)
- image (LONGBLOB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
