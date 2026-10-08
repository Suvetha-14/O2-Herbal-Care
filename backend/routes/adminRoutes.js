import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Slider from '../models/Slider.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// @route   POST /api/admin/login
// @access  Public (Rate limited)
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/products
// @access  Private/Admin
router.post(
  '/products',
  protect,
  admin,
  [
    body('name', 'Name is required').trim().notEmpty(),
    body('category', 'Category is required').trim().notEmpty(),
    body('price', 'Price must be a positive number').isFloat({ min: 0 }),
    body('stock', 'Stock must be a non-negative integer').isInt({ min: 0 }),
    body('description', 'Description is required').trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const {
        name,
        category,
        price,
        discountPrice,
        stock,
        description,
        ingredients,
        skinType,
        hairType,
        images,
        image,
        order,
      } = req.body;

      const imageArray = Array.isArray(images) && images.length > 0 ? images : image ? [image] : [];

      const product = new Product({
        name,
        category,
        price: Number(price),
        discountPrice: Number(discountPrice || 0),
        stock: Number(stock),
        description,
        ingredients: ingredients || [],
        skinType: skinType || [],
        hairType: hairType || [],
        images: imageArray,
        order: order || 0,
        isActive: true,
      });

      await product.save();

      res.status(201).json({ success: true, message: 'Product created successfully', product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   PUT /api/admin/products/:id
// @access  Private/Admin
router.put('/products/:id', protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name,
      category,
      price,
      discountPrice,
      stock,
      description,
      ingredients,
      skinType,
      hairType,
      images,
      image,
      isActive,
      order,
    } = req.body;

    if (name) product.name = name;
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
    if (stock !== undefined) product.stock = Number(stock);
    if (description) product.description = description;
    if (ingredients) product.ingredients = ingredients;
    if (skinType) product.skinType = skinType;
    if (hairType) product.hairType = hairType;

    if (Array.isArray(images) && images.length > 0) {
      product.images = images;
    } else if (image) {
      product.images = [image];
    }

    if (isActive !== undefined) product.isActive = Boolean(isActive);
    if (order !== undefined) product.order = Number(order);

    await product.save();

    res.status(200).json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Soft delete (or hard delete if query ?hard=true)
// @access  Private/Admin
router.delete('/products/:id', protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const isHardDelete = req.query.hard === 'true';
    let product;

    if (isHardDelete) {
      product = await Product.findByIdAndDelete(req.params.id);
    } else {
      product = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: isHardDelete ? 'Product hard deleted successfully' : 'Product deactivated (soft deleted) successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/products
// @access  Private/Admin
router.get('/products', protect, admin, async (req, res) => {
  try {
    const products = await Product.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Phase 21: Meaningful Live MongoDB Dashboard Statistics
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    const totalCustomers = await User.countDocuments({ role: 'user' });

    // Aggregate total revenue for non-cancelled orders
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? Number(revenueResult[0].total.toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        lowStockProducts,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalCustomers,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SLIDER ROUTES

// @route   POST /api/admin/sliders
// @access  Private/Admin
router.post('/sliders', protect, admin, async (req, res) => {
  try {
    const { title, description, image, order } = req.body;

    if (!title || !description || !image) {
      return res.status(400).json({ success: false, message: 'Please provide title, description, and image' });
    }

    const slider = new Slider({
      title,
      description,
      image,
      order: order || 0,
    });

    await slider.save();

    res.status(201).json({ success: true, message: 'Slider created successfully', slider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/sliders
// @access  Private/Admin
router.get('/sliders', protect, admin, async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1 });
    res.status(200).json({ success: true, count: sliders.length, sliders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/sliders/:id
// @access  Private/Admin
router.put('/sliders/:id', protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid slider ID' });
    }

    let slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({ success: false, message: 'Slider not found' });
    }

    const { title, description, image, order, isActive } = req.body;

    if (title) slider.title = title;
    if (description) slider.description = description;
    if (image) slider.image = image;
    if (order !== undefined) slider.order = order;
    if (isActive !== undefined) slider.isActive = isActive;
    slider.updatedAt = new Date();

    await slider.save();

    res.status(200).json({ success: true, message: 'Slider updated successfully', slider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/sliders/:id
// @access  Private/Admin
router.delete('/sliders/:id', protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid slider ID' });
    }

    const slider = await Slider.findByIdAndDelete(req.params.id);

    if (!slider) {
      return res.status(404).json({ success: false, message: 'Slider not found' });
    }

    res.status(200).json({ success: true, message: 'Slider deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ORDERS ROUTES

// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name price images')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
router.put(
  '/orders/:id',
  protect,
  admin,
  [body('orderStatus', 'Valid order status is required').isIn(['Processing', 'Shipped', 'Delivered', 'Cancelled'])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { orderStatus, paymentStatus, isPaid } = req.body;

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid order ID' });
      }

      let order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (isPaid !== undefined) {
        order.isPaid = Boolean(isPaid);
        if (order.isPaid && !order.paidAt) {
          order.paidAt = new Date();
        }
      }

      await order.save();

      res.status(200).json({ success: true, message: 'Order updated successfully', order });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
