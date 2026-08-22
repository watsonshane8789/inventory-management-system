require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Product = require('./src/models/Product');

const sampleProducts = [
  {
    name: 'Wireless Ergonomic Mouse',
    sku: 'TECH-MSE-001',
    category: 'Electronics',
    quantity: 45,
    price: 29.99,
    lowStockThreshold: 10,
  },
  {
    name: 'Mechanical Gaming Keyboard',
    sku: 'TECH-KBD-002',
    category: 'Electronics',
    quantity: 18,
    price: 89.99,
    lowStockThreshold: 5,
  },
  {
    name: 'Stainless Steel Water Bottle 1L',
    sku: 'HOME-BTL-003',
    category: 'Home & Kitchen',
    quantity: 120,
    price: 19.50,
    lowStockThreshold: 20,
  },
  {
    name: 'Organic Cotton Crew T-Shirt',
    sku: 'APPR-TSH-004',
    category: 'Apparel',
    quantity: 75,
    price: 24.00,
    lowStockThreshold: 15,
  },
  {
    name: 'Noise-Cancelling Over-Ear Headphones',
    sku: 'TECH-AUD-005',
    category: 'Electronics',
    quantity: 8,
    price: 199.99,
    lowStockThreshold: 10,
  },
];

async function seedProducts() {
  try {
    // ensure DB is connected before running inserts
    await connectDB();

    const createdProducts = await Product.insertMany(sampleProducts, {
      ordered: true, // Stops insertion if any document fails validation/uniqueness
    });
    console.log(`Successfully inserted ${createdProducts.length} products`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Failed to insert products:', error.message || error);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

seedProducts();