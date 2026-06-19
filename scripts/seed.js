/**
 * Seed Script — uses local JSON file database fallback.
 * MongoDB is NOT required. Data is written to the ./data/ folder.
 */

global.useLocalDB = true;

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { ProductMock } = require('../models/dbHelper');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const products = [
  {
    name: 'iPhone 15',
    description: 'Apple iPhone 15, 128GB, Black. Featuring Dynamic Island, a 48MP Main camera, and USB-C, all in a durable color-infused glass and aluminum design.',
    price: 79999,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=400',
    category: 'Electronics',
    stock: 12,
    rating: 4.8,
    numReviews: 1250
  },
  {
    name: 'Nike Zoom Running Shoes',
    description: "Nike Men's Air Zoom Running Shoes. Light, breathable, and designed for maximum speed, springiness, and style on the running track.",
    price: 4499,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
    category: 'Fashion',
    stock: 25,
    rating: 4.5,
    numReviews: 890
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB Mechanical Keyboard with custom blue tactile switches. Customisable backlighting modes, full-key anti-ghosting, and premium metal alloy frame.',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=400',
    category: 'Gaming',
    stock: 15,
    rating: 4.6,
    numReviews: 432
  },
  {
    name: 'Gaming Mouse',
    description: 'Ergonomic Gaming Mouse with adjustable 7200 DPI sensor, 7 programmable buttons, and dynamic RGB breathing light effects. Highly durable buttons.',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=400',
    category: 'Gaming',
    stock: 30,
    rating: 4.4,
    numReviews: 310
  },
  {
    name: 'DSLR Camera',
    description: 'Professional DSLR Camera with EF-S 18-55mm IS II zoom lens. Capture stunning photos and cinematic Full HD videos with 24.1 Megapixels and built-in Wi-Fi.',
    price: 45999,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400',
    category: 'Electronics',
    stock: 8,
    rating: 4.7,
    numReviews: 245
  },
  {
    name: 'Smart Watch',
    description: 'Sleek Smart Watch with Heart Rate Monitor, Sleep Tracker, Blood Oxygen SpO2 sensor, and 1.8-inch HD touch display. Water-resistant with 10-day battery life.',
    price: 3499,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400',
    category: 'Electronics',
    stock: 20,
    rating: 4.3,
    numReviews: 1540
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'High-back Ergonomic Office Chair with adjustable headrest, 3D armrests, lumbar support, and breathable mesh backing for maximum comfort during long work sessions.',
    price: 8999,
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=400',
    category: 'Home',
    stock: 10,
    rating: 4.5,
    numReviews: 180
  },
  {
    name: 'Modern Wooden Coffee Table',
    description: 'Nordic-style Wooden Coffee Table featuring dual open storage shelves. Crafted with high-grade oak finish, perfect for premium living room setups.',
    price: 5999,
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=400',
    category: 'Home',
    stock: 7,
    rating: 4.2,
    numReviews: 95
  },
  {
    name: 'Atomic Habits (Paperback)',
    description: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear. Discover simple changes that lead to revolutionary results.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400',
    category: 'Books',
    stock: 50,
    rating: 4.9,
    numReviews: 12450
  },
  {
    name: 'Rich Dad Poor Dad',
    description: 'Rich Dad Poor Dad by Robert T. Kiyosaki. The classic personal finance book explaining why you do not need a high income to become rich, and how money works.',
    price: 399,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    category: 'Books',
    stock: 40,
    rating: 4.8,
    numReviews: 8920
  },
  {
    name: 'Classic Black Leather Jacket',
    description: "Classic Men's Black Leather Jacket. Made from premium synthetic leather with YKK zipper closures and comfortable polyester lining. Windproof and stylish.",
    price: 3499,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400',
    category: 'Fashion',
    stock: 14,
    rating: 4.6,
    numReviews: 312
  },
  {
    name: 'Oversized Cotton Hoodie',
    description: 'Premium Unisex Oversized Pullover Hoodie. Made with soft fleece-lined organic cotton, featuring a front kangaroo pocket and drawstring hood.',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400',
    category: 'Fashion',
    stock: 30,
    rating: 4.4,
    numReviews: 540
  },
  {
    name: 'Wireless Noise Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and studio-quality audio. Foldable design with plush ear cushions.',
    price: 7999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
    category: 'Electronics',
    stock: 18,
    rating: 4.7,
    numReviews: 2340
  },
  {
    name: 'Gaming Console Controller',
    description: 'Wireless Gaming Controller with haptic feedback, adaptive triggers, and ergonomic grip. Compatible with PC and consoles. 20-hour battery life.',
    price: 5499,
    image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=400',
    category: 'Gaming',
    stock: 22,
    rating: 4.8,
    numReviews: 780
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Double-wall insulated stainless steel water bottle. Keeps drinks cold for 24 hours and hot for 12 hours. Leak-proof lid, BPA-free, 1L capacity.',
    price: 899,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400',
    category: 'Home',
    stock: 60,
    rating: 4.6,
    numReviews: 3200
  }
];

const seedUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const demoPassword = await bcrypt.hash('demo123', salt);

  const users = [
    {
      _id: 'admin001amazonclone',
      username: 'Admin User',
      email: 'admin@amazon.com',
      password: adminPassword,
      cart: [],
      isAdmin: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'demo001amazonclone',
      username: 'Demo User',
      email: 'demo@amazon.com',
      password: demoPassword,
      cart: [],
      isAdmin: false,
      createdAt: new Date().toISOString()
    }
  ];

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  console.log('✅ Seeded admin and demo users into data/users.json');
  console.log('   Admin: admin@amazon.com / admin123');
  console.log('   Demo:  demo@amazon.com / demo123');
};

const seedDB = async () => {
  try {
    console.log('🌱 Starting seed with local JSON database fallback...');

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR);
    }

    await seedUsers();
    
    // Clear existing products
    await ProductMock.deleteMany();
    console.log('✅ Cleared existing products.');

    // Insert all products
    const inserted = await ProductMock.insertMany(products);
    console.log(`✅ Successfully seeded ${inserted.length} products into data/products.json`);
    console.log('\nProducts seeded:');
    inserted.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} (${p.category}) — ₹${p.price}`));
    console.log('\n🎉 Seed complete! Start the server with: npm start');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();
