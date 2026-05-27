const http = require('http');
const mongoose = require('mongoose');

// We'll boot the server in this script on a test port
process.env.PORT = 5099;
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/aurabite_test';
process.env.NODE_ENV = 'test';

const { server } = require('../server');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runTests = async () => {
  console.log('\n--- STARTING AUTOMATED REST API INTEGRATION TESTS ---\n');
  
  // Wait a bit for db connection
  await delay(2000);

  const baseUrl = 'http://127.0.0.1:5099/api';
  let customerToken = '';
  let customerId = '';
  let sellerToken = '';
  let restaurantId = '';
  let reviewId = '';
  let orderId = '';
  let testMenuItemId = '';

  try {
    // 1. Clear test DB collections
    await mongoose.connection.collection('users').deleteMany({});
    await mongoose.connection.collection('restaurants').deleteMany({});
    await mongoose.connection.collection('menuitems').deleteMany({});
    await mongoose.connection.collection('reviews').deleteMany({});
    await mongoose.connection.collection('orders').deleteMany({});
    console.log('✔ Test database cleared.');

    // 2. Test Customer Registration
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_customer',
        email: 'test_customer@example.com',
        password: 'password123',
        role: 'customer'
      })
    });
    const regData = await regRes.json();
    if (regRes.status !== 201 || !regData.token) {
      throw new Error(`Customer Registration Failed: ${JSON.stringify(regData)}`);
    }
    customerToken = regData.token;
    customerId = regData._id;
    console.log('✔ Customer Registration verified successfully.');

    // 3. Test Seller Registration
    const sellRegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_seller',
        email: 'test_seller@example.com',
        password: 'password123',
        role: 'seller'
      })
    });
    const sellRegData = await sellRegRes.json();
    if (sellRegRes.status !== 201 || !sellRegData.token) {
      throw new Error(`Seller Registration Failed: ${JSON.stringify(sellRegData)}`);
    }
    sellerToken = sellRegData.token;
    console.log('✔ Seller Registration verified successfully.');

    // 4. Test Restaurant Creation by Seller
    const restRes = await fetch(`${baseUrl}/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        name: 'Test Bistro',
        cuisineType: 'French Bistro',
        address: '123 Test Boulevard',
        openingHours: '10 AM - 10 PM',
        description: 'A cozy French bistro for test suite verification.'
      })
    });
    const restData = await restRes.json();
    if (restRes.status !== 201 || !restData.data._id) {
      throw new Error(`Restaurant Creation Failed: ${JSON.stringify(restData)}`);
    }
    restaurantId = restData.data._id;
    console.log(`✔ Restaurant Creation verified. Restaurant ID: ${restaurantId}`);

    // Update seller local object role profile
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const meData = await meRes.json();
    if (!meData.restaurantId) {
      throw new Error('Seller Me profile failed to associate restaurantId link.');
    }
    console.log('✔ Seller-to-Restaurant dynamic association link verified.');

    // 5. Test MenuItem Creation by Seller
    const menuRes = await fetch(`${baseUrl}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        restaurantId,
        name: 'Coq au Vin',
        description: 'Traditional slow-cooked French chicken in rich red burgundy wine broth.',
        price: 24.50,
        category: 'Mains'
      })
    });
    const menuData = await menuRes.json();
    if (menuRes.status !== 201 || !menuData.data._id) {
      throw new Error(`Menu Item Creation Failed: ${JSON.stringify(menuData)}`);
    }
    testMenuItemId = menuData.data._id;
    console.log(`✔ Menu Item Creation verified. Item ID: ${testMenuItemId}`);

    // 6. Test Restaurant details lookup
    const lookupRes = await fetch(`${baseUrl}/restaurants/${restaurantId}`);
    const lookupData = await lookupRes.json();
    if (lookupRes.status !== 200 || lookupData.data.menuItems.length !== 1) {
      throw new Error(`Restaurant Details lookup failed: ${JSON.stringify(lookupData)}`);
    }
    console.log('✔ Restaurant details & menu items query validated.');

    // 7. Test Customer Review Placement
    const revRes = await fetch(`${baseUrl}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        restaurantId,
        rating: 5,
        comment: 'Exquisite Coq au Vin! Will definitely come back.'
      })
    });
    const revData = await revRes.json();
    if (revRes.status !== 201 || !revData.data._id) {
      throw new Error(`Review Placement Failed: ${JSON.stringify(revData)}`);
    }
    reviewId = revData.data._id;
    console.log('✔ Review Placement verified successfully.');

    // 8. Test Review edits
    const revEditRes = await fetch(`${baseUrl}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        rating: 4,
        comment: 'Exquisite Coq au Vin, slightly salty but overall delicious.'
      })
    });
    const revEditData = await revEditRes.json();
    if (revEditRes.status !== 200 || revEditData.data.rating !== 4) {
      throw new Error(`Review Modification Failed: ${JSON.stringify(revEditData)}`);
    }
    console.log('✔ Review Modification / Editing verified.');

    // Verify rating aggregates in restaurant
    const restLookupAgain = await fetch(`${baseUrl}/restaurants/${restaurantId}`);
    const restLookupAgainData = await restLookupAgain.json();
    if (restLookupAgainData.data.restaurant.rating !== 4) {
      throw new Error(`Average rating aggregation failed. Expected 4, got ${restLookupAgainData.data.restaurant.rating}`);
    }
    console.log('✔ Database Mongoose aggregation hooks for reviews verified.');

    // 9. Test Customer Order Placement
    const ordRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        restaurantId,
        items: [
          {
            menuItemId: testMenuItemId,
            quantity: 2
          }
        ],
        deliveryAddress: {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'IL',
          pincode: '62704',
          landmark: 'Next to Flanders'
        },
        paymentMethod: 'Cash on Delivery'
      })
    });
    const ordData = await ordRes.json();
    if (ordRes.status !== 201 || !ordData.data._id) {
      throw new Error(`Order Placement Failed: ${JSON.stringify(ordData)}`);
    }
    orderId = ordData.data._id;
    if (ordData.data.totalAmount !== 49.00) {
      throw new Error(`Order price validation fraud test failed. Total: ${ordData.data.totalAmount}`);
    }
    console.log('✔ Order Placement and dynamic backend-price validation verified.');

    // 10. Test Seller Order Status Update
    const statRes = await fetch(`${baseUrl}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({ status: 'Preparing' })
    });
    const statData = await statRes.json();
    if (statRes.status !== 200 || statData.data.status !== 'Preparing') {
      throw new Error(`Order Status Update Failed: ${JSON.stringify(statData)}`);
    }
    console.log('✔ Order Status transition workflows verified.');

    console.log('\n=========================================');
    console.log('✔ ALL REST API INTEGRATION TESTS PASSED!');
    console.log('=========================================\n');
    
    // Clean up test database collections
    await mongoose.connection.collection('users').deleteMany({});
    await mongoose.connection.collection('restaurants').deleteMany({});
    await mongoose.connection.collection('menuitems').deleteMany({});
    await mongoose.connection.collection('reviews').deleteMany({});
    await mongoose.connection.collection('orders').deleteMany({});
    
    await mongoose.disconnect();
    server.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILURE:', error.message);
    try {
      await mongoose.disconnect();
      server.close();
    } catch (e) {}
    process.exit(1);
  }
};

runTests();
