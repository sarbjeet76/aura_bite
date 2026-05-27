const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a text comment']
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to get avg rating and save
ReviewSchema.statics.updateRestaurantStats = async function (restaurantId) {
  const obj = await this.aggregate([
    {
      $match: { restaurantId: restaurantId, isHidden: { $ne: true } }
    },
    {
      $group: {
        _id: '$restaurantId',
        averageRating: { $avg: '$rating' },
        reviewsCount: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        reviewsCount: obj[0].reviewsCount
      });
    } else {
      await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
        rating: 0,
        reviewsCount: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call updateRestaurantStats after save
ReviewSchema.post('save', async function () {
  await this.constructor.updateRestaurantStats(this.restaurantId);
});

// Call updateRestaurantStats after findOneAndDelete / findOneAndUpdate
ReviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.updateRestaurantStats(doc.restaurantId);
  }
});

// We'll also handle findOneAndUpdate if needed
ReviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    await doc.constructor.updateRestaurantStats(doc.restaurantId);
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
