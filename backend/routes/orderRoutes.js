import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';
import { calculateOrderPricing, getProductEffectivePrice } from '../services/pricingService.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order with server-side pricing engine & atomic stock protection
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod = 'COD', notes = '' } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // Standardize address fields with fallbacks for legacy property names
    const fullName = (shippingAddress.fullName || '').trim();
    const phone = (shippingAddress.phone || '').trim();
    const street = (shippingAddress.street || shippingAddress.address || '').trim();
    const city = (shippingAddress.city || '').trim();
    const state = (shippingAddress.state || '').trim();
    const postalCode = (shippingAddress.postalCode || shippingAddress.pincode || '').trim();
    const country = (shippingAddress.country || 'India').trim();
    const email = (shippingAddress.email || req.user.email || '').trim();

    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address (fullName, phone, street, city, state, postalCode) is required',
      });
    }

    const normalizedPaymentMethod = ['COD', 'CARD', 'UPI'].includes(String(paymentMethod).toUpperCase())
      ? String(paymentMethod).toUpperCase()
      : 'COD';

    // Verify all products from MongoDB; never trust client-provided price or totals
    const verifiedOrderItems = [];
    const productsToUpdate = [];

    for (const item of orderItems) {
      const pId = item.product || item.productId || item._id;
      if (!pId || !mongoose.Types.ObjectId.isValid(pId)) {
        return res.status(400).json({ success: false, message: `Invalid product ID: ${pId}` });
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
      }

      const product = await Product.findById(pId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found in store catalog' });
      }

      if (!product.isActive) {
        return res.status(400).json({ success: false, message: `Product "${product.name}" is currently unavailable` });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${qty}`,
        });
      }

      const effectivePrice = getProductEffectivePrice(product);

      verifiedOrderItems.push({
        product: product._id,
        productName: product.name,
        quantity: qty,
        price: effectivePrice,
        totalPrice: Number((effectivePrice * qty).toFixed(2)),
      });

      productsToUpdate.push({ product, qty });
    }

    // Server-side authoritative calculation
    const pricing = calculateOrderPricing(verifiedOrderItems);

    // Atomic Stock Deduction with Compensation Rollback
    const updatedProductsHistory = [];
    try {
      for (const item of productsToUpdate) {
        const { product, qty } = item;

        // Atomically decrement stock only if stock >= qty
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true }
        );

        if (!updatedProduct) {
          throw new Error(
            `Stock conflict for "${product.name}". The remaining stock may have just been purchased by another customer. Please refresh your cart.`
          );
        }

        updatedProductsHistory.push({ productId: product._id, qtyAddedBack: qty });
      }

      // Create Order in MongoDB
      const isPaid = false; // Only actual verified payment gateway webhook would set this to true
      const order = new Order({
        user: req.user._id,
        orderItems: verifiedOrderItems,
        itemsPrice: pricing.itemsPrice,
        discountAmount: pricing.discountAmount,
        shippingPrice: pricing.shippingPrice,
        taxPrice: pricing.taxPrice,
        totalAmount: pricing.totalAmount,
        shippingAddress: {
          fullName,
          email,
          phone,
          street,
          city,
          state,
          postalCode,
          country,
        },
        paymentMethod: normalizedPaymentMethod,
        isPaid,
        paymentStatus: 'Pending',
        orderStatus: 'Processing',
        notes: notes || '',
      });

      await order.save();
      await order.populate('orderItems.product', 'name images price discountPrice category');

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order,
      });
    } catch (orderError) {
      // Manual Rollback if stock deduction or order save failed
      for (const historyItem of updatedProductsHistory) {
        await Product.findByIdAndUpdate(historyItem.productId, {
          $inc: { stock: historyItem.qtyAddedBack },
        });
      }
      throw orderError;
    }
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to process order' });
  }
});

// @route   GET /api/orders/user
// @desc    Get logged in user's orders
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name images price discountPrice category')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images price discountPrice category');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
