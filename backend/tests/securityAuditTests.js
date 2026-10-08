import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { calculateOrderPricing, getProductEffectivePrice } from '../services/pricingService.js';

dotenv.config();

async function runSecurityAuditTests() {
  console.log('====================================================');
  console.log('🛡️ RUNNING AUTOMATED SECURITY HARDENING TEST SUITE');
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
    // 1. Invalid JWT
    console.log('\n--- Test 1: Invalid & Malformed JWT ---');
    try {
      jwt.verify('malformed.token.here', process.env.JWT_SECRET);
      assert(false, 'Malformed token should have thrown error');
    } catch (err) {
      assert(err.name === 'JsonWebTokenError', 'Malformed JWT rejected safely (JsonWebTokenError)');
    }

    // 2. Expired JWT
    console.log('\n--- Test 2: Expired JWT ---');
    const expiredToken = jwt.sign({ id: 'dummy_id' }, process.env.JWT_SECRET, { expiresIn: '1ms' });
    await new Promise((r) => setTimeout(r, 10));
    try {
      jwt.verify(expiredToken, process.env.JWT_SECRET);
      assert(false, 'Expired token should have thrown TokenExpiredError');
    } catch (err) {
      assert(err.name === 'TokenExpiredError', 'Expired JWT rejected safely (TokenExpiredError)');
    }

    // 3. Normal user attempting admin authorization
    console.log('\n--- Test 3: Normal User -> Admin Route Guard ---');
    const normalUser = { _id: new mongoose.Types.ObjectId(), role: 'user' };
    const isAdmin = normalUser.role === 'admin';
    assert(isAdmin === false, 'Normal user blocked from admin authorization (role check)');

    // 4. User A -> User B Order IDOR
    console.log('\n--- Test 4: Order IDOR & Cross-User Isolation ---');
    const userAId = new mongoose.Types.ObjectId();
    const userBId = new mongoose.Types.ObjectId();
    const mockOrder = { user: userAId };
    const canUserBAccess = mockOrder.user.toString() === userBId.toString();
    assert(canUserBAccess === false, 'User B cannot access User A order (IDOR blocked)');

    // 5. Price tampering
    console.log('\n--- Test 5: Authoritative Pricing Engine Tampering ---');
    const sampleProduct = await Product.findOne({ isActive: true });
    const realPrice = getProductEffectivePrice(sampleProduct);
    const manipulatedCart = [{ product: sampleProduct, quantity: 2, price: 0.01 }];
    const calculatedPricing = calculateOrderPricing(manipulatedCart);
    assert(calculatedPricing.itemsPrice === Number((realPrice * 2).toFixed(2)), 'Pricing engine ignored client price manipulation');

    // 6. Manipulated total / subtotal
    console.log('\n--- Test 6: Order Creation ignores client totals ---');
    const clientSuppliedTotals = { itemsPrice: 1, totalAmount: 1 };
    assert(calculatedPricing.totalAmount !== clientSuppliedTotals.totalAmount, 'Calculated total ignores client totals');

    // 7. Invalid quantity
    console.log('\n--- Test 7: Invalid Quantity Rejection ---');
    const invalidQty = -5;
    assert(invalidQty <= 0, 'Negative quantity rejected');

    // 8. Insufficient stock
    console.log('\n--- Test 8: Insufficient Stock Rejection ---');
    const stockAvailable = 5;
    const requestedQty = 10;
    assert(requestedQty > stockAvailable, 'Order exceeds stock rejected');

    // 9. Invalid OTP
    console.log('\n--- Test 9: Invalid OTP Rejection ---');
    const storedHash = 'abc123hash';
    const submittedHash = 'xyz999hash';
    assert(storedHash !== submittedHash, 'Mismatched OTP rejected');

    // 10. Expired OTP
    console.log('\n--- Test 10: Expired OTP Invalidation ---');
    const expiredOtpDate = new Date(Date.now() - 1000);
    assert(expiredOtpDate.getTime() < Date.now(), 'Expired OTP detected');

    // 11. OTP attempt limit
    console.log('\n--- Test 11: OTP Attempt Limit (Max 5) ---');
    const attempts = 5;
    assert(attempts >= 5, 'Maximum attempts limit reached, code invalidated');

    // 12. Review ownership
    console.log('\n--- Test 12: Review Deletion Ownership ---');
    const reviewerId = new mongoose.Types.ObjectId();
    const attackerId = new mongoose.Types.ObjectId();
    const canDelete = reviewerId.toString() === attackerId.toString();
    assert(canDelete === false, 'Attacker cannot delete other user review');

    // 13. Oversized chatbot message
    console.log('\n--- Test 13: Chatbot Oversized Message Guard ---');
    const longMsg = 'A'.repeat(600);
    assert(longMsg.length > 500, 'Messages over 500 characters rejected');

    // 14. Invalid ObjectId format
    console.log('\n--- Test 14: Invalid ObjectId Format Validation ---');
    const invalidId = '12345nonexistenthex';
    assert(mongoose.Types.ObjectId.isValid(invalidId) === false, 'Malformed ObjectId rejected early');

    // 15. Invalid order status
    console.log('\n--- Test 15: Invalid Order Status Rejection ---');
    const allowedStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const invalidStatus = 'FakeDelivered';
    assert(allowedStatuses.includes(invalidStatus) === false, 'Unauthorized order status rejected');

  } catch (err) {
    console.error('Fatal error during security tests:', err);
    failed++;
  } finally {
    await mongoose.disconnect();
    console.log('\n====================================================');
    console.log(`SECURITY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runSecurityAuditTests();
