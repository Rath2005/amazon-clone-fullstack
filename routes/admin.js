const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

// @route   GET /api/admin/stats
// @desc    Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [products, orders, users] = await Promise.all([
      Product.find({}),
      Order.find({}),
      User.find({})
    ]);

    const totalRevenue =
orders.reduce(
  (sum, order) =>
  sum + (order.totalPrice || 0),
  0
);

const pendingRevenue =
orders
.filter(o => o.status === "Pending")
.reduce(
(sum,o)=>sum+o.totalPrice,
0
);

const processingRevenue =
orders
.filter(o => o.status === "Processing")
.reduce(
(sum,o)=>sum+o.totalPrice,
0
);

const deliveredRevenue =
orders
.filter(o => o.status === "Delivered")
.reduce(
(sum,o)=>sum+o.totalPrice,
0
);

const pendingOrders =
orders.filter(
  o => o.status === 'Pending'
).length;

const processingOrders =
orders.filter(
  o => o.status === 'Processing'
).length;

const deliveredOrders =
orders.filter(
  o => o.status === 'Delivered'
).length;

// Top Selling Product

const productSales = {};

orders.forEach(order => {

  order.items.forEach(item => {

    if(!productSales[item.name]){
      productSales[item.name] = 0;
    }

    productSales[item.name] += item.quantity;

  });

});

const topProduct =
Object.keys(productSales).length
? Object.entries(productSales)
.sort((a,b)=>b[1]-a[1])[0][0]
: "N/A";

// Top Category

const categorySales = {};

orders.forEach(order => {

  order.items.forEach(item => {

    const product =
    products.find(
      p => p._id == item.product
    );

    if(product){

      if(!categorySales[
        product.category
      ]){
        categorySales[
          product.category
        ] = 0;
      }

      categorySales[
        product.category
      ] += item.quantity;
    }

  });

});

const topCategory =
Object.keys(categorySales).length
? Object.entries(categorySales)
.sort((a,b)=>b[1]-a[1])[0][0]
: "N/A";

    res.json({
      success: true,
      stats: {
  totalProducts: products.length,
  totalOrders: orders.length,
  totalUsers: users.length,

  totalRevenue,

  pendingOrders,
  processingOrders,
  deliveredOrders,

  pendingRevenue,
processingRevenue,
deliveredRevenue,

  topProduct,
  topCategory
}
    });
  } catch (error) {
    console.error('Admin stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load dashboard stats.' });
  }
});

// @route   GET /api/admin/products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load products.' });
  }
});

// @route   POST /api/admin/products
router.post('/products', async (req, res) => {
  const { name, description, price, image, category, stock, rating } = req.body;

  try {
    if (!name || !description || price === undefined || !image || !category) {
      return res.status(400).json({ success: false, message: 'Please provide all required product fields.' });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      image,
      category,
      stock: stock !== undefined ? Number(stock) : 10,
      rating: rating !== undefined ? Number(rating) : 4.5
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Admin create product error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to create product.' });
  }
});

// @route   PUT /api/admin/products/:id
router.put('/products/:id', async (req, res) => {
  const { name, description, price, image, category, stock, rating } = req.body;

  try {
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (image !== undefined) updates.image = image;
    if (category !== undefined) updates.category = category;
    if (stock !== undefined) updates.stock = Number(stock);
    if (rating !== undefined) updates.rating = Number(rating);

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('Admin update product error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to update product.' });
  }
});

// @route   DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Admin delete product error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

// @route   GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load orders.' });
  }
});

// @route   PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status.' });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Admin update order status error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      success: true,
      users: users.map(u => ({
        id: u._id,
        username: u.username,
        email: u.email,
        isAdmin: !!u.isAdmin,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load users.' });
  }
});

module.exports = router;
