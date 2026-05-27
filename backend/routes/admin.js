const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Ensure all routes in this file are ADMIN ONLY
router.use(protect, authorize('admin'));

// @desc    Get system-wide analytics stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments({});
    const restaurantCount = await Restaurant.countDocuments({});
    const reviewCount = await Review.countDocuments({});
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });
    
    const grossRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = await Order.countDocuments({});

    // Count user roles
    const customersCount = await User.countDocuments({ role: 'customer' });
    const sellersCount = await User.countDocuments({ role: 'seller' });
    const adminsCount = await User.countDocuments({ role: 'admin' });

    res.json({
      success: true,
      data: {
        users: {
          total: userCount,
          customers: customersCount,
          sellers: sellersCount,
          admins: adminsCount
        },
        restaurants: restaurantCount,
        reviews: reviewCount,
        orders: {
          total: orderCount,
          revenue: Math.round(grossRevenue * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Fetch Admin Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all users in system
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('Fetch Users Admin Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Modify user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Don't demote self
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own admin role.' });
    }

    user.role = role;
    
    // If demoting from seller, remove restaurant associations
    if (role !== 'seller') {
      user.restaurantId = null;
    }

    await user.save();

    res.json({ success: true, data: user, message: `User role updated to '${role}'` });
  } catch (error) {
    console.error('Update User Role Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete user account and clean up
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    // Clean up if seller
    if (user.role === 'seller' && user.restaurantId) {
      await Restaurant.findByIdAndDelete(user.restaurantId);
      await MenuItem.deleteMany({ restaurantId: user.restaurantId });
      await Review.deleteMany({ restaurantId: user.restaurantId });
    }

    // Delete reviews written by the user
    await Review.deleteMany({ userId: user._id });

    // Note: We don't delete orders written by the user, for transaction history bookkeeping.

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'User and all managed properties deleted successfully' });
  } catch (error) {
    console.error('Delete User Admin Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all reviews in system for moderation
// @route   GET /api/admin/reviews
// @access  Private (Admin only)
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error('Fetch Reviews Admin Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Toggle hide status of review
// @route   PUT /api/admin/reviews/:id/hide
// @access  Private (Admin only)
router.put('/reviews/:id/hide', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isHidden = !review.isHidden;
    await review.save();

    // Trigger update stats manually to include/exclude the review from the average score!
    await Review.updateRestaurantStats(review.restaurantId);

    res.json({ 
      success: true, 
      data: review, 
      message: `Review is now ${review.isHidden ? 'hidden' : 'visible'}` 
    });
  } catch (error) {
    console.error('Toggle Hide Review Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin only)
router.delete('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);
    
    // Trigger update stats
    await Review.updateRestaurantStats(review.restaurantId);

    res.json({ success: true, message: 'Review deleted successfully by admin' });
  } catch (error) {
    console.error('Delete Review Admin Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
