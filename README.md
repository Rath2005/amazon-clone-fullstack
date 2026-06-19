# Amazon Clone

# Amazon Clone

🚀 Live Demo: https://amazon-clone-fullstack-kir8.onrender.com

📂 GitHub Repository: https://github.com/Rath2005/amazon-clone-fullstack

A full-stack e-commerce web application inspired by Amazon...

A full-stack e-commerce web application inspired by Amazon. Built with **Node.js**, **Express 5**, **JWT authentication**, and a dual-database architecture that uses **MongoDB** when available or automatically falls back to a **local JSON file database**.

## Features

### User Features
- User Registration & Login (JWT Authentication)
- Product Search & Category Filtering
- Shopping Cart Management
- Wishlist Management
- Product Reviews & Ratings
- Recently Viewed Products
- Related Product Recommendations
- Coupon Discounts (SAVE10, WELCOME20)
- Checkout & Order Placement
- Order Tracking Progress Bar
- Order Cancellation
- Profile Management
- Dark Mode

### Admin Features
- Product Management (Add/Edit/Delete)
- Order Management
- User Management
- Dashboard Analytics
- Revenue Statistics
- Top Product Tracking
- Top Category Tracking

### System Features
- MongoDB + JSON Database Fallback
- Responsive UI
- Protected Routes
- Role-Based Access Control
- Render Deployment

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose) or JSON files in `./data/` |
| Auth | JWT + bcryptjs |
| Frontend | HTML, CSS, Vanilla JavaScript |

## Project Structure

```
amazon-clone/
├── config/db.js          # MongoDB connection with JSON fallback
├── data/                 # Local JSON database (users, products, orders)
├── middleware/auth.js    # JWT protect & admin middleware
├── models/               # Mongoose schemas + local DB proxy layer
├── public/               # Frontend static files
│   ├── index.html        # Home / product listing
│   ├── login.html
│   ├── register.html
│   ├── checkout.html
│   ├── orders.html
│   ├── admin.html        # Admin dashboard
│   ├── script.js
│   └── style.css
├── routes/               # API route handlers
├── scripts/seed.js       # Database seeding script
├── server.js             # Express entry point
├── .env.example
└── package.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)
- **Optional:** MongoDB running locally (the app works without it)

## Setup Instructions

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd amazon-clone
npm install
```

### 2. Configure environment variables

Copy the example env file and edit as needed:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/amazon_clone` |
| `JWT_SECRET` | Secret key for JWT signing | (see `.env.example`) |

### 3. Seed the database

This populates products and creates default user accounts:

```bash
npm run seed
```

**Default accounts after seeding:**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@amazon.com` | `admin123` |
| Demo customer | `demo@amazon.com` | `demo123` |

### 4. Start the server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

Open **http://localhost:5000** in your browser.

## Database Modes

On startup, the server attempts to connect to MongoDB with a 2-second timeout.

- **MongoDB connected** — Data is stored in MongoDB
- **MongoDB unavailable** — Automatically switches to `./data/*.json` files (no extra setup required)

Run `npm run seed` to populate data in either mode (seed always writes to JSON files; use MongoDB seeding separately if needed).

## API Endpoints

### Auth (`/api/auth`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login and receive JWT |
| GET | `/me` | Private | Get current user profile |

### Products (`/api/products`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Public | List products (`?keyword=` & `?category=`) |
| GET | `/:id` | Public | Get single product |

### Cart (`/api/cart`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Private | Get cart items |
| POST | `/add` | Private | Add product to cart |
| POST | `/update` | Private | Update item quantity |
| POST | `/remove` | Private | Remove item from cart |
| POST | `/clear` | Private | Clear entire cart |

### Orders (`/api/orders`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Private | Get user's order history |
| POST | `/` | Private | Place order (checkout) |

### Admin (`/api/admin`)

All routes require admin JWT (`isAdmin: true`).

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/stats` | Dashboard statistics |
| GET | `/products` | List all products |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| GET | `/orders` | List all orders |
| PUT | `/orders/:id/status` | Update order status |
| GET | `/users` | List all users |

## Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` or `/index.html` | Product grid, search, cart drawer |
| Login | `/login.html` | User sign-in |
| Register | `/register.html` | Create account |
| Checkout | `/checkout.html` | Shipping form & place order |
| Orders | `/orders.html` | Order history |
| Admin | `/admin.html` | Admin dashboard (admin users only) |

## Usage Flow

1. **Browse** products on the home page — filter by category or search by keyword
2. **Register** a new account or **login** with demo credentials
3. **Add to cart** — click "Add to Cart" on any in-stock product
4. **Checkout** — open the cart drawer → "Proceed to Checkout" → fill shipping address → "Place Your Order"
5. **View orders** — click "Returns & Orders" in the navbar
6. **Admin** — login as `admin@amazon.com` → click "Admin Dashboard" in the navbar

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm run seed` | Seed products and default users |

## Troubleshooting

**Port already in use**
```bash
# Windows — find and stop process on port 5000
netstat -ano | findstr :5000
taskkill /PID <pid> /F
```

**MongoDB connection warning**
This is expected if MongoDB is not installed. The app continues using the JSON file database in `./data/`.

**Broken product images**
Run `npm run seed` to refresh products with working image URLs.

**Admin access denied**
Ensure you logged in with an admin account (`admin@amazon.com` / `admin123`) after running the seed script.

## License

ISC

## Deployment

This project is deployed on Render.

Live URL:
https://amazon-clone-fullstack-kir8.onrender.com


## Key Highlights

- Built a complete full-stack e-commerce platform.
- Implemented JWT-based authentication and authorization.
- Developed admin dashboard with analytics and revenue tracking.
- Added wishlist, reviews, coupons, and order management.
- Deployed production-ready application on Render.

## Future Enhancements

- Razorpay Payment Gateway Integration
- Email Notifications
- Product Image Uploads
- Real-time Inventory Management
- AI Product Recommendations
- MongoDB Atlas Cloud Database

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT
- HTML5
- CSS3
- JavaScript
- Render
- GitHub