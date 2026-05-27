import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartRestaurant, setCartRestaurant] = useState(null); // stores { id, name }

  // Load cart from local storage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('aurabite_cart');
    const storedRest = localStorage.getItem('aurabite_cart_restaurant');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    if (storedRest) {
      setCartRestaurant(JSON.parse(storedRest));
    }
  }, []);

  // Sync cart to local storage
  const syncStorage = (items, rest) => {
    localStorage.setItem('aurabite_cart', JSON.stringify(items));
    if (rest) {
      localStorage.setItem('aurabite_cart_restaurant', JSON.stringify(rest));
    } else {
      localStorage.removeItem('aurabite_cart_restaurant');
    }
  };

  const addToCart = (item, restaurant) => {
    // Check if adding from a different restaurant
    if (cartRestaurant && cartRestaurant.id !== restaurant.id) {
      const confirmClear = window.confirm(
        `Your cart already contains items from "${cartRestaurant.name}". Would you like to clear your cart to add items from "${restaurant.name}"?`
      );
      if (!confirmClear) return false;
      
      // Clear cart and start new
      const newItems = [{ ...item, quantity: 1 }];
      setCartItems(newItems);
      setCartRestaurant(restaurant);
      syncStorage(newItems, restaurant);
      return true;
    }

    // Standard add
    let newItems = [...cartItems];
    const existingIndex = cartItems.findIndex((i) => i.menuItemId === item.menuItemId);

    if (existingIndex > -1) {
      newItems[existingIndex].quantity += 1;
    } else {
      newItems.push({ ...item, quantity: 1 });
    }

    setCartItems(newItems);
    if (!cartRestaurant) {
      setCartRestaurant(restaurant);
      syncStorage(newItems, restaurant);
    } else {
      syncStorage(newItems, cartRestaurant);
    }
    return true;
  };

  const removeFromCart = (menuItemId) => {
    const newItems = cartItems.filter((i) => i.menuItemId !== menuItemId);
    setCartItems(newItems);
    
    if (newItems.length === 0) {
      setCartRestaurant(null);
      syncStorage([], null);
    } else {
      syncStorage(newItems, cartRestaurant);
    }
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }

    const newItems = cartItems.map((item) =>
      item.menuItemId === menuItemId ? { ...item, quantity } : item
    );
    setCartItems(newItems);
    syncStorage(newItems, cartRestaurant);
  };

  const clearCart = () => {
    setCartItems([]);
    setCartRestaurant(null);
    localStorage.removeItem('aurabite_cart');
    localStorage.removeItem('aurabite_cart_restaurant');
  };

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartRestaurant,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
