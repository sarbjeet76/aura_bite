import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Providers Context
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components & Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './components/Cart';
import ProtectedRoute from './components/ProtectedRoute';

// Views & Pages
import Home from './views/Home';
import RestaurantDetails from './views/RestaurantDetails';
import Auth from './views/Auth';
import OrderHistory from './views/OrderHistory';
import Enquiry from './views/Enquiry';

// Seller Views
import SellerOrders from './views/SellerOrders';
import SellerMenu from './views/SellerMenu';
import SellerSettings from './views/SellerSettings';

// Admin Views
import AdminDashboard from './views/AdminDashboard';

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Navigation Header */}
            <Navbar onCartToggle={() => setCartOpen(!cartOpen)} />

            {/* Sidebar drawer Cart */}
            <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />

            {/* Route Viewports */}
            <div style={{ flexGrow: 1 }}>
              <Routes>
                {/* Public Viewports */}
                <Route path="/" element={<Home />} />
                <Route path="/restaurant/:id" element={<RestaurantDetails />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/enquiry" element={<Enquiry />} />

                {/* Customer protected routing */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <OrderHistory />
                    </ProtectedRoute>
                  }
                />

                {/* Seller protected routing */}
                <Route
                  path="/seller/orders"
                  element={
                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                      <SellerOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seller/menu"
                  element={
                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                      <SellerMenu />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seller/settings"
                  element={
                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                      <SellerSettings />
                    </ProtectedRoute>
                  }
                />

                {/* Admin protected routing */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Home />} />
              </Routes>
            </div>

            {/* Footer component */}
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
