const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1.'],
    default: 1
  }
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email.'
    ],
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password.'],
    minlength: [6, 'Password must be at least 6 characters.']
  },
  cart: [CartItemSchema],
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.model('User', UserSchema);

// Export Proxy to switch between Mongoose and local database fallback
module.exports = new Proxy(MongooseUser, {
  get(target, prop) {
    if (global.useLocalDB) {
      return require('./dbHelper').UserMock[prop];
    }
    return target[prop];
  },
  construct(target, args) {
    if (global.useLocalDB) {
      const { MockDoc } = require('./dbHelper');
      return new MockDoc('users', args[0]);
    }
    return new target(...args);
  }
});
