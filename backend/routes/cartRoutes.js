import express from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';
import { body, validationResult } from 'express-validator';
import { calculateOrderPricing, getProductEffectivePrice } from '../services/pricingService.js';

const router = express.Router();

/**
 * Format cart response with populated products & authoritative pricing calculations
 */
async function getFormattedCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name price discountPrice stock images image category isActive',
  });

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
    await cart.save();
  }

  // Filter out any items whose product has been hard-deleted or deactivated
  const validItems = cart.items.filter((item) => item.product && item.product.isActive !== false);

  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  // Calculate pricing using canonical service
  const itemsForPricing = cart.items.map((item) => ({
    product: item.product,
    price: getProductEffectivePrice(item.product),
    quantity: item.quantity,
  }));

  const pricing = calculateOrderPricing(itemsForPricing);

  return {
    _id: cart._id,
    user: cart.user,
    items: cart.items.map((item) => {
      const effectivePrice = getProductEffectivePrice(item.product);
      return {
        _id: item._id,
        product: item.product,
        quantity: item.quantity,
        price: effectivePrice,
        totalPrice: Number((effectivePrice * item.quantity).toFixed(2)),
      };
    }),
    ...pricing,
    updatedAt: cart.updatedAt,
  };
}

// @route   GET /api/cart
// @desc    Get current user's backend cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const formattedCart = await getFormattedCart(req.user._id);
    res.status(200).json({ success: true, cart: formattedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to backend cart
// @access  Private
router.post(
  '/add',
  protect,
  [
    body('productId', 'Product ID is required').notEmpty(),
    body('quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { productId, quantity } = req.body;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID' });
      }

      const product = await Product.findById(productId);
      if (!product || product.isActive === false) {
        return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
      }

      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      const effectivePrice = getProductEffectivePrice(product);
      const existingItem = cart.items.find((item) => item.product.toString() === productId.toString());
      const newQuantity = existingItem ? existingItem.quantity + Number(quantity) : Number(quantity);

      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }

      if (existingItem) {
        existingItem.quantity = newQuantity;
        existingItem.price = effectivePrice;
      } else {
        cart.items.push({
          product: productId,
          productName: product.name,
          quantity: Number(quantity),
          price: effectivePrice,
          image: product.image || (product.images && product.images[0]) || '',
          category: product.category,
        });
      }

      await cart.save();
      const formattedCart = await getFormattedCart(userId);

      res.status(200).json({
        success: true,
        message: 'Item added to cart',
        cart: formattedCart,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   POST /api/cart/merge
// @desc    Merge guest cart items into authenticated user's database cart upon login
// @access  Private
router.post('/merge', protect, async (req, res) => {
  try {
    const { items = [] } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const pId = item._id || item.productId || item.product;
        if (!pId || !mongoose.Types.ObjectId.isValid(pId)) continue;

        const qty = parseInt(item.quantity, 10);
        if (isNaN(qty) || qty <= 0) continue;

        const product = await Product.findById(pId);
        if (!product || product.isActive === false) continue;

        const existingItem = cart.items.find((ci) => ci.product.toString() === pId.toString());
        const effectivePrice = getProductEffectivePrice(product);

        if (existingItem) {
          const combinedQty = Math.min(product.stock, existingItem.quantity + qty);
          existingItem.quantity = combinedQty;
          existingItem.price = effectivePrice;
        } else {
          const initialQty = Math.min(product.stock, qty);
          if (initialQty > 0) {
            cart.items.push({
              product: product._id,
              productName: product.name,
              quantity: initialQty,
              price: effectivePrice,
              image: product.image || (product.images && product.images[0]) || '',
              category: product.category,
            });
          }
        }
      }
      await cart.save();
    }

    const formattedCart = await getFormattedCart(userId);
    res.status(200).json({
      success: true,
      message: 'Cart merged successfully',
      cart: formattedCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/cart/update/:productId
// @desc    Update item quantity in backend cart
// @access  Private
router.put(
  '/update/:productId',
  protect,
  [body('quantity', 'Quantity must be at least 1').isInt({ min: 1 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID' });
      }

      const product = await Product.findById(productId);
      if (!product || product.isActive === false) {
        return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }

      const cartItem = cart.items.find((item) => item.product.toString() === productId.toString());
      if (!cartItem) {
        return res.status(404).json({ success: false, message: 'Item not found in cart' });
      }

      cartItem.quantity = Number(quantity);
      cartItem.price = getProductEffectivePrice(product);

      await cart.save();
      const formattedCart = await getFormattedCart(userId);

      res.status(200).json({
        success: true,
        message: 'Cart updated',
        cart: formattedCart,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from backend cart
// @access  Private
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId.toString());
    await cart.save();

    const formattedCart = await getFormattedCart(userId);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: formattedCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire backend cart
// @access  Private
router.delete('/clear', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    const formattedCart = await getFormattedCart(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: formattedCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
