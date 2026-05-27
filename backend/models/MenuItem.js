const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add item name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  category: {
    type: String,
    required: [true, 'Please select category'],
    enum: ['Appetizers', 'Mains', 'Drinks', 'Desserts']
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
