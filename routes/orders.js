const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   GET /api/orders
// @desc    Get user's order history
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching orders.' });
  }
});

// @route   POST /api/orders
// @desc    Create a new order (checkout)
// @access  Private
router.post('/', protect, async (req, res) => {
  const { shippingAddress, paymentMethod = 'Card' } = req.body;

  try {
    const user = await User.findById(req.user.id).populate('cart.product');

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      return res.status(400).json({ success: false, message: 'Please provide complete shipping address details.' });
    }

    let orderItems = [];
    let totalPrice = 0;

    // Verify stock availability, decrement inventory, and calculate total cost
    for (const item of user.cart) {
      const dbProduct = await Product.findById(item.product._id);
      if (!dbProduct) {
        return res.status(404).json({ success: false, message: `Product not found.` });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} left in stock.`
        });
      }

      // Deduct stock
      dbProduct.stock -= item.quantity;
      await dbProduct.save();

      // Add to order items
      orderItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        quantity: item.quantity,
        price: dbProduct.price,
        image: dbProduct.image
      });

      totalPrice += dbProduct.price * item.quantity;
    }

    // Create the order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: 'Pending',
      createdAt: new Date().toISOString()
    });

    await order.save();

    // Clear cart in user document
    user.cart = [];
    await user.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({ success: false, message: 'Server error processing checkout.' });
  }
});

// @route PUT /api/orders/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {

  try {

    const order =
    await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success:false,
        message:'Order not found'
      });
    }

    if (
      order.status === 'Delivered'
    ) {
      return res.status(400).json({
        success:false,
        message:'Delivered orders cannot be cancelled'
      });
    }

    order.status = 'Cancelled';

    await order.save();

    res.json({
      success:true,
      order
    });

  } catch (error) {

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

});

module.exports = router;
