const express = require('express');
const router  = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { protect }      = require('../middleware/auth.middleware');
const { protectAdmin } = require('../middleware/admin.middleware');

// ─── User Routes ─────────────────────────────────────────────────────────────
// POST /api/orders
router.post('/', protect, placeOrder);

// GET  /api/orders/my-orders
router.get('/my-orders', protect, getMyOrders);

// GET  /api/orders/:id
router.get('/:id', protect, getOrderById);

// PUT  /api/orders/:id/cancel
router.put('/:id/cancel', protect, cancelOrder);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
// GET  /api/orders
router.get('/', protectAdmin, getAllOrders);

// PUT  /api/orders/:id/status
router.put('/:id/status', protectAdmin, updateOrderStatus);

module.exports = router;
