const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// @desc    Add a review for a restaurant
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { restaurantId, rating, comment } = req.body;

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Check if user has already reviewed this restaurant
    const alreadyReviewed = await Review.findOne({
      restaurantId,
      userId: req.user.id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this restaurant. Please edit your existing review instead.' });
    }

    const review = await Review.create({
      restaurantId,
      userId: req.user.id,
      username: req.user.username,
      rating,
      comment
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && review.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
    }

    // Update using findOneAndUpdate or standard assignment
    // Standard assignment ensures saving and schema hooks trigger
    review.rating = rating !== undefined ? rating : review.rating;
    review.comment = comment !== undefined ? comment : review.comment;
    await review.save();

    res.json({ success: true, data: review });
  } catch (error) {
    console.error('Update Review Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && review.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    // Use findByIdAndDelete (will fire post('findOneAndDelete') hook)
    await Review.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
