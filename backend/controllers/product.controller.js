const Product = require('../models/Product');
const Admin = require('../models/Admin');

// ─── @desc    Get all products (with search & filter)
// ─── @route   GET /api/products
// ─── @access  Public
const getAllProducts = async (req, res, next) => {
  try {
    const { keyword, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const filter = { isActive: true };
    if (keyword)   filter.name     = { $regex: keyword, $options: 'i' };
    if (category)  filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get single product by ID
// ─── @route   GET /api/products/:id
// ─── @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Create a new product (Admin)
// ─── @route   POST /api/products
// ─── @access  Admin
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({ ...req.body, createdBy: req.admin._id });
    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update a product (Admin)
// ─── @route   PUT /api/products/:id
// ─── @access  Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product updated', product });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Delete a product (Admin)
// ─── @route   DELETE /api/products/:id
// ─── @access  Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deleted (soft delete)' });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get all unique active product categories
// ─── @route   GET /api/products/categories
// ─── @access  Public
const getProductCategories = async (req, res, next) => {
  try {
    const productCategories = await Product.distinct('category', { isActive: true });
    const admins = await Admin.find().select('categories');
    const adminCategories = admins.reduce((acc, admin) => {
      if (admin.categories) acc.push(...admin.categories);
      return acc;
    }, []);
    const allCategories = Array.from(new Set([...productCategories, ...adminCategories]));
    res.status(200).json({ success: true, categories: allCategories });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Soft-delete all products in a category
// ─── @route   DELETE /api/products/categories/:category
// ─── @access  Admin
const deleteCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    await Product.updateMany({ category }, { isActive: false });
    await Admin.updateMany({}, { $pull: { categories: category } });
    res.status(200).json({
      success: true,
      message: `Category '${category}' deleted. All associated products have been deactivated.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  deleteCategory,
};
