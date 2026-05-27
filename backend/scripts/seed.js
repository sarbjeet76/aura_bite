const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Review = require('../models/Review');
const Order = require('../models/Order');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const customUri = process.env.MONGODB_URI;
    if (customUri) {
      await mongoose.connect(customUri);
    } else {
      // Default to local MongoDB for manual seeding if available
      await mongoose.connect('mongodb://127.0.0.1:27017/aurabite');
    }
    console.log('Database connected for seeding...');
  } catch (err) {
    console.error('Database connection failed for seeding, using temporary fallback:', err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // 1. Clear database
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});

    console.log('Existing database data cleared.');

    // 2. Create Users (passwords will be hashed in the pre-save hook)
    const adminUser = new User({
      username: 'admin',
      email: 'admin@aurabite.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();

    const sellers = [];
    for (let i = 1; i <= 12; i++) {
      const seller = new User({
        username: `seller${i}`,
        email: `seller${i}@aurabite.com`,
        password: 'seller123',
        role: 'seller'
      });
      await seller.save();
      sellers.push(seller);
    }

    const customer1 = new User({
      username: 'customer1',
      email: 'customer1@aurabite.com',
      password: 'customer123',
      role: 'customer'
    });
    await customer1.save();

    const customer2 = new User({
      username: 'customer2',
      email: 'customer2@aurabite.com',
      password: 'customer123',
      role: 'customer'
    });
    await customer2.save();

    console.log('Demo Users seeded (1 Admin, 12 Sellers, 2 Customers).');

    // 3. Create Restaurants (8 previous + 4 new Indian restaurants)
    const restaurantData = [
      {
        name: 'Bella Italia',
        cuisineType: 'Italian',
        address: '42 Via Roma, Culinary District',
        openingHours: '11:00 AM - 11:00 PM',
        description: 'Authentic stone-oven pizzas, hand-rolled pastas, and exquisite Italian wines served in a warm, rustic atmosphere.',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60',
        sellerId: sellers[0]._id
      },
      {
        name: 'Sakura Sushi',
        cuisineType: 'Japanese',
        address: '88 Zen Garden Lane, Midtown',
        openingHours: '12:00 PM - 10:00 PM',
        description: 'Premium sushi rolls, fresh sashimi platter, and piping hot ramen bowls crafted by master chefs using ocean-fresh ingredients.',
        imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=60',
        sellerId: sellers[1]._id
      },
      {
        name: 'Taco Loco',
        cuisineType: 'Mexican',
        address: '15 Fiesta Plaza, South Plaza',
        openingHours: '10:00 AM - 12:00 AM',
        description: 'Sizzling fajitas, loaded burritos, and legendary hand-crafted tacos with local spices, fresh cilantro, and tangy lime salsas.',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=60',
        sellerId: sellers[2]._id
      },
      {
        name: 'The Spice Route',
        cuisineType: 'Indian',
        address: '77 Curry Boulevard, East Market',
        openingHours: '12:00 PM - 11:00 PM',
        description: 'A culinary journey across India featuring aromatic butter chicken, fragrant biryanis, and flame-baked garlic naan bread.',
        imageUrl: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=600&auto=format&fit=crop&q=60',
        sellerId: sellers[3]._id
      },
      {
        name: 'Green Leaf Cafe',
        cuisineType: 'Vegan',
        address: '10 Organic Way, Uptown Gardens',
        openingHours: '08:00 AM - 09:00 PM',
        description: '100% plant-based organic meals, cold-pressed green juices, and raw vegan desserts that nourish your body and please the planet.',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60',
        sellerId: sellers[4]._id
      },
      {
        name: 'Burger Lab',
        cuisineType: 'Gourmet Burgers',
        address: '104 Steam Engine Road, Industrial Quarter',
        openingHours: '12:00 PM - 11:30 PM',
        description: 'Experimenting with flavor science! Thick smashed beef patties, house-cured brioche buns, and towering gourmet assemblies with molten cheese.',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60',
        sellerId: sellers[5]._id
      },
      {
        name: 'Wok & Roll',
        cuisineType: 'Thai',
        address: '12 Street Food Market, Riverside',
        openingHours: '11:00 AM - 10:00 PM',
        description: 'Traditional hot woks, hand-pulled noodles, spicy curry soups, and sweet street treats crafted with fresh Thai basil and local herbs.',
        imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop&q=60', // Changed to guaranteed high-availability Thai table setting
        sellerId: sellers[6]._id
      },
      {
        name: 'The Parisian Pantry',
        cuisineType: 'French Pastries',
        address: '89 Champ de Mars, Uptown',
        openingHours: '07:00 AM - 07:00 PM',
        description: 'Butter croissants, hand-decorated macarons, fresh onion soup, and aromatic coffee in a gorgeous boutique bakery setting.',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=60',
        sellerId: sellers[7]._id
      },
      // 4 New Indian Restaurants
      {
        name: 'Punjab Da Dhaba',
        cuisineType: 'Indian',
        address: '14 G.T. Road, Spice Quarter',
        openingHours: '12:00 PM - 11:30 PM',
        description: 'Rich, highway-style rustic dhaba specialties, robust paneer tikkas, slow-simmered creamy dal makhani, and giant sweet lassis.',
        imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=60', // Changed to beautiful high-availability North Indian combo meal platter
        sellerId: sellers[8]._id
      },
      {
        name: 'Dakshin Delights',
        cuisineType: 'Indian',
        address: '28 Coconut Grove, South Wing',
        openingHours: '08:00 AM - 10:00 PM',
        description: 'Crispy golden paper-thin dosas, steaming fluffy idlis, tangy sambar, and authentic filter coffee served on traditional banana leaves.',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60', // Changed to ultra-stable South Indian dosa image
        sellerId: sellers[9]._id
      },
      {
        name: 'Royal Biryani Court',
        cuisineType: 'Indian',
        address: '8 Charminar Avenue, Old City',
        openingHours: '12:30 PM - 11:00 PM',
        description: 'Authentic Hyderabadi dum biryanis slow-cooked in sealed copper handis, spiced sheekh kebabs, and rich double-ka-meetha.',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60',
        sellerId: sellers[10]._id
      },
      {
        name: 'Mumbai Chowpatty',
        cuisineType: 'Indian',
        address: '9 Chowpatty Lane, Seaside',
        openingHours: '02:00 PM - 11:00 PM',
        description: 'Tangy, sweet, and spicy street delicacies of Mumbai—crispy sev puris, loaded butter pav bhajis, and refreshing malai rabdi kulfi.',
        imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=60',
        sellerId: sellers[11]._id
      }
    ];

    const seededRestaurants = [];
    for (let rData of restaurantData) {
      const rest = new Restaurant(rData);
      await rest.save();
      
      // Update the Seller user to link to this restaurant
      await User.findByIdAndUpdate(rData.sellerId, { restaurantId: rest._id });
      
      seededRestaurants.push(rest);
    }
    console.log('Demo Restaurants seeded and linked to Sellers.');

    // 4. Create Menu Items (Seeded with balanced, highly consistent INR pricing!)
    const menuItems = [
      // Bella Italia (Italian)
      {
        restaurantId: seededRestaurants[0]._id,
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, organic San Marzano tomato sauce, fresh basil, and extra virgin olive oil on hand-stretched woodfired sourdough.',
        price: 450.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[0]._id,
        name: 'Truffle Fettuccine Alfredo',
        description: 'Handmade fettuccine tossed in a rich, creamy parmigiano-reggiano sauce, finished with shaved black truffle.',
        price: 580.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[0]._id,
        name: 'Bruschetta Pomodoro',
        description: 'Toasted rustic bread rubbed with garlic, topped with vine-ripened tomatoes, fresh basil, and aged balsamic glaze.',
        price: 240.00,
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[0]._id,
        name: 'Tiramisu Classico',
        description: 'Ladyfingers soaked in espresso and dark rum, layered with whipped mascarpone cream and dusted with Dutch cocoa.',
        price: 220.00, // Aligned dessert pricing
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[0]._id,
        name: 'Aperol Spritz',
        description: 'Classic Venetian cocktail made with prosecco, Aperol, splash of club soda, garnished with a fresh orange wheel.',
        price: 240.00, // Aligned beverage pricing
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=600&auto=format&fit=crop&q=60'
      },

      // Sakura Sushi (Japanese)
      {
        restaurantId: seededRestaurants[1]._id,
        name: 'Dragon Roll (8pcs)',
        description: 'Eel and cucumber inside, wrapped in sweet avocado slices and topped with unagi eel sauce and toasted sesame seeds.',
        price: 650.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[1]._id,
        name: 'Tonkotsu Ramen Special',
        description: 'Creamy pork bone broth slow-simmered for 18 hours, served with chashu pork belly, soft-boiled ajitama egg, bamboo shoots, and nori.',
        price: 520.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[1]._id,
        name: 'Crispy Pork Gyoza',
        description: 'Pan-seared Japanese pork dumplings served with a tangy garlic soy dipping sauce.',
        price: 220.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1541696490-8744a5db022b?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[1]._id,
        name: 'Matcha Green Tea Ice Cream',
        description: 'Delicately sweet, earthy ice cream crafted from high-grade Kyoto matcha powder.',
        price: 180.00,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[1]._id,
        name: 'Chilled Ozeki Sake',
        description: 'Traditional dry Japanese rice wine served chilled in a ceramic carafe.',
        price: 380.00, // Aligned beverage pricing
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=600&auto=format&fit=crop&q=60'
      },

      // Taco Loco (Mexican)
      {
        restaurantId: seededRestaurants[2]._id,
        name: 'Birria Taco Platter',
        description: 'Three corn tortillas stuffed with slow-braised tender beef birria, melted cheese, onions, cilantro, and rich consommé dipping broth.',
        price: 420.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[2]._id,
        name: 'Sizzling Chicken Fajitas',
        description: 'Tender chicken strips flame-grilled with bell peppers and onions, served on a piping hot skillet with warm flour tortillas, sour cream, and guacamole.',
        price: 490.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1534080391025-a77d018f45ee?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[2]._id,
        name: 'Chips & Fresh Guacamole',
        description: 'House-fried crispy tortilla chips served with a large bowl of freshly mashed Haas avocados, lime juice, jalapeños, and fresh tomatoes.',
        price: 220.00,
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1579631542720-3a87824ff8c9?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[2]._id,
        name: 'Churros Con Chocolate',
        description: 'Deep-fried golden pastry sticks rolled in cinnamon sugar, served with a cup of warm, thick Belgian dipping chocolate.',
        price: 190.00,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[2]._id,
        name: 'Classic Lime Margarita',
        description: 'Premium blue agave tequila, orange liqueur, fresh-squeezed lime juice, served over ice with a salted rim.',
        price: 280.00, // Aligned beverage pricing
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=60'
      },

      // The Spice Route (Indian 1)
      {
        restaurantId: seededRestaurants[3]._id,
        name: 'Aromatic Butter Chicken',
        description: 'Tender tandoori chicken chunks simmered in a silky, rich cream and tomato gravy laced with fenugreek leaves and pure ghee.',
        price: 480.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[3]._id,
        name: 'Dum Biryani (Chicken)',
        description: 'Basmati rice cooked in layers with aromatic spices, fresh mint, fried onions, and marinated chicken, cooked in slow dum steam.',
        price: 450.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[3]._id,
        name: 'Garlic Naan & Raita',
        description: 'Clay-oven baked flatbread topped with minced garlic and butter, served with a cooling, spiced yogurt cucumber dip.',
        price: 120.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[3]._id,
        name: 'Gulab Jamun (3pcs)',
        description: 'Deep-fried milk solids dumplings soaked in a warm, fragrant cardamom and saffron sugar syrup.',
        price: 140.00,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[3]._id,
        name: 'Mango Lassi',
        description: 'Traditional cooling yogurt beverage blended with sweet Alphonso mangoes and a touch of rose water.',
        price: 120.00,
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=60'
      },

      // Green Leaf Cafe (Vegan)
      {
        restaurantId: seededRestaurants[4]._id,
        name: 'Avocado & Quinoa Buddha Bowl',
        description: 'Lemony organic quinoa topped with sliced avocados, roasted chickpeas, purple cabbages, dynamic microgreens, and organic tahini dressing.',
        price: 380.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[4]._id,
        name: 'Smoked Tofu Thai Red Curry',
        description: 'Aromatic red curry broth simmered with lemongrass, coconut milk, organic seasonal vegetables, and organic smoked tofu, served with brown rice.',
        price: 420.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[4]._id,
        name: 'Hummus Trio & Pita',
        description: 'Beetroot, avocado, and classic roasted garlic hummus served alongside warm whole-wheat triangles of pocket pita.',
        price: 180.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1577906030526-f21e58a9a6cb?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[4]._id,
        name: 'Raw Vegan Chocolate Tart',
        description: 'Sinfully rich raw cacao, dates, and walnut base tart, sweetened with wild agave and topped with wild raspberries.',
        price: 190.00, // Aligned dessert pricing
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[4]._id,
        name: 'Cold-Pressed Green Glow',
        description: 'Pure refreshing press of organic kale, green apples, celery, cucumbers, ginger, and organic key lime juice.',
        price: 150.00, // Aligned beverage pricing
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587caaec?w=600&auto=format&fit=crop&q=60'
      },

      // Burger Lab (Gourmet Burgers)
      {
        restaurantId: seededRestaurants[5]._id,
        name: 'Quantum Truffle Smash Burger',
        description: 'Double smashed Angus beef patties, molten gruyere cheese, sautéed wild mushrooms, and thick truffle garlic aioli on a toasted artisanal brioche bun.',
        price: 450.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[5]._id,
        name: 'Hot Crispy Inferno Chicken',
        description: 'Buttermilk fried crispy chicken breast dipped in Nashville glaze, topped with creamy slaw, dill pickles, and spicy home sauce.',
        price: 390.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[5]._id,
        name: 'Loaded Sweet Potato Waffle Fries',
        description: 'Crispy waffle fries loaded with melted sharp cheddar cheese, minced jalapeños, crispy bacon bits, and dynamic chives.',
        price: 160.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[5]._id,
        name: 'Salted Caramel Pecan Cookie Shake',
        description: 'Decadent vanilla bean shake blended with fresh salted caramel syrup, toasted pecans, and double-chocolate cookies.',
        price: 180.00, // Aligned dessert pricing
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[5]._id,
        name: 'Craft Iced Ginger Ale',
        description: 'House-brewed spicy ginger root soda sweetened with organic cane syrup and served with a sprig of fresh garden mint.',
        price: 110.00, // Aligned beverage pricing
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=60'
      },

      // Wok & Roll (Thai)
      {
        restaurantId: seededRestaurants[6]._id,
        name: 'Classic Pad Thai',
        description: 'Stir-fried rice noodles with farm-fresh prawns, firm organic tofu, sweet tamarind glaze, crunchy bean sprouts, and roasted crushed peanuts.',
        price: 390.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1626804475315-9644b37a2fc4?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[6]._id,
        name: 'Spicy Tom Yum Goong',
        description: 'Aromatic, fiery lemongrass broth filled with wild prawns, fresh straw mushrooms, dynamic kaffir lime, and spicy galangal.',
        price: 190.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[6]._id,
        name: 'Golden Pork Spring Rolls',
        description: 'Four crispy fried spring rolls stuffed with spiced minced pork and glass noodles, served with warm sweet plum dipping sauce.',
        price: 140.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[6]._id,
        name: 'Sweet Mango Sticky Rice',
        description: 'Traditional glutinous sweet sticky rice drizzled with salted sweet coconut milk, topped with sliced ripe golden mango.',
        price: 180.00, // Aligned dessert pricing
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1528279027-68f0d7fce9f1?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[6]._id,
        name: 'Traditional Thai Iced Tea',
        description: 'Sweetened strongly-brewed black tea infused with star anise and crushed cardamom, topped with evaporated milk.',
        price: 110.00, // Aligned beverage pricing
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=600&auto=format&fit=crop&q=60'
      },

      // The Parisian Pantry (French Pastries)
      {
        restaurantId: seededRestaurants[7]._id,
        name: 'Butter Croissants Duo',
        description: 'Two flaky, hand-rolled golden puff pastry croissants crafted with imported Normandy butter, served warm with wild strawberry jam.',
        price: 140.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[7]._id,
        name: 'French Onion Soup Gratin',
        description: 'Classic slow-caramelized onion broth topped with a crusty garlic crouton and melted Gruyere cheese.',
        price: 190.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1510627802779-3d4466e671cc?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[7]._id,
        name: 'Savory Croque Monsieur',
        description: 'Toasted brioche sandwich filled with sliced Parisian ham and creamy Bechamel sauce, broiled with melted Swiss cheese.',
        price: 380.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[7]._id,
        name: 'Boutique Macarons Tower',
        description: 'Assortment of five delicate French macarons: dark chocolate, wild pistachio, lavender honey, vanilla bean, and tangy raspberry.',
        price: 190.00, // Aligned dessert pricing
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[7]._id,
        name: 'Artisanal Cafe au Lait',
        description: 'Rich dark espresso shot diluted with equal parts steamed organic milk, finished with a micro-foam layer.',
        price: 120.00, // Aligned beverage pricing
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=60'
      },

      // Punjab Da Dhaba (Indian 2)
      {
        restaurantId: seededRestaurants[8]._id,
        name: 'Dal Makhani Shahi',
        description: 'Slow-simmered black lentils and kidney beans cooked overnight on charcoal, enriched with fresh dairy cream and white butter.',
        price: 320.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[8]._id,
        name: 'Paneer Butter Masala',
        description: 'Soft cubes of organic cottage cheese cooked in a rich, buttery, spiced tomato gravy finished with fresh cream.',
        price: 380.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[8]._id,
        name: 'Amritsari Paneer Kulcha',
        description: 'Clay-oven stuffed flatbread filled with spiced paneer, roasted over charcoal and brushed with pure ghee.',
        price: 140.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[8]._id,
        name: 'Tandoori Murgh Tikka',
        description: 'Boneless chicken chunks marinated in spiced yogurt and home spices, skewered and roasted in a traditional clay oven.',
        price: 280.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[8]._id,
        name: 'Patiala Sweet Lassi',
        description: 'Thick, creamy churned yogurt beverage sweetened and flavored with cardamom, served in a traditional clay kulhad.',
        price: 110.00, // Aligned beverage pricing
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[8]._id,
        name: 'Kesar Kulfi Falooda',
        description: 'Rich dense saffron milk ice cream served with sweet corn starch vermicelli, sweet basil seeds, and rose syrup.',
        price: 160.00, // Aligned dessert pricing
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60'
      },

      // Dakshin Delights (Indian 3)
      {
        restaurantId: seededRestaurants[9]._id,
        name: 'Ghee Podi Masala Dosa',
        description: 'Crispy fermented rice-lentil crepe smeared with spicy roasted lentil powder (podi) and clarified butter, stuffed with spiced potato mash.',
        price: 240.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[9]._id,
        name: 'Steaming Idli Sambar Platter',
        description: 'Three fluffy, steamed rice-lentil cakes served alongside piping hot flavorful vegetable lentil stew (sambar) and fresh coconut chutney.',
        price: 110.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[9]._id,
        name: 'Crispy Medu Vada (2pcs)',
        description: 'Fried savory black lentil donuts spiced with ginger, black pepper, and fresh curry leaves, served with coconut chutney.',
        price: 95.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[9]._id,
        name: 'Madras Filter Coffee',
        description: 'Traditional south Indian chicory-coffee blend frothed with hot organic milk and poured back and forth in a brass tumbler.',
        price: 70.00, // Aligned beverage pricing
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[9]._id,
        name: 'Coconut Rava Kesari',
        description: 'Delicately sweet semolina pudding cooked with pure ghee, sugar, roasted cashews, saffron, and freshly grated organic coconut.',
        price: 120.00, // Aligned dessert pricing
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=600&auto=format&fit=crop&q=60'
      },

      // Royal Biryani Court (Indian 4)
      {
        restaurantId: seededRestaurants[10]._id,
        name: 'Hyderabadi Mutton Dum Biryani',
        description: 'Aromatic long-grain basmati rice and tender spring lamb marinated in home spices, slow-cooked in layers under seal pressure (dum).',
        price: 520.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[10]._id,
        name: 'Nawabi Chicken Dum Biryani',
        description: 'Classic royal recipe! Saffron-infused basmati rice layered with spiced chicken drumsticks, caramelized onions, mint, and pure ghee.',
        price: 450.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[10]._id,
        name: 'Flame-grilled Sheekh Kebab',
        description: 'Skewer-grilled minced mutton rolls mixed with fresh coriander, mint, green chilies, and royal house masalas.',
        price: 290.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1559487488-170-d11ec9c172f0?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[10]._id,
        name: 'Double Ka Meetha',
        description: 'Royal dessert made of golden fried bread slices soaked in saffron and cardamom milk, topped with rich rabdi and almonds.',
        price: 140.00, // Aligned dessert pricing
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[10]._id,
        name: 'Spiced Mint Jaljeera',
        description: 'Refreshing tangy Indian cooler flavored with cumin, dynamic black salt, fresh mint leaves, lemon juice, and crisp boondi.',
        price: 65.00, // Aligned beverage pricing
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=60'
      },

      // Mumbai Chowpatty (Indian 5)
      {
        restaurantId: seededRestaurants[11]._id,
        name: 'Amul Butter Pav Bhaji',
        description: 'Spiced mashed vegetable gravy loaded with pure Amul butter, served alongside hot, butter-toasted soft brioche buns (pav).',
        price: 220.00,
        category: 'Mains',
        imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[11]._id,
        name: 'Sev Puri Chowpatty Special',
        description: 'Crispy flat puris topped with potato mash, onions, tangy tamarind salsa, mint chutney, loaded with fine crispy gram flour sev.',
        price: 95.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[11]._id,
        name: 'Mumbai Vada Pav Duo',
        description: 'Two legendary street sandwiches! Fried potato dumpling placed inside a bun smeared with fiery dry garlic coconut chutney.',
        price: 90.00, // Aligned appetizer pricing
        category: 'Appetizers',
        imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[11]._id,
        name: 'Masala Jeera Soda',
        description: 'House-made carbonated black salt and roasted cumin seed beverage, finished with fresh key lime juice.',
        price: 60.00, // Aligned beverage pricing
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=60'
      },
      {
        restaurantId: seededRestaurants[11]._id,
        name: 'Rich Malai Rabdi Kulfi',
        description: 'Thick condensed milk kulfi bars served over a dollop of sweet rabdi, dressed with pistachios and pure saffron threads.',
        price: 130.00, // Aligned dessert pricing
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60'
      }
    ];

    const seededMenuItems = await MenuItem.insertMany(menuItems);
    console.log('Categorized Menu Items seeded successfully.');

    // 5. Seed Reviews (will trigger stats aggregation hooks)
    const reviews = [
      {
        restaurantId: seededRestaurants[0]._id,
        userId: customer1._id,
        username: customer1.username,
        rating: 5,
        comment: 'Absolutely spectacular Margherita! Sourdough base has the perfect char and the fresh basil is incredibly aromatic. Felt like dining in Naples!'
      },
      {
        restaurantId: seededRestaurants[0]._id,
        userId: customer2._id,
        username: customer2.username,
        rating: 4,
        comment: 'Incredibly rich truffle fettuccine! The parmigiano sauce is so thick and delicious. Deducting one star only because the Aperol Spritz was slightly diluted.'
      },
      {
        restaurantId: seededRestaurants[1]._id,
        userId: customer1._id,
        username: customer1.username,
        rating: 5,
        comment: 'Fresh, beautiful sashimi cuts. The Tonkotsu ramen is the best in the city - that broth is so deeply flavorful!'
      },
      {
        restaurantId: seededRestaurants[2]._id,
        userId: customer2._id,
        username: customer2.username,
        rating: 5,
        comment: 'Best Birria tacos in the tri-state area! The dipping consommé broth is rich and extremely well seasoned.'
      },
      {
        restaurantId: seededRestaurants[3]._id,
        userId: customer1._id,
        username: customer1.username,
        rating: 4,
        comment: 'Lovely butter chicken with nice and sweet tomato tang! Naan was crispy and fresh. Will order again.'
      },
      {
        restaurantId: seededRestaurants[4]._id,
        userId: customer2._id,
        username: customer2.username,
        rating: 5,
        comment: 'Amazing Buddha bowl! Every component was seasoned properly. The cold-pressed juice was super refreshing.'
      },
      {
        restaurantId: seededRestaurants[6]._id,
        userId: customer1._id,
        username: customer1.username,
        rating: 5,
        comment: 'Sensational Pad Thai! Warm, rich peanuts, fresh lime, and spicy chili sauce. Service was exceptionally fast too!'
      },
      {
        restaurantId: seededRestaurants[7]._id,
        userId: customer2._id,
        username: customer2.username,
        rating: 5,
        comment: 'The butter croissants literally melt in your mouth! Macarons are beautiful and perfectly crisp. A true Parisian escape!'
      },
      // Reviews for new Indian spots
      {
        restaurantId: seededRestaurants[8]._id,
        userId: customer1._id,
        username: customer1.username,
        rating: 5,
        comment: 'Dal makhani was exceptionally rich and authentic! That smoky charcoal aroma was fantastic. Highly recommended!'
      },
      {
        restaurantId: seededRestaurants[9]._id,
        userId: customer2._id,
        username: customer2.username,
        rating: 5,
        comment: 'Mind-blowing crispy Ghee Dosa! The sambar is highly flavorful and coconut chutney is extremely fresh.'
      },
      {
        restaurantId: seededRestaurants[10]._id,
        userId: customer1._id,
        username: customer1.username,
        rating: 5,
        comment: 'The Nawabi Chicken Biryani has the perfect saffron fragrance and the pieces were melt-in-the-mouth tender.'
      },
      {
        restaurantId: seededRestaurants[11]._id,
        userId: customer2._id,
        username: customer2.username,
        rating: 5,
        comment: 'Amazing Mumbai Pav Bhaji! Loads of butter and the pav was beautifully toasted. Tastes exactly like Chowpatty beach!'
      }
    ];

    // Create reviews one-by-one so that the schema 'save' hook updates the restaurant stats
    for (let rev of reviews) {
      const review = new Review(rev);
      await review.save();
    }
    console.log('Customer reviews seeded; Restaurant average ratings aggregated.');

    // 6. Seed Orders (to establish default history)
    const order1 = new Order({
      userId: customer1._id,
      restaurantId: seededRestaurants[0]._id,
      items: [
        {
          menuItemId: seededMenuItems[0]._id, // Margherita
          name: seededMenuItems[0].name,
          quantity: 2,
          price: seededMenuItems[0].price
        },
        {
          menuItemId: seededMenuItems[3]._id, // Tiramisu
          name: seededMenuItems[3].name,
          quantity: 1,
          price: seededMenuItems[3].price
        }
      ],
      totalAmount: Math.round((seededMenuItems[0].price * 2 + seededMenuItems[3].price) * 100) / 100,
      status: 'Completed',
      deliveryAddress: {
        street: '451 Foodie Parkway, Suite 100',
        city: 'Culinary City',
        state: 'Delhi',
        pincode: '110001',
        landmark: 'Near Food Plaza'
      },
      paymentMethod: 'Credit/Debit Card',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    });
    await order1.save();

    const order2 = new Order({
      userId: customer1._id,
      restaurantId: seededRestaurants[1]._id,
      items: [
        {
          menuItemId: seededMenuItems[5]._id, // Dragon Roll
          name: seededMenuItems[5].name,
          quantity: 1,
          price: seededMenuItems[5].price
        },
        {
          menuItemId: seededMenuItems[7]._id, // Gyoza
          name: seededMenuItems[7].name,
          quantity: 1,
          price: seededMenuItems[7].price
        }
      ],
      totalAmount: Math.round((seededMenuItems[5].price + seededMenuItems[7].price) * 100) / 100,
      status: 'Preparing',
      deliveryAddress: {
        street: '88 Curry Boulevard',
        city: 'East Market',
        state: 'Delhi',
        pincode: '110002',
        landmark: 'Opposite Market Gate'
      },
      paymentMethod: 'Cash on Delivery',
      createdAt: new Date()
    });
    await order2.save();

    console.log('Default transaction Orders seeded.');
    console.log('Database successfully seeded with realistic, populated demo profiles in Indian Rupees!');
    process.exit(0);
  } catch (err) {
    console.error('Critical seeding error:', err);
    process.exit(1);
  }
};

seedData();
