const express = require('express');
const router  = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  deleteCategory,
} = require('../controllers/product.controller');
const { protectAdmin } = require('../middleware/admin.middleware');

// ─── Public Routes ───────────────────────────────────────────────────────────
// GET  /api/products/categories
router.get('/categories', getProductCategories);

// GET  /api/products              (supports ?keyword, ?category, ?minPrice, ?maxPrice, ?page, ?limit)
router.get('/', getAllProducts);

// GET  /api/products/:id
router.get('/:id', getProductById);

// ─── Admin Routes ────────────────────────────────────────────────────────────
// POST   /api/products
router.post('/', protectAdmin, createProduct);

// PUT    /api/products/:id
router.put('/:id', protectAdmin, updateProduct);

// DELETE /api/products/:id
router.delete('/:id', protectAdmin, deleteProduct);

// DELETE /api/products/categories/:category
router.delete('/categories/:category', protectAdmin, deleteCategory);

module.exports = router;
