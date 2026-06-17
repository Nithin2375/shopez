const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getUserCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'name price category stock images ratings'
    );

    res.status(200).json({
      success: true,
      cart: cart || { user: req.user._id, items: [] },
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const item = cart.items.find((entry) => entry.product.toString() === productId);
    const nextQuantity = Math.min(product.stock, Number(quantity));

    if (item) {
      item.quantity = Math.min(product.stock, item.quantity + nextQuantity);
    } else {
      cart.items.push({ product: productId, quantity: nextQuantity });
    }

    await cart.save();
    await cart.populate('items.product', 'name price category stock images ratings');

    res.status(200).json({ success: true, message: 'Product added to cart', cart });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find((entry) => entry.product.toString() === req.params.productId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter((entry) => entry.product.toString() !== req.params.productId);
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();
    await cart.populate('items.product', 'name price category stock images ratings');

    res.status(200).json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((entry) => entry.product.toString() !== req.params.productId);
    await cart.save();
    await cart.populate('items.product', 'name price category stock images ratings');

    res.status(200).json({ success: true, message: 'Product removed from cart', cart });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: 'Cart cleared', cart });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserCart, addToCart, updateCartItem, removeCartItem, clearCart };
