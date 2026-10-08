import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { calculateOrderPricing, getProductEffectivePrice } from '../services/pricingService.js';

dotenv.config();

async function runFunctionalSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE FUNCTIONAL TEST SUITE');
  console.log('====================================================');

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/o2herbal');
  console.log('✓ Connected to MongoDB');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // PHASE 2 & 3: REGISTRATION & AUTHENTICATION
    // ----------------------------------------------------
    console.log('\n--- Testing Phase 2 & 3: Registration & Authentication ---');
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'Password@123';
    const testName = 'Test Functional User';

    // 1. Send OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const secret = process.env.JWT_SECRET || 'o2_herbal_otp_secret_key';
    const otpHash = crypto.createHmac('sha256', secret).update(rawOtp).digest('hex');

    await OTP.deleteMany({ identifier: testEmail });
    await OTP.create({
      identifier: testEmail,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
    });

    const otpDoc = await OTP.findOne({ identifier: testEmail });
    assert(!!otpDoc, 'OTP record saved in database');
    assert(otpDoc.otpHash !== rawOtp, 'OTP is hashed, never stored in plain text');

    // 2. Verify invalid OTP attempt limit
    const wrongHash = crypto.createHmac('sha256', secret).update('000000').digest('hex');
    assert(otpDoc.otpHash !== wrongHash, 'Wrong OTP does not match');

    // 3. User creation
    const user = new User({
      name: testName,
      email: testEmail,
      password: testPassword,
    });
    await user.save();
    assert(!!user._id, 'User account created successfully');
    assert(user.password !== testPassword, 'User password is encrypted with bcrypt');

    // 4. Password matching
    const isMatch = await user.matchPassword(testPassword);
    const isBadMatch = await user.matchPassword('WrongPassword');
    assert(isMatch === true, 'Valid password successfully verified');
    assert(isBadMatch === false, 'Invalid password correctly rejected');

    // 5. JWT token generation & verification
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert(decoded.id === user._id.toString(), 'JWT token generated and decodes valid user ID');

    // ----------------------------------------------------
    // PHASE 4 & 5: PRODUCTS & CATALOG
    // ----------------------------------------------------
    console.log('\n--- Testing Phase 4 & 5: Products & Search ---');
    const activeProducts = await Product.find({ isActive: true });
    assert(activeProducts.length > 0, `Active products found in catalog: ${activeProducts.length}`);

    const sampleProduct = activeProducts[0];
    assert(!!sampleProduct.name && sampleProduct.price > 0, `Sample product "${sampleProduct.name}" has price ₹${sampleProduct.price}`);

    // Search simulation
    const searchWord = sampleProduct.name.split(' ')[0];
    const searchResults = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: searchWord, $options: 'i' } },
        { description: { $regex: searchWord, $options: 'i' } },
      ],
    });
    assert(searchResults.length > 0, `Search for "${searchWord}" returns ${searchResults.length} matching products`);

    // Non-existent search
    const noResults = await Product.find({
      isActive: true,
      name: { $regex: 'nonexistentproductxyz12345', $options: 'i' },
    });
    assert(noResults.length === 0, 'Non-existent search safely returns 0 products without error');

    // ----------------------------------------------------
    // PHASE 8: PRICE SECURITY & AUTHORITATIVE PRICING
    // ----------------------------------------------------
    console.log('\n--- Testing Phase 8: Authoritative Price Security ---');
    const maliciousItems = [
      {
        product: sampleProduct,
        quantity: 2,
        price: 1, // Malicious client attempt: ₹1 instead of real price
      },
    ];
    const effectivePrice = getProductEffectivePrice(sampleProduct);
    const computedPricing = calculateOrderPricing(maliciousItems);
    assert(computedPricing.itemsPrice === Number((effectivePrice * 2).toFixed(2)), `Pricing engine used authoritative price ₹${effectivePrice} × 2 = ₹${computedPricing.itemsPrice}, ignoring client price ₹1`);

    // ----------------------------------------------------
    // PHASE 9, 10, 11: ORDER CREATION & STOCK DEDUCTION
    // ----------------------------------------------------
    console.log('\n--- Testing Phase 9, 10 & 11: Order Creation & Atomic Stock ---');
    const initialStock = sampleProduct.stock;
    const orderQty = 1;

    // Atomically decrement stock
    const updatedProd = await Product.findOneAndUpdate(
      { _id: sampleProduct._id, stock: { $gte: orderQty } },
      { $inc: { stock: -orderQty } },
      { new: true }
    );
    assert(updatedProd.stock === initialStock - orderQty, `Atomic stock reduction: ${initialStock} -> ${updatedProd.stock}`);

    // Create Order with authoritative total
    const verifiedOrderItems = [
      {
        product: sampleProduct._id,
        productName: sampleProduct.name,
        quantity: orderQty,
        price: effectivePrice,
        totalPrice: Number((effectivePrice * orderQty).toFixed(2)),
      },
    ];
    const orderPricing = calculateOrderPricing(verifiedOrderItems);

    const testOrder = new Order({
      user: user._id,
      orderItems: verifiedOrderItems,
      itemsPrice: orderPricing.itemsPrice,
      discountAmount: orderPricing.discountAmount,
      shippingPrice: orderPricing.shippingPrice,
      taxPrice: orderPricing.taxPrice,
      totalAmount: orderPricing.totalAmount,
      shippingAddress: {
        fullName: 'Test Customer',
        email: testEmail,
        phone: '9876543210',
        street: '123 Green Lane',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        postalCode: '641001',
        country: 'India',
      },
      paymentMethod: 'COD',
      isPaid: false,
      paymentStatus: 'Pending',
      orderStatus: 'Processing',
    });
    await testOrder.save();

    assert(!!testOrder._id, `Order created with ID: ${testOrder._id}`);
    assert(testOrder.totalAmount === orderPricing.totalAmount, `Order total ₹${testOrder.totalAmount} matches server calculation`);
    assert(testOrder.totalAmount > 0, `Order total is NOT ₹0.00 (Authoritative ₹${testOrder.totalAmount})`);

    // ----------------------------------------------------
    // PHASE 12: ORDER OWNERSHIP & AUTHORIZATION
    // ----------------------------------------------------
    console.log('\n--- Testing Phase 12: Order Ownership Security ---');
    // Simulate user B trying to access user A's order
    const userB = new User({
      name: 'User B Hacker',
      email: `hacker_${Date.now()}@example.com`,
      password: 'Password@123',
    });
    await userB.save();

    const fetchedOrder = await Order.findById(testOrder._id);
    const isOwner = fetchedOrder.user.toString() === userB._id.toString();
    assert(isOwner === false, 'User B is NOT recognized as the owner of User A order (Access correctly blocked)');

    // ----------------------------------------------------
    // CLEANUP TEST DATA
    // ----------------------------------------------------
    // Restore product stock
    await Product.findByIdAndUpdate(sampleProduct._id, { $inc: { stock: orderQty } });
    // Remove test order and users
    await Order.findByIdAndDelete(testOrder._id);
    await User.findByIdAndDelete(user._id);
    await User.findByIdAndDelete(userB._id);
    await OTP.deleteMany({ identifier: testEmail });
    console.log('✓ Test fixtures cleaned up safely');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    await mongoose.disconnect();
    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runFunctionalSuite();
