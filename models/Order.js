const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [OrderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'Card'
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MongooseOrder = mongoose.model('Order', OrderSchema);

// Export Proxy to switch between Mongoose and local database fallback
module.exports = new Proxy(MongooseOrder, {
  get(target, prop) {
    if (global.useLocalDB) {
      return require('./dbHelper').OrderMock[prop];
    }
    return target[prop];
  },
  construct(target, args) {
    if (global.useLocalDB) {
      const { MockDoc } = require('./dbHelper');
      return new MockDoc('orders', args[0]);
    }
    return new target(...args);
  }
});
