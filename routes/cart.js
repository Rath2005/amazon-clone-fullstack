const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get current user's cart items
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    console.error('Fetch cart error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching cart' });
  }
});

// @route   POST /api/cart/add
// @desc    Add product to cart
// @access  Private
router.post('/add', protect, async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const user = await User.findById(req.user.id);
    const cartItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity += Number(quantity);
    } else {
      user.cart.push({ product: productId, quantity: Number(quantity) });
    }

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    res.json({ success: true, cart: updatedUser.cart });
  } catch (error) {
    console.error('Add cart item error:', error.message);
    res.status(500).json({ success: false, message: 'Server error adding to cart.' });
  }
});

// @route   POST /api/cart/update
// @desc    Update quantity of product in cart
// @access  Private
router.post('/update', protect, async (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity === undefined || Number(quantity) < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
  }

  try {
    const user = await User.findById(req.user.id);
    const cartItem = user.cart.find((item) => item.product.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Item not found in cart.' });
    }

    cartItem.quantity = Number(quantity);
    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    res.json({ success: true, cart: updatedUser.cart });
  } catch (error) {
    console.error('Update cart item error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating cart quantity.' });
  }
});

// @route   POST /api/cart/remove
// @desc    Remove product from cart
// @access  Private
router.post('/remove', protect, async (req, res) => {
  const { productId } = req.body;

  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter((item) => item.product.toString() !== productId);

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    res.json({ success: true, cart: updatedUser.cart });
  } catch (error) {
    console.error('Remove cart item error:', error.message);
    res.status(500).json({ success: false, message: 'Server error removing item from cart.' });
  }
});

// @route   POST /api/cart/clear
// @desc    Clear cart
// @access  Private
router.post('/clear', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();
    res.json({ success: true, cart: [] });
  } catch (error) {
    console.error('Clear cart error:', error.message);
    res.status(500).json({ success: false, message: 'Server error clearing cart.' });
  }
});

module.exports = router;
