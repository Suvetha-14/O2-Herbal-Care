import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: [true, 'Email identifier is required'],
    lowercase: true,
    trim: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: [true, 'OTP hash is required'],
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // Automatically purged by MongoDB TTL when expiresAt is reached
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('OTP', otpSchema);
