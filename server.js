const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const wishlistRoutes = require("./routes/wishlist");
const reviewRoutes =
require("./routes/reviews");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use("/api/wishlist", wishlistRoutes);

app.use(
    "/api/reviews",
    reviewRoutes
);

// Catch-all route to serve index.html for spa behavior
app.get(/.*/, (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server after DB connection is resolved
const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Amazon Clone Server running on PORT ${PORT}`);
    console.log(`   Mode: ${global.useLocalDB ? 'Local JSON Database' : 'MongoDB'}\n`);
  });
})();
