const express = require('express');
const router  = express.Router();
const {
  getDashboardStats,
  createAdmin,
  getAllAdmins,
  toggleAdminStatus,
  createCategory,
} = require('../controllers/admin.controller');
const { protectAdmin, superAdminOnly } = require('../middleware/admin.middleware');

// All admin routes require admin authentication
router.use(protectAdmin);

// GET  /api/admin/dashboard
router.get('/dashboard', getDashboardStats);

// POST /api/admin/categories
router.post('/categories', createCategory);

// ─── Superadmin Only ─────────────────────────────────────────────────────────
// POST /api/admin/create
router.post('/create', superAdminOnly, createAdmin);

// GET  /api/admin/all
router.get('/all', superAdminOnly, getAllAdmins);

// PUT  /api/admin/:id/toggle
router.put('/:id/toggle', superAdminOnly, toggleAdminStatus);

module.exports = router;
