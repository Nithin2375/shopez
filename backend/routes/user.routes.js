const express = require('express');
const router  = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
} = require('../controllers/user.controller');
const { protect }       = require('../middleware/auth.middleware');
const { protectAdmin }  = require('../middleware/admin.middleware');

// ─── User Routes (Protected) ─────────────────────────────────────────────────
// GET    /api/users/profile
router.get('/profile', protect, getProfile);

// PUT    /api/users/profile
router.put('/profile', protect, updateProfile);

// PUT    /api/users/change-password
router.put('/change-password', protect, changePassword);

// ─── Admin-Only User Routes ───────────────────────────────────────────────────
// GET    /api/users
router.get('/', protectAdmin, getAllUsers);

// DELETE /api/users/:id
router.delete('/:id', protectAdmin, deleteUser);

module.exports = router;
