// Static knowledge base for the O2 Herbal Care shopping-assistant chatbot.
// This keeps store policy answers and concern -> product mapping consistent
// and reliable, instead of relying purely on the LLM to "remember" them.

export const STORE_FAQS = {
  shipping:
    'We offer free shipping on all orders above ₹500. Orders below ₹500 have a flat ₹50 shipping fee. Orders are dispatched within 24-48 hours of confirmation. You also get tier discounts starting at ₹500 (up to ₹200 off)!',
  delivery:
    'Standard delivery takes 3-6 business days depending on your location. Metro cities usually receive orders within 2-4 days. You can track your order from the "My Orders" section after logging in.',
  returns:
    'We accept returns within 7 days of delivery for unopened, unused products in their original packaging. Simply raise a return request from your order history or contact our support team.',
  refunds:
    'Once a returned product is received and inspected, refunds are processed within 5-7 business days to the original payment method. For prepaid orders, refunds go back to the same account/card.',
  payment:
    'We currently accept Cash on Delivery (COD) across India. Online card and UPI payments are coming soon via secure payment gateway integration.',
  contact:
    "You can reach O2 Herbal Care support through the Contact page on our website, and we'll get back to you as soon as possible.",
};

// Maps common skin/hair concerns to relevant product categories and keywords
// so we can reliably surface the right products regardless of how the LLM
// phrases its answer.
export const CONCERN_MAP = [
  {
    concern: 'hair fall',
    keywords: ['hair fall', 'hairfall', 'hair loss', 'thinning hair', 'falling hair'],
    categories: ['Hair Oil', 'Herbal Shampoo'],
    preferredNames: ['Coconut Hair Oil', 'Bhringraj Shampoo'],
  },
  {
    concern: 'dandruff',
    keywords: ['dandruff', 'flaky scalp', 'itchy scalp'],
    categories: ['Herbal Shampoo'],
    preferredNames: ['Neem Shampoo', 'Shikakai Shampoo'],
  },
  {
    concern: 'dry skin',
    keywords: ['dry skin', 'dryness', 'flaky skin', 'rough skin'],
    categories: ['Moisturizer Cream', 'Face & Hair Gel', 'Herbal Soap'],
    preferredNames: ['Herbal Moisturizer Cream', 'Aloe Gel', 'Goat Milk Soap'],
  },
  {
    concern: 'oily skin',
    keywords: ['oily skin', 'oiliness', 'greasy skin'],
    categories: ['Herbal Soap', 'Face Serum'],
    preferredNames: ['Charcoal Detox Soap', 'Neem & Turmeric Soap'],
  },
  {
    concern: 'acne',
    keywords: ['acne', 'pimples', 'breakout', 'blemish'],
    categories: ['Herbal Soap'],
    preferredNames: ['Neem & Turmeric Soap', 'Charcoal Detox Soap'],
  },
  {
    concern: 'glowing skin',
    keywords: ['glowing skin', 'glow', 'brightening', 'radiant', 'dull skin', 'skin tone'],
    categories: ['Face Serum', 'Herbal Soap'],
    preferredNames: ['Saffron Face Serum', 'Saffron Brightening Soap', 'Red Wine Soap'],
  },
  {
    concern: 'hair growth',
    keywords: ['hair growth', 'grow hair', 'thicker hair'],
    categories: ['Hair Oil', 'Herbal Shampoo'],
    preferredNames: ['Coconut Hair Oil', 'Bhringraj Shampoo', 'Hibiscus Shampoo'],
  },
  {
    concern: 'dry lips',
    keywords: ['chapped lips', 'dry lips', 'lip care'],
    categories: ['Lip Balm'],
    preferredNames: ['Lip Balm (Rose)'],
  },
  {
    concern: 'anti aging',
    keywords: ['anti aging', 'anti-ageing', 'wrinkles', 'fine lines'],
    categories: ['Face Serum', 'Herbal Soap'],
    preferredNames: ['Saffron Face Serum', 'Red Wine Soap'],
  },
];

// Keywords that hint the question is in-scope for an herbal/skincare/haircare
// shopping assistant. Used only as a soft signal, not a hard gate — the LLM
// system prompt does the actual refusal of unrelated topics.
export const IN_SCOPE_HINTS = [
  'product', 'soap', 'shampoo', 'oil', 'cream', 'moisturizer', 'gel', 'serum',
  'lip balm', 'skin', 'hair', 'face', 'ingredient', 'price', 'order', 'cart',
  'shipping', 'delivery', 'return', 'refund', 'payment', 'herbal', 'o2',
  'recommend', 'suggest', 'compare', 'benefit', 'use', 'acne', 'dandruff',
  'glow', 'dry', 'oily', 'combo', 'discount', 'offer',
];
