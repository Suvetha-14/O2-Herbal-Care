import assert from 'assert';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

console.log('🧪 Starting Security & Authentication Unit Tests...\n');

// Test 1: OTP HMAC-SHA256 Hashing
{
  const secret = 'test_secret_key_123';
  const otp = '849201';

  const hash1 = crypto.createHmac('sha256', secret).update(otp).digest('hex');
  const hash2 = crypto.createHmac('sha256', secret).update(otp).digest('hex');
  const differentHash = crypto.createHmac('sha256', secret).update('111111').digest('hex');

  assert.strictEqual(hash1, hash2, 'Identical OTP and secret must produce identical HMAC hash');
  assert.notStrictEqual(hash1, differentHash, 'Different OTPs must produce different hashes');
  assert.strictEqual(hash1.length, 64, 'HMAC-SHA256 hex string should be 64 characters');
  console.log('✅ Test 1: HMAC-SHA256 OTP hashing passed.');
}

// Test 2: Password hashing and verification with bcryptjs
{
  const plainPassword = 'securePassword123!';
  const salt = bcryptjs.genSaltSync(10);
  const hashedPassword = bcryptjs.hashSync(plainPassword, salt);

  assert.notStrictEqual(plainPassword, hashedPassword, 'Password must be hashed, never plaintext');
  assert.strictEqual(bcryptjs.compareSync(plainPassword, hashedPassword), true, 'Correct password must match hash');
  assert.strictEqual(bcryptjs.compareSync('wrongPassword', hashedPassword), false, 'Incorrect password must be rejected');
  console.log('✅ Test 2: Bcrypt password hashing & verification passed.');
}

// Test 3: JWT token generation and claims verification
{
  const jwtSecret = 'o2_herbal_jwt_test_secret';
  const payload = { id: '64d8f1e29c0b1a234567890a', role: 'admin' };
  const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

  assert.strictEqual(typeof token, 'string', 'JWT should be a string');
  assert.strictEqual(token.split('.').length, 3, 'JWT should contain header, payload, and signature');

  const decoded = jwt.verify(token, jwtSecret);
  assert.strictEqual(decoded.id, payload.id, 'Decoded user ID must match payload');
  assert.strictEqual(decoded.role, payload.role, 'Decoded role must match payload');

  // Verify invalid signature rejection
  assert.throws(() => {
    jwt.verify(token, 'wrong_jwt_secret');
  }, /invalid signature/, 'Tampered/wrong secret must fail verification');
  console.log('✅ Test 3: JWT signing and signature verification passed.');
}

// Test 4: Password reset token generation and SHA-256 hash verification
{
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash1 = crypto.createHash('sha256').update(rawToken).digest('hex');
  const tokenHash2 = crypto.createHash('sha256').update(rawToken).digest('hex');
  const differentHash = crypto.createHash('sha256').update('different_token').digest('hex');

  assert.strictEqual(rawToken.length, 64, 'Raw token should be a 64-character hex string');
  assert.strictEqual(tokenHash1, tokenHash2, 'Same raw token must produce matching SHA-256 hash');
  assert.notStrictEqual(tokenHash1, differentHash, 'Different tokens must yield different hashes');
  console.log('✅ Test 4: Password reset token hashing & verification passed.');
}

console.log('\n🎉 All Security & Auth Unit Tests Passed Successfully!');
