const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all products (supports searching and filtering)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { keyword, category } = req.query;
    let query = {};

    // Filter by name/keyword search
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    const products = await Product.find(query);
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product detail:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
