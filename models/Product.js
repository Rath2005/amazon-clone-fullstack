const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a product name.'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a product description.']
  },
  price: {
    type: Number,
    required: [true, 'Please add a product price.'],
    min: [0, 'Price must be positive.']
  },
  image: {
    type: String,
    required: [true, 'Please add a product image path.']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category.'],
    enum: ['Electronics', 'Components', 'Stationery', 'Books', 'Lifestyle']
  },
  stock: {
    type: Number,
    required: [true, 'Please add product stock.'],
    min: [0, 'Stock cannot be negative.'],
    default: 10
  },
  rating: {
    type: Number,
    default: 4.5,
    min: [0, 'Rating cannot be less than 0.'],
    max: [5, 'Rating cannot be more than 5.']
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MongooseProduct = mongoose.model('Product', ProductSchema);

// Export Proxy to switch between Mongoose and local database fallback
module.exports = new Proxy(MongooseProduct, {
  get(target, prop) {
    if (global.useLocalDB) {
      return require('./dbHelper').ProductMock[prop];
    }
    return target[prop];
  },
  construct(target, args) {
    if (global.useLocalDB) {
      const { MockDoc } = require('./dbHelper');
      return new MockDoc('products', args[0]);
    }
    return new target(...args);
  }
});
