const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
  const file = getFilePath(collection);
  if (!fs.existsSync(file)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeData = (collection, data) => {
  const file = getFilePath(collection);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Mock Document class resembling Mongoose document
class MockDoc {
  constructor(collection, data) {
    this._collection = collection;
    Object.assign(this, data);
    // Auto-assign _id if not present (e.g. when using `new Order({...})` pattern)
    if (!this._id) {
      this._id = generateId();
    }
  }

  get id() {
    return this._id;
  }

  // Strip internal fields when serialized to JSON (e.g. by Express res.json())
  toJSON() {
    const obj = { ...this };
    delete obj._collection;
    return obj;
  }
  
  async save() {
    const data = readData(this._collection);
    
    // Hash password if User model and password modified
    if (this._collection === 'users' && this.password) {
      const existingUser = data.find(item => item._id === this._id);
      if (!existingUser || existingUser.password !== this.password) {
        if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
        }
      }
    }
    
    const index = data.findIndex(item => item._id === this._id);
    
    // Create copy for saving to strip non-db properties
    const dbObj = { ...this };
    delete dbObj._collection;

    if (index > -1) {
      data[index] = dbObj;
    } else {
      data.push(dbObj);
    }
    
    writeData(this._collection, data);
    return this;
  }

  // Mongoose-compatible .select() — in mock we just ignore field exclusions and return self for chaining
  select() {
    return this;
  }

  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

// User Model local emulation
const UserMock = {
  async findOne({ email }) {
    const users = readData('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? new MockDoc('users', user) : null;
  },

  // Returns a chainable query-like object (mimics Mongoose Query)
  // Supports: User.findById(id), User.findById(id).select('-password'), User.findById(id).populate('cart.product')
  findById(id) {
    const _resolve = async (populatePath, excludePassword) => {
      if (!id) return null;
      const users = readData('users');
      const user = users.find(u => u._id === id.toString());
      if (!user) return null;
      
      const doc = new MockDoc('users', user);
      if (excludePassword && doc.password) {
        delete doc.password;
      }
      
      if (populatePath === 'cart.product') {
        const products = readData('products');
        doc.cart = (doc.cart || []).map(item => {
          const prodId = item.product && item.product._id ? item.product._id : item.product;
          const prod = products.find(p => p._id === prodId.toString());
          return {
            ...item,
            product: prod ? new MockDoc('products', prod) : null
          };
        });
      }

      // Also attach populate as an instance method for later use
      doc.populate = async function(pathStr) {
        if (pathStr === 'cart.product') {
          const products = readData('products');
          this.cart = (this.cart || []).map(item => {
            const prodId = item.product && item.product._id ? item.product._id : item.product;
            const prod = products.find(p => p._id === prodId.toString());
            return { ...item, product: prod ? new MockDoc('products', prod) : null };
          });
        }
        return this;
      };
      
      return doc;
    };

    let _populatePath = null;
    let _excludePassword = false;

    // Chainable query object
    const query = {
      select(fields) {
        if (typeof fields === 'string' && fields.includes('-password')) {
          _excludePassword = true;
        }
        return query;
      },
      populate(path) { _populatePath = path; return query; },
      then(resolve, reject) { return _resolve(_populatePath, _excludePassword).then(resolve, reject); },
      catch(reject) { return _resolve(_populatePath, _excludePassword).catch(reject); }
    };

    return query;
  },

  async create(userData) {
    const id = generateId();
    const newUser = new MockDoc('users', {
      _id: id,
      cart: [],
      isAdmin: false,
      createdAt: new Date().toISOString(),
      ...userData
    });
    await newUser.save();
    return newUser;
  },

  find(query = {}) {
    const _resolve = async () => {
      let users = readData('users');
      if (query.isAdmin !== undefined) {
        users = users.filter(u => !!u.isAdmin === query.isAdmin);
      }
      return users.map(u => {
        const doc = new MockDoc('users', u);
        if (u.password) delete doc.password;
        return doc;
      });
    };

    const chainQuery = {
      select() { return chainQuery; },
      then(resolve, reject) { return _resolve().then(resolve, reject); },
      catch(reject) { return _resolve().catch(reject); }
    };

    return chainQuery;
  }
};

// Product Model local emulation
const ProductMock = {
  async find(query = {}) {
    let products = readData('products');
    
    if (query.$or) {
      // Parse $or array for keyword search
      products = products.filter(p => {
        return query.$or.some(clause => {
          const field = Object.keys(clause)[0];
          const queryVal = clause[field];
          
          let searchStr = "";
          if (queryVal && typeof queryVal === 'object' && queryVal.$regex) {
            searchStr = queryVal.$regex;
          } else {
            searchStr = queryVal;
          }
          
          const regex = new RegExp(searchStr, 'i');
          return regex.test(p[field] || "");
        });
      });
    }

    if (query.category && query.category !== 'All') {
      products = products.filter(p => p.category === query.category);
    }

    return products.map(p => new MockDoc('products', p));
  },

  async findById(id) {
    if (!id) return null;
    const products = readData('products');
    const product = products.find(p => p._id === id.toString());
    return product ? new MockDoc('products', product) : null;
  },

  async create(productData) {
    const id = generateId();
    const newProduct = new MockDoc('products', {
      _id: id,
      rating: productData.rating !== undefined ? productData.rating : 4.5,
      numReviews: productData.numReviews !== undefined ? productData.numReviews : 0,
      stock: productData.stock !== undefined ? productData.stock : 10,
      createdAt: new Date().toISOString(),
      ...productData
    });
    await newProduct.save();
    return newProduct;
  },

  async findByIdAndUpdate(id, updates) {
    const products = readData('products');
    const index = products.findIndex(p => p._id === id.toString());
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates, _id: products[index]._id };
    writeData('products', products);
    return new MockDoc('products', products[index]);
  },

  async findByIdAndDelete(id) {
    const products = readData('products');
    const index = products.findIndex(p => p._id === id.toString());
    if (index === -1) return null;
    const deleted = products.splice(index, 1)[0];
    writeData('products', products);
    return new MockDoc('products', deleted);
  },

  async deleteMany() {
    writeData('products', []);
    return { deletedCount: 0 };
  },

  async insertMany(productArray) {
    const currentProducts = readData('products');
    const newProducts = productArray.map(p => ({
      _id: p._id || generateId(),
      rating: p.rating || 4.5,
      numReviews: p.numReviews || 0,
      stock: p.stock !== undefined ? p.stock : 10,
      createdAt: new Date().toISOString(),
      ...p
    }));
    
    const combined = [...currentProducts, ...newProducts];
    writeData('products', combined);
    return newProducts.map(p => new MockDoc('products', p));
  }
};

// Order Model local emulation
const OrderMock = {
  find(query = {}) {
    const _resolve = async () => {
      let orders = readData('orders');
      if (query.user) {
        orders = orders.filter(o => o.user === query.user.toString());
      }
      // Sort descending by date
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return orders.map(o => new MockDoc('orders', o));
    };

    // Chainable query
    const chainQuery = {
      sort() { return chainQuery; },
      then(resolve, reject) { return _resolve().then(resolve, reject); },
      catch(reject) { return _resolve().catch(reject); }
    };

    return chainQuery;
  },

  async create(orderData) {
    const id = generateId();
    const newOrder = new MockDoc('orders', {
      _id: id,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      ...orderData
    });
    await newOrder.save();
    return newOrder;
  },

  findById(id) {
    const _resolve = async () => {
      if (!id) return null;
      const orders = readData('orders');
      const order = orders.find(o => o._id === id.toString());
      return order ? new MockDoc('orders', order) : null;
    };

    const chainQuery = {
      then(resolve, reject) { return _resolve().then(resolve, reject); },
      catch(reject) { return _resolve().catch(reject); }
    };

    return chainQuery;
  },

  async findByIdAndUpdate(id, updates) {
    const orders = readData('orders');
    const index = orders.findIndex(o => o._id === id.toString());
    if (index === -1) return null;
    orders[index] = { ...orders[index], ...updates, _id: orders[index]._id };
    writeData('orders', orders);
    return new MockDoc('orders', orders[index]);
  }
};

module.exports = { UserMock, ProductMock, OrderMock, MockDoc };
