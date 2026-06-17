const User    = require('../models/User');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const Admin   = require('../models/Admin');

// ─── @desc    Get dashboard stats
// ─── @route   GET /api/admin/dashboard
// ─── @access  Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalOrders, orders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.find().select('totalPrice orderStatus'),
    ]);

    const totalRevenue  = orders.reduce((acc, o) => acc + o.totalPrice, 0);
    const pendingOrders = orders.filter((o) => o.orderStatus === 'placed').length;

    res.status(200).json({
      success: true,
      stats: { totalUsers, totalProducts, totalOrders, totalRevenue, pendingOrders },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Create admin account (Superadmin only)
// ─── @route   POST /api/admin/create
// ─── @access  Superadmin
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }
    const admin = await Admin.create({ name, email, password, role: role || 'admin' });
    res.status(201).json({
      success: true,
      message: 'Admin created',
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get all admins (Superadmin only)
// ─── @route   GET /api/admin/all
// ─── @access  Superadmin
const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: admins.length, admins });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Toggle admin active status (Superadmin only)
// ─── @route   PUT /api/admin/:id/toggle
// ─── @access  Superadmin
const toggleAdminStatus = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    admin.isActive = !admin.isActive;
    await admin.save();
    res.status(200).json({
      success: true,
      message: `Admin ${admin.isActive ? 'activated' : 'deactivated'}`,
      admin,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Add a category to admin preferences
// ─── @route   POST /api/admin/categories
// ─── @access  Admin
const createCategory = async (req, res, next) => {
  try {
    const { category } = req.body;
    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid category name' });
    }
    const admin = req.admin;
    const trimmedCat = category.trim();
    if (!admin.categories.includes(trimmedCat)) {
      admin.categories.push(trimmedCat);
      await admin.save();
    }
    res.status(200).json({ success: true, message: 'Category created successfully', categories: admin.categories });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, createAdmin, getAllAdmins, toggleAdminStatus, createCategory };
