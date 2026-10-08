import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: String,
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  image: String,
  category: String,
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
cartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Cart', cartSchema);
