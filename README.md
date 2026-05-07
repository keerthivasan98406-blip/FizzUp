# 🥤 FizzUp Sales Manager

A modern full-stack soft drink shop sales management web application with glassmorphism UI, neon theme, and animated design.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| Auth | JWT (JSON Web Tokens) |

---

## 📁 Project Structure

```
fizzup-sales-manager/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── seedData.js        # Seed dummy data
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── salesController.js
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Sale.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── salesRoutes.js
│   ├── uploads/               # Product images (auto-created)
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── BubbleBackground.jsx
    │   │   ├── Layout.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   └── Sidebar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── MonthlyReport.jsx
    │   │   ├── ProductManagement.jsx
    │   │   ├── ProductSales.jsx
    │   │   ├── SalesHistory.jsx
    │   │   └── StockManagement.jsx
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚙️ Setup Instructions

### 1. MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **Cluster** (free tier M0)
3. Create a **Database User** with username and password
4. Under **Network Access**, add `0.0.0.0/0` (allow all IPs) or your specific IP
5. Click **Connect** → **Connect your application** → copy the connection string
6. Replace `<username>` and `<password>` in the connection string

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit backend/.env and set your MongoDB URI:
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/fizzup?retryWrites=true&w=majority
JWT_SECRET=fizzup_super_secret_jwt_key_2024
NODE_ENV=development
```

```bash
# Seed the database with dummy products and admin user
node config/seedData.js

# Start the backend server
npm run dev
# OR for production:
npm start
```

Backend runs on: **http://localhost:5000**

### 3. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## 🔐 Default Login Credentials

| Field | Value |
|-------|-------|
| Email | admin@fizzup.com |
| Password | admin123 |

---

## 📦 Pre-loaded Products

After running the seed script, these products are available:

| Product | Price | Stock | Category |
|---------|-------|-------|----------|
| Lemon Salt Soda | ₹20 | 50 | Soda |
| Buttermilk | ₹15 | 8 | Dairy |
| Curd | ₹25 | 30 | Dairy |
| Mint Juice | ₹30 | 20 | Juice |
| Cola | ₹40 | 60 | Soda |
| Water Bottle | ₹20 | 5 | Water |
| Fresh Juice | ₹50 | 15 | Juice |
| Ice Cream | ₹35 | 25 | Ice Cream |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new admin |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| GET | `/api/products/low-stock` | Get low stock products |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sales` | Create new sale |
| GET | `/api/sales` | Get all sales (paginated) |
| GET | `/api/sales/today` | Today's sales summary |
| GET | `/api/sales/monthly` | Monthly report |
| GET | `/api/sales/dashboard` | Dashboard stats |
| GET | `/api/sales/daily-history` | Daily grouped history |
| GET | `/api/sales/:id` | Get single sale |

---

## 🎨 Features

- ✅ **Dashboard** — Today's revenue, monthly stats, charts, top product, low stock alerts
- ✅ **Product Sales** — Grid layout with quantity controls, auto-calculation, bill generation
- ✅ **Product Management** — Add/Edit/Delete products with image upload
- ✅ **Sales History** — Paginated list with date filter and expandable rows
- ✅ **Monthly Report** — Revenue charts, pie chart, product performance table
- ✅ **Stock Management** — Visual stock bars, alerts, inline stock update
- ✅ **Authentication** — JWT-based secure login
- ✅ **Responsive Design** — Mobile-friendly with sidebar navigation
- ✅ **Dark Mode** — Full dark glassmorphism theme
- ✅ **Animations** — Framer Motion throughout
- ✅ **Toast Notifications** — Success/error feedback
- ✅ **Print Bill** — Printable sale receipts

---

## 🏗️ Build for Production

```bash
# Build frontend
cd frontend
npm run build

# The dist/ folder contains the production build
# Serve it with any static file server or configure Express to serve it
```

---

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `NODE_ENV` | Environment | `development` or `production` |
