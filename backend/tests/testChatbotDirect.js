import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import { STORE_FAQS, CONCERN_MAP } from '../data/chatbotKnowledge.js';

dotenv.config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

function matchProducts(message, productsList) {
  const text = message.toLowerCase();
  const matched = [];

  const addByNames = (names) => {
    names.forEach((n) => {
      const p = productsList.find((prod) => prod.name.toLowerCase().includes(n.toLowerCase()));
      if (p && !matched.find((m) => m._id.toString() === p._id.toString())) {
        matched.push(p);
      }
    });
  };

  CONCERN_MAP.forEach((entry) => {
    if (entry.keywords.some((kw) => text.includes(kw))) {
      addByNames(entry.preferredNames);
    }
  });

  return matched.slice(0, 3);
}

async function testChatbotLive() {
  console.log('Testing Chatbot with live DB and Groq API...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/o2herbal');

  const activeProducts = await Product.find({ isActive: true });
  console.log(`Found ${activeProducts.length} active products.`);

  const testQuery = 'What shampoo is good for hair?';
  const matched = matchProducts(testQuery, activeProducts);
  console.log('Matched products for query:', matched.map(m => m.name));

  if (!process.env.GROQ_API_KEY) {
    console.log('GROQ_API_KEY is not set. Testing fallback mode.');
    process.exit(0);
  }

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: 'You are Sprout, herbal shopping assistant for O2 Herbal Care.' },
        { role: 'user', content: testQuery }
      ],
      max_tokens: 150,
    }),
  });

  console.log('Groq API Status:', res.status);
  if (res.ok) {
    const data = await res.json();
    console.log('Groq Reply:', data.choices[0]?.message?.content);
  } else {
    const err = await res.text();
    console.log('Groq Error text:', err);
  }

  await mongoose.disconnect();
}

testChatbotLive().catch(console.error);
