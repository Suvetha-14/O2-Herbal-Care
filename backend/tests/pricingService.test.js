import assert from 'assert';
import { calculateOrderPricing, getProductEffectivePrice } from '../services/pricingService.js';

console.log('🧪 Starting Pricing Engine Unit Tests...\n');

// Test 1: getProductEffectivePrice
{
  const productWithDiscount = { price: 200, discountPrice: 160 };
  assert.strictEqual(getProductEffectivePrice(productWithDiscount), 160, 'Should use discountPrice when valid');

  const productWithoutDiscount = { price: 250, discountPrice: 0 };
  assert.strictEqual(getProductEffectivePrice(productWithoutDiscount), 250, 'Should use regular price when discountPrice is 0');

  const productWithInvalidDiscount = { price: 150, discountPrice: 200 };
  assert.strictEqual(getProductEffectivePrice(productWithInvalidDiscount), 150, 'Should not use discountPrice when higher than price');
  console.log('✅ Test 1: getProductEffectivePrice passed.');
}

// Test 2: calculateOrderPricing - Tier >= 2000 & Free Shipping
{
  const items = [
    { product: { price: 1000, discountPrice: 0 }, quantity: 2 }, // 2000
    { product: { price: 300, discountPrice: 250 }, quantity: 1 },  // 250 -> subtotal 2250
  ];
  const pricing = calculateOrderPricing(items);
  assert.strictEqual(pricing.itemsPrice, 2250, 'Subtotal should be 2250');
  assert.strictEqual(pricing.discountAmount, 200, 'Tier discount should be 200 for subtotal >= 2000');
  assert.strictEqual(pricing.shippingPrice, 0, 'Shipping should be free for subtotal >= 500');
  assert.strictEqual(pricing.totalAmount, 2050, 'Grand total should be 2250 - 200 + 0 = 2050');
  console.log('✅ Test 2: Tier >= 2000 passed.');
}

// Test 3: calculateOrderPricing - Subtotal < 500 with Flat Shipping Fee (₹50)
{
  const items = [
    { product: { price: 200, discountPrice: 0 }, quantity: 2 }, // 400
  ];
  const pricing = calculateOrderPricing(items);
  assert.strictEqual(pricing.itemsPrice, 400, 'Subtotal should be 400');
  assert.strictEqual(pricing.discountAmount, 0, 'Discount should be 0 for subtotal < 500');
  assert.strictEqual(pricing.shippingPrice, 50, 'Shipping should be 50 for subtotal < 500');
  assert.strictEqual(pricing.totalAmount, 450, 'Grand total should be 400 + 50 = 450');
  console.log('✅ Test 3: Subtotal < 500 with shipping passed.');
}

// Test 4: Empty items
{
  const pricing = calculateOrderPricing([]);
  assert.strictEqual(pricing.itemsPrice, 0);
  assert.strictEqual(pricing.discountAmount, 0);
  assert.strictEqual(pricing.shippingPrice, 0);
  assert.strictEqual(pricing.totalAmount, 0);
  console.log('✅ Test 4: Empty items passed.');
}

// Test 5: calculateOrderPricing - Items where product is an ObjectId reference (not populated object)
{
  const items = [
    { product: { _bsontype: 'ObjectId', id: Buffer.from('6ac772e56da3ef80a46e6b07', 'hex') }, price: 200, quantity: 1 },
  ];
  const pricing = calculateOrderPricing(items);
  assert.strictEqual(pricing.itemsPrice, 200, 'Subtotal should be 200');
  assert.strictEqual(pricing.shippingPrice, 50, 'Shipping should be 50 for subtotal < 500');
  assert.strictEqual(pricing.totalAmount, 250, 'Grand total should be 200 + 50 = 250');
  console.log('✅ Test 5: Items with ObjectId reference passed.');
}

console.log('\n🎉 All Pricing Service Unit Tests Passed Successfully!');
