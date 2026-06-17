const express = require('express');
const router  = express.Router();
const {
  registerUser,
  loginUser,
  loginAdmin,
  logout,
} = require('../controllers/auth.controller');

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/admin/login
router.post('/admin/login', loginAdmin);

// POST /api/auth/logout
router.post('/logout', logout);

module.exports = router;
