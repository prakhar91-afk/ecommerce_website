require('dotenv').config();

const port = process.env.PORT || 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// ──────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ──────────────────────────────────────────
// MongoDB Connection
// ──────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// ──────────────────────────────────────────
// Image Upload (Multer)
// ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

app.use('/images', express.static('upload/images'));
app.post('/upload', upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`
  });
});

// ──────────────────────────────────────────
// Schemas & Models
// ──────────────────────────────────────────

// --- User ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' },
  date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// --- Product ---
const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  old_price: { type: Number, default: 0 },
  description: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  reviews: { type: Array, default: [] },
  availability: { type: Boolean, default: true },
  date: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);

// --- Order ---
const OrderSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  items: { type: Array, required: true },
  shippingAddress: {
    name: String,
    email: String,
    address: String,
    city: String,
    zip: String
  },
  paymentMethod: { type: String, default: 'Credit Card (Simulated)' },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Processing' },
  date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

// ──────────────────────────────────────────
// Auth Middleware
// ──────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ success: false, error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Malformed token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

// ──────────────────────────────────────────
// Auth Routes
// ──────────────────────────────────────────

// Sign Up
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: 'All fields required' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role: 'customer' });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ──────────────────────────────────────────
// Product Routes
// ──────────────────────────────────────────

// Get all products
app.get('/all-products', async (req, res) => {
  try {
    let query = {};
    const { q, category, sort } = req.query;

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    let products = await Product.find(query);

    // Sorting
    if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);

    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by numeric ID
app.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: Number(req.params.id) });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Add product (admin)
app.post('/add-product', async (req, res) => {
  try {
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const id = lastProduct ? lastProduct.id + 1 : 1;

    const product = new Product({
      id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      price: Number(req.body.price) || Number(req.body.new_price) || 0,
      old_price: Number(req.body.old_price) || 0,
      description: req.body.description || '',
      stock: Number(req.body.stock) || 0,
      rating: Number(req.body.rating) || 5,
      reviews: req.body.reviews || [],
      availability: true
    });

    await product.save();
    res.json({ success: true, name: req.body.name, product });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ success: false, error: 'Failed to add product' });
  }
});

// Update product (admin)
app.put('/update-product/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: Number(req.params.id) },
      {
        $set: {
          name: req.body.name,
          image: req.body.image,
          category: req.body.category,
          price: Number(req.body.price),
          old_price: Number(req.body.old_price) || 0,
          description: req.body.description || '',
          stock: Number(req.body.stock),
          rating: Number(req.body.rating) || 5,
          availability: req.body.stock > 0
        }
      },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Remove product (admin)
app.post('/remove-product', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.body.id });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, name: product.name });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to remove product' });
  }
});

// ──────────────────────────────────────────
// Order Routes
// ──────────────────────────────────────────

// Place order
app.post('/place-order', async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (!items || !items.length)
      return res.status(400).json({ error: 'Cart is empty' });
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.address)
      return res.status(400).json({ error: 'Missing shipping details' });
    if (!paymentMethod)
      return res.status(400).json({ error: 'Missing payment method' });

    // Deduct stock for each purchased item
    for (const item of items) {
      await Product.findOneAndUpdate(
        { id: Number(item.id) },
        { $inc: { stock: -item.quantity } }
      );
    }

    // Generate order ID
    const lastOrder = await Order.findOne().sort({ id: -1 });
    const orderId = lastOrder ? lastOrder.id + 1 : 1001;

    const newOrder = new Order({
      id: orderId,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount: Number(totalAmount) || 0,
      status: 'Processing'
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// Get all orders (admin)
app.get('/all-orders', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ──────────────────────────────────────────
// Health check
// ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('AuraCommerce API is running ✅');
});

// ──────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────
app.listen(port, (error) => {
  if (error) {
    console.error('Error starting server:', error);
  } else {
    console.log(`Server is running on port ${port}`);
  }
});