const Product = require('../models/Product');

// Create a new product
const createProduct = async (req, res) => {
  try {
    // Create product using request body data
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all products with filtering, sorting, and pagination
const getAllProducts = async (req, res) => {
  try {
    // Extract query parameters
    const { category, minPrice, maxPrice, sort, order, page, limit } = req.query;

    // Build filter object dynamically
    const filter = {};

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Build sort object
    const sortObj = {};
    if (sort) {
      // order: 'asc' = 1, 'desc' = -1
      sortObj[sort] = order === 'desc' ? -1 : 1;
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Execute query with all options
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination info
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      total: total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    // Find product by ID from URL parameters
    const product = await Product.findById(req.params.id);

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    // Find and update product
    // { new: true } returns the updated document
    // { runValidators: true } runs schema validation on update
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    // Find and delete product by ID
    const product = await Product.findByIdAndDelete(req.params.id);

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search products by name or description
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required'
      });
    }

    // Create case-insensitive regex pattern
    const searchPattern = new RegExp(q, 'i');

    // Search in name OR description fields
    const products = await Product.find({
      $or: [
        { name: searchPattern },
        { description: searchPattern }
      ]
    });

    res.status(200).json({
      success: true,
      count: products.length,
      query: q,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get products with stock below threshold
const getLowStockProducts = async (req, res) => {
  try {
    // Default threshold is 10
    const threshold = parseInt(req.query.threshold) || 10;

    // Find products where stock is less than threshold
    const products = await Product.find({
      stock: { $lt: threshold }
    }).sort({ stock: 1 }); // Sort by stock ascending

    res.status(200).json({
      success: true,
      count: products.length,
      threshold: threshold,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getLowStockProducts
};
