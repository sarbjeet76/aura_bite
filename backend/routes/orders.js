const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Customer/Admin)
router.post('/', protect, async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add items to your order' });
    }

    if (!deliveryAddress || typeof deliveryAddress !== 'object') {
      return res.status(400).json({ success: false, message: 'Please specify a structured delivery address.' });
    }

    const { street, city, state, pincode, phone } = deliveryAddress;
    if (!street || !street.trim() || !city || !city.trim() || !state || !state.trim() || !pincode || !pincode.trim()) {
      return res.status(400).json({ success: false, message: 'Please fill in all required delivery address fields (Street, City, State, Pincode).' });
    }

    if (paymentMethod && !['Cash on Delivery', 'AuraPay Wallet', 'Credit/Debit Card'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method selected.' });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Process & validate items + calculate price in backend to prevent frontend pricing fraud
    let totalAmount = 0;
    const validatedItems = [];

    for (let item of items) {
      const dbItem = await MenuItem.findById(item.menuItemId);
      if (!dbItem) {
        return res.status(404).json({ success: false, message: `Menu item with ID ${item.menuItemId} not found` });
      }
      if (!dbItem.isAvailable) {
        return res.status(400).json({ success: false, message: `Menu item '${dbItem.name}' is currently unavailable` });
      }
      if (dbItem.restaurantId.toString() !== restaurantId) {
        return res.status(400).json({ success: false, message: `Item '${dbItem.name}' does not belong to this restaurant` });
      }

      const itemTotal = dbItem.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        menuItemId: dbItem._id,
        name: dbItem.name,
        quantity: item.quantity,
        price: dbItem.price
      });
    }

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      restaurantId,
      items: validatedItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      deliveryAddress: {
        street,
        city,
        state,
        pincode,
        landmark: deliveryAddress.landmark || '',
        phone: phone || ''
      },
      paymentMethod: paymentMethod || 'Cash on Delivery'
    });

    // Populate order with restaurant info for front-end rendering ease
    const populatedOrder = await Order.findById(order._id).populate('restaurantId', 'name imageUrl');

    // REAL-TIME SOCKET EMIT: Notify Seller Room
    if (req.io) {
      const sellerRoom = `seller_restaurant_${restaurantId}`;
      req.io.to(sellerRoom).emit('new_order', populatedOrder);
      
      // Notify Admin Room
      req.io.to('admin_room').emit('admin_stats_update', {
        type: 'new_order',
        order: populatedOrder
      });
    }

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @desc    Get order history / listings
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'customer') {
      // Customers get their own orders
      orders = await Order.find({ userId: req.user.id })
        .populate('restaurantId', 'name cuisineType imageUrl address')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'seller') {
      // Sellers get orders matching their restaurant ID
      if (!req.user.restaurantId) {
        return res.json({ success: true, data: [], message: 'Seller does not have a restaurant associated yet.' });
      }
      orders = await Order.find({ restaurantId: req.user.restaurantId })
        .populate('userId', 'username email phoneNumber')
        .populate('restaurantId', 'name')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'admin') {
      // Admins get ALL orders
      orders = await Order.find({})
        .populate('userId', 'username email phoneNumber')
        .populate('restaurantId', 'name')
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Seller/Admin)
router.put('/:id/status', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership for sellers
    if (req.user.role === 'seller') {
      if (order.restaurantId.toString() !== req.user.restaurantId.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify orders for this restaurant' });
      }
    }

    order.status = status;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('restaurantId', 'name imageUrl')
      .populate('userId', 'username email');

    // REAL-TIME SOCKET EMIT: Notify Customer Room
    if (req.io) {
      const customerRoom = `customer_user_${order.userId}`;
      req.io.to(customerRoom).emit('order_status_updated', populatedOrder);

      // Notify Admin Room
      req.io.to('admin_room').emit('admin_stats_update', {
        type: 'order_status_updated',
        order: populatedOrder
      });
    }

    res.json({ success: true, data: populatedOrder });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
