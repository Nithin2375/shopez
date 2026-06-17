const User = require('../models/User');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// ─── @desc    Register a new user
// ─── @route   POST /api/auth/register
// ─── @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: generateToken(user._id, 'user'),
      user: { id: user._id, name: user.name, email: user.email, role: 'user' },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Login user (supports both User and Admin logins)
// ─── @route   POST /api/auth/login
// ─── @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let account = await User.findOne({ email }).select('+password');
    let role = 'user';

    if (!account) {
      account = await Admin.findOne({ email }).select('+password');
      if (account) {
        role = account.role; // 'admin' or 'superadmin'
      }
    }

    if (!account || !(await account.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(account._id, role),
      user: { id: account._id, name: account.name, email: account.email, role },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Admin login
// ─── @route   POST /api/auth/admin/login
// ─── @access  Public
// Admin is required at the top of the file

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token: generateToken(admin._id, admin.role),
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Logout (client-side token removal)
// ─── @route   POST /api/auth/logout
// ─── @access  Public
const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = { registerUser, loginUser, loginAdmin, logout };
