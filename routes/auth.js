const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'amazon_clone_secret_key_2026_jwt_token', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: !!user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Registration API error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Validate password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: !!user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Login API error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile details
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        isAdmin: !!req.user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/auth/profile
// @desc Update user profile
// @access Private

router.put('/profile', protect, async (req, res) => {

  try {

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success:false,
        message:'User not found'
      });
    }

    user.username =
      req.body.username || user.username;

    user.email =
      req.body.email || user.email;

    await user.save();

    res.json({
      success:true,
      user:{
        id:user._id,
        username:user.username,
        email:user.email,
        isAdmin:user.isAdmin
      }
    });

  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

});

// @route PUT /api/auth/password
// @desc Change Password
// @access Private

router.put('/password', protect, async (req, res) => {

  try {

    const {
      currentPassword,
      newPassword
    } = req.body;

    const user =
    await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success:false,
        message:'User not found'
      });
    }

    const isMatch =
    await user.matchPassword(
      currentPassword
    );

    if (!isMatch) {
      return res.status(400).json({
        success:false,
        message:'Current password is incorrect'
      });
    }

    user.password =
    newPassword;

    await user.save();

    res.json({
      success:true,
      message:'Password updated successfully'
    });

  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

});

module.exports = router;
