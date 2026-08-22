const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all products
// @route   GET /api/v1/products
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: products.length, data: products });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.status(200).json({ success: true, data: product });
});

// @desc    Create product
// @route   POST /api/v1/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.status(200).json({ success: true, data: product });
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.status(200).json({ success: true, data: {} });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };