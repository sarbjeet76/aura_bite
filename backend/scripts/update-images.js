const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Restaurant = require('../models/Restaurant');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleImages = [
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=60', // Chic restaurant dining area
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop&q=60', // Chefs cooking in kitchen
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop&q=60', // Cozy bistro setting
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60', // Gourmet steak platter
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop&q=60', // Fresh salad table spread
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=60', // Fluffy pancakes stacking
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=60', // Exquisite strawberry cheesecake slice
  'https://images.unsplash.com/photo-1493770308161-fdc199e7a1d8?w=800&auto=format&fit=crop&q=60', // Premium breakfast toast array
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=60'  // Fresh pastries and berries
];

const updateRestaurants = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('No MONGODB_URI found in .env');
    }

    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Successfully connected to MongoDB.');

    const restaurants = await Restaurant.find({});
    console.log(`Found ${restaurants.length} restaurants to update.`);

    for (let restaurant of restaurants) {
      // Pick 2 random unique images from sampleImages
      const shuffled = [...sampleImages].sort(() => 0.5 - Math.random());
      const selectedSamples = shuffled.slice(0, 2);

      // Construct images array: original imageUrl as cover slide + 2 sample slides
      const galleryImages = [
        restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60',
        ...selectedSamples
      ];

      restaurant.images = galleryImages;
      await restaurant.save();
      console.log(`Updated images for restaurant: "${restaurant.name}"`);
    }

    console.log('All restaurants updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
};

updateRestaurants();
