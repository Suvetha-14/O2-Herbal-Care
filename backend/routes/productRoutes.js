import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;

    const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let filter = { isActive: true };

    if (category && typeof category === 'string' && category.toLowerCase() !== 'all') {
      const sanitizedCat = escapeRegex(category.trim().slice(0, 50));
      filter.category = new RegExp(`^${sanitizedCat}$`, 'i');
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(Number(minPrice))) filter.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) filter.price.$lte = Number(maxPrice);
    }

    if (search && typeof search === 'string') {
      const sanitizedSearch = escapeRegex(search.trim().slice(0, 100));
      if (sanitizedSearch) {
        filter.$or = [
          { name: { $regex: sanitizedSearch, $options: 'i' } },
          { description: { $regex: sanitizedSearch, $options: 'i' } },
          { category: { $regex: sanitizedSearch, $options: 'i' } },
        ];
      }
    }

    const products = await Product.find(filter)
      .select('-reviews')
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }

    // Fallback search by slugified name if requested by legacy URL
    if (!product) {
      const allProducts = await Product.find();
      const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      product = allProducts.find((p) => p._id.toString() === id || slugify(p.name) === id);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/products/:id/review
// @access  Private (FIXED in Phase 8 & 9: protect middleware attached)
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment, userName } = req.body;

    if (!rating || !comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    if (comment.trim().length > 500) {
      return res.status(400).json({ success: false, message: 'Review comment cannot exceed 500 characters' });
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
    }

    let product;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findById(req.params.id);
    } else {
      const allProducts = await Product.find();
      const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      product = allProducts.find((p) => slugify(p.name) === req.params.id);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Prevent duplicate reviews for the same product by the same user
    const alreadyReviewed = product.reviews.find(
      (r) => r.user && r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this product' });
    }

    const review = {
      user: req.user._id,
      userName: req.user.name || 'Verified Customer',
      rating: parsedRating,
      comment: comment.trim(),
      createdAt: new Date(),
    };

    product.reviews.push(review);
    await product.save();

    res.status(201).json({ success: true, message: 'Review added successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/products/:id/review/:reviewId
// @access  Private (User can delete own review, Admin can delete any review)
router.delete('/:id/review/:reviewId', protect, async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID format' });
    }

    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else {
      const allProducts = await Product.find();
      const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      product = allProducts.find((p) => slugify(p.name) === id);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Authorization check
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    product.reviews.pull({ _id: reviewId });
    await product.save();

    res.status(200).json({ success: true, message: 'Review deleted successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
