/**
 * Seed Script — seeds both MongoDB (if connected) and local JSON file database.
 */

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const mongoose = require('mongoose');

// Load env variables
dotenv.config();

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Import products from the updated campuskart products json
const products = require('../data/products.json');

const seedDB = async () => {
  try {
    console.log('🌱 Starting database seed for CampusKart...');

    // Connect to database (detects MongoDB or sets global.useLocalDB = true)
    await connectDB();

    const User = require('../models/User');
    const Product = require('../models/Product');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const demoPassword = await bcrypt.hash('demo123', salt);

    const usersToSeed = [
      {
        _id: 'admin001campuskart',
        username: 'Admin User',
        email: 'admin@campuskart.com',
        password: adminPassword,
        cart: [],
        isAdmin: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'demo001campuskart',
        username: 'Demo User',
        email: 'demo@campuskart.com',
        password: demoPassword,
        cart: [],
        isAdmin: false,
        createdAt: new Date().toISOString()
      }
    ];

    if (global.useLocalDB) {
      console.log('📝 Seeding local JSON database...');

      // Seed Users
      fs.writeFileSync(USERS_FILE, JSON.stringify(usersToSeed, null, 2), 'utf8');
      console.log('✅ Seeded admin and demo users into data/users.json');

      // Seed Products
      // Products file is already data/products.json, but let's make sure it contains the correct array
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
      console.log(`✅ Seeded ${products.length} products into data/products.json`);
    } else {
      console.log('🗄️ Seeding MongoDB database...');

      // Seed Users
      // Delete existing users first
      await mongoose.connection.db.collection('users').deleteMany({});
      // Insert new users
      await User.insertMany(usersToSeed);
      console.log('✅ Seeded admin and demo users into MongoDB');

      // Seed Products
      // Delete existing products
      await Product.deleteMany({});
      // Insert new products
      const inserted = await Product.insertMany(products);
      console.log(`✅ Successfully seeded ${inserted.length} products into MongoDB`);
    }

    console.log('\nProducts seeded:');
    products.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} (${p.category}) — ₹${p.price}`));
    console.log('\n🎉 Seed complete! Start the server with: npm run dev or node server.js');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();
