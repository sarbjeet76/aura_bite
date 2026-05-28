const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Review = require('../models/Review');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    console.error('Fetch Restaurants Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get single restaurant details (including menu & reviews)
// @route   GET /api/restaurants/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Fetch menu items
    const menuItems = await MenuItem.find({ restaurantId: restaurant._id });

    // Fetch reviews (excluding hidden ones)
    const reviews = await Review.find({ restaurantId: restaurant._id, isHidden: { $ne: true } }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        restaurant,
        menuItems,
        reviews
      }
    });
  } catch (error) {
    console.error('Fetch Single Restaurant Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private (Seller/Admin)
router.post('/', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { name, cuisineType, address, openingHours, description, imageUrl, images } = req.body;

    // Check if seller already has a restaurant
    if (req.user.role === 'seller' && req.user.restaurantId) {
      return res.status(400).json({ success: false, message: 'Seller already manages a restaurant.' });
    }

    const restaurant = await Restaurant.create({
      name,
      cuisineType,
      address,
      openingHours,
      description,
      imageUrl,
      images: images || [],
      sellerId: req.user.id
    });

    // Update user link
    await User.findByIdAndUpdate(req.user.id, { restaurantId: restaurant._id });

    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    console.error('Create Restaurant Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @desc    Update restaurant details
// @route   PUT /api/restaurants/:id
// @access  Private (Seller/Admin)
router.put('/:id', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && restaurant.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this restaurant' });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: restaurant });
  } catch (error) {
    console.error('Update Restaurant Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Seller/Admin)
router.delete('/:id', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && restaurant.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this restaurant' });
    }

    // Delete associated menu items & reviews
    await MenuItem.deleteMany({ restaurantId: restaurant._id });
    await Review.deleteMany({ restaurantId: restaurant._id });

    // Remove restaurant link from user
    await User.findByIdAndUpdate(restaurant.sellerId, { restaurantId: null });

    await Restaurant.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Restaurant and related data deleted successfully' });
  } catch (error) {
    console.error('Delete Restaurant Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
