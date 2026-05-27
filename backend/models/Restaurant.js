const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a restaurant name'],
    trim: true,
    unique: true
  },
  cuisineType: {
    type: String,
    required: [true, 'Please add cuisine type'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please add address']
  },
  openingHours: {
    type: String,
    required: [true, 'Please add opening hours']
  },
  description: {
    type: String,
    required: [true, 'Please add a short description']
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60'
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
