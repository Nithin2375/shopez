const User = require('../models/User');
const Admin = require('../models/Admin');

// ─── @desc    Get logged-in user profile
// ─── @route   GET /api/users/profile
// ─── @access  Private
const getProfile = async (req, res, next) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) {
      user = await Admin.findById(req.user._id);
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update logged-in user profile
// ─── @route   PUT /api/users/profile
// ─── @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    let user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    if (!user) {
      user = await Admin.findByIdAndUpdate(
        req.user._id,
        { name, phone, address },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Change password
// ─── @route   PUT /api/users/change-password
// ─── @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    let user = await User.findById(req.user._id).select('+password');
    if (!user) {
      user = await Admin.findById(req.user._id).select('+password');
    }
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get all users (Admin)
// ─── @route   GET /api/users
// ─── @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Delete a user (Admin)
// ─── @route   DELETE /api/users/:id
// ─── @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, changePassword, getAllUsers, deleteUser };
