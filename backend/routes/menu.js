const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// @desc    Add a menu item
// @route   POST /api/menu
// @access  Private (Seller/Admin)
router.post('/', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { restaurantId, name, description, price, category, imageUrl, isAvailable } = req.body;

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && restaurant.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to add menu items to this restaurant' });
    }

    const menuItem = await MenuItem.create({
      restaurantId,
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    res.status(201).json({ success: true, data: menuItem });
  } catch (error) {
    console.error('Create MenuItem Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private (Seller/Admin)
router.put('/:id', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    let menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    // Verify restaurant ownership
    const restaurant = await Restaurant.findById(menuItem.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Associated restaurant not found' });
    }

    if (req.user.role !== 'admin' && restaurant.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update items in this restaurant' });
    }

    menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: menuItem });
  } catch (error) {
    console.error('Update MenuItem Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private (Seller/Admin)
router.delete('/:id', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    // Verify restaurant ownership
    const restaurant = await Restaurant.findById(menuItem.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Associated restaurant not found' });
    }

    if (req.user.role !== 'admin' && restaurant.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete items from this restaurant' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete MenuItem Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
