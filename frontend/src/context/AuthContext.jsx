import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { initiateSocketConnection, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set default axios header if token exists
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Check login status on first boot
  useEffect(() => {
    const checkLoggedIn = async () => {
      const storedUser = localStorage.getItem('aurabite_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setAuthHeader(parsedUser.token);
          
          // Verify token against backend
          const res = await axios.get('http://localhost:5000/api/auth/me');
          
          if (res.data.success) {
            const updatedUser = { ...parsedUser, ...res.data };
            setUser(updatedUser);
            localStorage.setItem('aurabite_user', JSON.stringify(updatedUser));
            
            // Connect WebSockets
            initiateSocketConnection(updatedUser);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Auth boot validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
    return () => disconnectSocket();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (res.data.success) {
        const userData = res.data;
        setUser(userData);
        setAuthHeader(userData.token);
        localStorage.setItem('aurabite_user', JSON.stringify(userData));
        
        // Connect WebSockets
        initiateSocketConnection(userData);
        setLoading(false);
        return true;
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (username, email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
        role
      });
      if (res.data.success) {
        const userData = res.data;
        setUser(userData);
        setAuthHeader(userData.token);
        localStorage.setItem('aurabite_user', JSON.stringify(userData));
        
        // Connect WebSockets
        initiateSocketConnection(userData);
        setLoading(false);
        return true;
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthHeader(null);
    localStorage.removeItem('aurabite_user');
    disconnectSocket();
  };

  const updateRestaurantLink = (restaurantId) => {
    if (user) {
      const updatedUser = { ...user, restaurantId };
      setUser(updatedUser);
      localStorage.setItem('aurabite_user', JSON.stringify(updatedUser));
      
      // Re-establish sockets to pick up restaurant room
      disconnectSocket();
      initiateSocketConnection(updatedUser);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateRestaurantLink
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
