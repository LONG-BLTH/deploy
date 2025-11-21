const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

// Specific routes MUST come before parameterized routes
router.get('/search', productController.searchProducts);
router.get('/low-stock', authenticate, authorize('admin'), productController.getLowStockProducts);

// CRUD routes
router.post('/', authenticate, authorize('admin'), productController.createProduct);
router.get('/', productController.getAllProducts); // Supports query params: ?category=Electronics&sort=price&order=asc&page=1&limit=10
router.get('/:id', productController.getProductById);
router.put('/:id', authenticate, authorize('admin'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);

module.exports = router;
