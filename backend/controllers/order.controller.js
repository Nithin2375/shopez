const Order = require('../models/Order');
const Product = require('../models/Product');

// ─── @desc    Place a new order
// ─── @route   POST /api/orders
// ─── @access  Private (User)
const placeOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    // Validate stock & calculate prices
    let itemsPrice = 0;
    for (const item of orderItems) {
      console.log("Product ID:",item.product);
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for: ${product.name}` });
      }
      item.name  = product.name;
      item.price = product.price;
      item.image = product.images?.[0]?.url || '';
      itemsPrice += product.price * item.quantity;

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();
    }

    const taxPrice      = parseFloat((itemsPrice * 0.18).toFixed(2));
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const totalPrice    = parseFloat((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    console.log("ORDER BODY:",req.body);
    console.log("USER:",req.user);
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get logged-in user's orders
// ─── @route   GET /api/orders/my-orders
// ─── @access  Private (User)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get order by ID
// ─── @route   GET /api/orders/:id
// ─── @access  Private (User / Admin)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Cancel an order
// ─── @route   PUT /api/orders/:id/cancel
// ─── @access  Private (User)
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.orderStatus !== 'placed') {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    // Replenish stock for cancelled items
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.orderStatus = 'cancelled';
    await order.save();
    res.status(200).json({ success: true, message: 'Order cancelled', order });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get all orders (Admin)
// ─── @route   GET /api/orders
// ─── @access  Admin
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone address')
      .sort({ createdAt: -1 });
    const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
    res.status(200).json({ success: true, count: orders.length, totalRevenue, orders });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update order status (Admin)
// ─── @route   PUT /api/orders/:id/status
// ─── @access  Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cancelled orders cannot be modified' });
    }

    if (order.orderStatus === 'returned') {
      return res.status(400).json({ success: false, message: 'Returned orders cannot be modified' });
    }

    if (orderStatus === 'cancelled' && order.orderStatus === 'delivered') {
      return res.status(400).json({ success: false, message: 'Delivered orders cannot be cancelled' });
    }

    if (orderStatus === 'returned' && order.orderStatus !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
    }

    // If transitioning to cancelled from a non-cancelled state, replenish stock
    if (orderStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    // If transitioning to returned from a non-returned state, replenish stock
    if (orderStatus === 'returned' && order.orderStatus !== 'returned') {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.orderStatus = orderStatus;
    if (orderStatus === 'delivered') order.deliveredAt = Date.now();
    await order.save();
    res.status(200).json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus };
