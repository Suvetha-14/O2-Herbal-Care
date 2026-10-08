import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from './models/Product.js'
import connectDB from './config/db.js'

// Import backend seed data
import productsFromBackend from './data/products.js'

dotenv.config()

const run = async () => {
  try {
    // Ensure DB connection
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected for seeding')

    // Clear existing products
    await Product.deleteMany({})
    console.log('Cleared existing products')

    // Map frontend products to backend model
    const mapped = productsFromBackend.map((p) => ({
      name: p.name,
      category: p.category || 'Uncategorized',
      description: p.description || p.about || '',
      price: Number(p.price) || 0,
      discountPrice: Number(p.discountPrice) || 0,
      stock: Number(p.stock) || 100,
      images: p.image ? [p.image] : [],
      image: p.image || '',
      ingredients: p.ingredients || [],
      rating: Number(p.rating) || 0,
      numReviews: Number(p.reviews) || 0,
      isActive: true,
    }))

    // Insert
    const inserted = await Product.insertMany(mapped)
    console.log(`Inserted ${inserted.length} products`)

    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

run()
