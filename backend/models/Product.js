import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxLength: 200,
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      default: 'Uncategorized',
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: 0,
      default: 0,
    },
    ingredients: [
      {
        type: String,
      },
    ],
    skinType: [
      {
        type: String,
      },
    ],
    hairType: [
      {
        type: String,
      },
    ],
    images: {
      type: [String],
      default: [],
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for `image` to maintain full frontend compatibility
productSchema.virtual('image').get(function () {
  return Array.isArray(this.images) && this.images.length > 0 ? this.images[0] : '';
});

// Auto-calculate average rating on save
productSchema.pre('save', function (next) {
  if (!this.reviews || this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = Number((totalRating / this.reviews.length).toFixed(1));
    this.numReviews = this.reviews.length;
  }
  next();
});

// Performance indexes for catalog queries, filtering, and text search
productSchema.index({ isActive: 1, category: 1 });
productSchema.index({ isActive: 1, price: 1 });
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
