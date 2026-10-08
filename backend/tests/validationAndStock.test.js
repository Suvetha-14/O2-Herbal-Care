import assert from 'assert';

console.log('🧪 Starting Order Validation & Stock Logic Unit Tests...\n');

// Test 1: Shipping Address Standardization & Completeness
{
  const validateAddress = (addr) => {
    const fullName = (addr.fullName || '').trim();
    const phone = (addr.phone || '').trim();
    const street = (addr.street || addr.address || '').trim();
    const city = (addr.city || '').trim();
    const state = (addr.state || '').trim();
    const postalCode = (addr.postalCode || addr.pincode || '').trim();
    const country = (addr.country || 'India').trim();

    const isValid = Boolean(fullName && phone && street && city && state && postalCode);
    return { isValid, standardized: { fullName, phone, street, city, state, postalCode, country } };
  };

  const validAddress = {
    fullName: 'Jane Doe',
    phone: '9876543210',
    street: '12 Green Park',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600001',
  };
  assert.strictEqual(validateAddress(validAddress).isValid, true, 'Valid address must pass validation');

  const legacyAddress = {
    fullName: 'John Doe',
    phone: '9876543211',
    address: '45 Rose Garden',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
  };
  const legacyResult = validateAddress(legacyAddress);
  assert.strictEqual(legacyResult.isValid, true, 'Legacy address property fallback should work');
  assert.strictEqual(legacyResult.standardized.street, '45 Rose Garden');
  assert.strictEqual(legacyResult.standardized.postalCode, '560001');

  const incompleteAddress = {
    fullName: 'Bob Smith',
    phone: '9876543212',
    street: '',
    city: 'Mumbai',
    state: 'Maharashtra',
  };
  assert.strictEqual(validateAddress(incompleteAddress).isValid, false, 'Missing street and postalCode must fail');
  console.log('✅ Test 1: Address standardization and validation passed.');
}

// Test 2: Stock Availability Logic (Preventing Over-Allocation)
{
  const checkStockSufficiency = (stock, requestedQty) => {
    if (typeof requestedQty !== 'number' || isNaN(requestedQty) || requestedQty <= 0) {
      return { allowed: false, reason: 'INVALID_QTY' };
    }
    if (stock < requestedQty) {
      return { allowed: false, reason: 'INSUFFICIENT_STOCK' };
    }
    return { allowed: true, remainingStock: stock - requestedQty };
  };

  assert.strictEqual(checkStockSufficiency(10, 5).allowed, true);
  assert.strictEqual(checkStockSufficiency(10, 5).remainingStock, 5);

  assert.strictEqual(checkStockSufficiency(2, 5).allowed, false);
  assert.strictEqual(checkStockSufficiency(2, 5).reason, 'INSUFFICIENT_STOCK');

  assert.strictEqual(checkStockSufficiency(10, 0).allowed, false);
  assert.strictEqual(checkStockSufficiency(10, -3).allowed, false);
  assert.strictEqual(checkStockSufficiency(10, 'abc').allowed, false);
  console.log('✅ Test 2: Stock sufficiency check passed.');
}

// Test 3: Cart Item Deduplication & Quantity Merging
{
  const mergeCartItems = (existingItems, incomingItems) => {
    const map = new Map();
    existingItems.forEach((item) => map.set(item.productId, item.quantity));

    incomingItems.forEach((item) => {
      const current = map.get(item.productId) || 0;
      map.set(item.productId, current + item.quantity);
    });

    return Array.from(map.entries()).map(([productId, quantity]) => ({ productId, quantity }));
  };

  const existing = [
    { productId: 'prod_1', quantity: 2 },
    { productId: 'prod_2', quantity: 1 },
  ];
  const incoming = [
    { productId: 'prod_1', quantity: 3 },
    { productId: 'prod_3', quantity: 1 },
  ];

  const merged = mergeCartItems(existing, incoming);
  assert.strictEqual(merged.length, 3, 'Should contain 3 unique products');
  assert.strictEqual(merged.find((i) => i.productId === 'prod_1').quantity, 5, 'prod_1 should merge to qty 5');
  assert.strictEqual(merged.find((i) => i.productId === 'prod_2').quantity, 1, 'prod_2 should remain qty 1');
  assert.strictEqual(merged.find((i) => i.productId === 'prod_3').quantity, 1, 'prod_3 should be added with qty 1');
  console.log('✅ Test 3: Cart item deduplication and merge passed.');
}

console.log('\n🎉 All Order Validation & Stock Logic Unit Tests Passed Successfully!');
