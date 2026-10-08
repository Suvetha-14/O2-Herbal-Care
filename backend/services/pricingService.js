/**
 * O2 Herbal Care - Canonical Pricing Engine Service
 *
 * Single source of truth for all pricing calculations across cart, checkout,
 * and order processing. Prevents client-side price tampering.
 */

/**
 * Resolves the true authoritative selling price of a product.
 * If a valid discountPrice exists (greater than 0 and less than regular price),
 * it is used as the active selling price. Otherwise regular price is used.
 */
export function getProductEffectivePrice(product) {
  if (!product) return 0;
  const regularPrice = Number(product.price) || 0;
  const discountPrice = Number(product.discountPrice) || 0;

  if (discountPrice > 0 && discountPrice < regularPrice) {
    return Number(discountPrice.toFixed(2));
  }
  return Number(regularPrice.toFixed(2));
}

/**
 * Computes canonical pricing breakdown for a list of items:
 * [{ product: Object | { price, discountPrice }, quantity: Number }]
 *
 * Business Rules:
 * - Tier Discounts based on subtotal:
 *     >= ₹2000: ₹200 discount
 *     >= ₹1500: ₹150 discount
 *     >= ₹1000: ₹100 discount
 *     >= ₹500:  ₹50 discount
 * - Shipping Policy:
 *     Free shipping for orders ₹500 and above (or 0 cart)
 *     Flat ₹50 shipping fee for orders below ₹500
 * - Tax:
 *     ₹0 (GST included in retail price)
 * - Grand Total:
 *     Math.max(0, subtotal - discount + shipping + tax)
 */
export function calculateOrderPricing(items = []) {
  if (!Array.isArray(items)) {
    items = [];
  }

  const itemsPrice = items.reduce((sum, item) => {
    // Resolve effective unit price from product doc (if populated with price) or item itself
    let unitPrice = 0;
    if (
      item.product &&
      typeof item.product === 'object' &&
      (typeof item.product.price !== 'undefined' || typeof item.product.discountPrice !== 'undefined')
    ) {
      unitPrice = getProductEffectivePrice(item.product);
    } else if (item.price !== undefined) {
      unitPrice = Number(item.price) || 0;
    }

    const qty = parseInt(item.quantity, 10) || 0;
    return sum + unitPrice * qty;
  }, 0);

  let discountAmount = 0;
  if (itemsPrice >= 2000) {
    discountAmount = 200;
  } else if (itemsPrice >= 1500) {
    discountAmount = 150;
  } else if (itemsPrice >= 1000) {
    discountAmount = 100;
  } else if (itemsPrice >= 500) {
    discountAmount = 50;
  }

  // Orders >= 500 get Free Shipping; under 500 is flat 50
  const shippingPrice = itemsPrice >= 500 || itemsPrice === 0 ? 0 : 50;
  const taxPrice = 0;
  const totalAmount = Math.max(0, itemsPrice - discountAmount + shippingPrice + taxPrice);

  return {
    itemsPrice: Number(itemsPrice.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    shippingPrice: Number(shippingPrice.toFixed(2)),
    taxPrice: Number(taxPrice.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}

export default {
  getProductEffectivePrice,
  calculateOrderPricing,
};
