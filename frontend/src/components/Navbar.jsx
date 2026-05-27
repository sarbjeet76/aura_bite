import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = ({ onCartToggle }) => {
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('aurabite_theme') || 'dark');
  const navigate = useNavigate();

  // Handle active class bindings on document body dynamically
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('aurabite_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      borderWidth: '0 0 1px 0',
      background: 'var(--bg-glass)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none',
          color: 'inherit'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-coral))',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <i className="fa-solid fa-utensils" style={{ color: '#000', fontSize: '1.2rem' }}></i>
          </div>
          <span style={{
            fontFamily: 'var(--font-title)',
            fontWeight: 800,
            fontSize: '1.4rem',
            background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            Aura<span style={{
              background: 'linear-gradient(to right, var(--accent-gold), var(--accent-coral))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Bite</span>
          </span>
        </Link>

        {/* Desktop Navigation Linkages */}
        <div className="nav-links-desktop" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/enquiry" className="nav-link">Enquiry Desk</Link>
          
          {user && user.role === 'customer' && (
            <Link to="/orders" className="nav-link">My Orders</Link>
          )}

          {user && user.role === 'seller' && (
            <>
              <Link to="/seller/orders" className="nav-link">
                <span className="badge badge-gold" style={{ fontSize: '0.65rem', marginRight: '0.25rem' }}>Live</span>
                Orders
              </Link>
              <Link to="/seller/menu" className="nav-link">Menu</Link>
              <Link to="/seller/settings" className="nav-link">Settings</Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" className="nav-link">
              <i className="fa-solid fa-toolbox" style={{ marginRight: '0.4rem' }}></i>
              Admin Hub
            </Link>
          )}
        </div>

        {/* Desktop Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {/* Light/Dark Mode Toggle Button */}
          <button className="btn btn-secondary" onClick={toggleTheme} style={{
            padding: '0.6rem 0.75rem',
            borderRadius: '10px',
            background: 'var(--bg-tertiary)',
            color: 'var(--accent-gold)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer'
          }} title="Toggle Theme">
            <i className={theme === 'dark' ? "fa-solid fa-sun" : "fa-solid fa-moon"} style={{ fontSize: '1.1rem' }}></i>
          </button>

          {/* Cart Button (Always visible for Customers, hidden for sellers/admins unless desired) */}
          {(!user || user.role === 'customer') && (
            <button className="btn btn-secondary" onClick={() => {
              if (!user) {
                navigate('/auth');
              } else {
                onCartToggle();
              }
            }} style={{
              padding: '0.6rem 1rem',
              position: 'relative',
              borderRadius: '10px'
            }}>
              <i className="fa-solid fa-shopping-bag" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)' }}></i>
              <span className="cart-btn-label">Cart</span>
              {totalItemsCount > 0 && (
                <span className="pulse-glow-box" style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))',
                  color: '#000',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow)'
                }}>
                  {totalItemsCount}
                </span>
              )}
            </button>
          )}

          {user ? (
            <div className="user-control-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>@{user.username}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user.role}</p>
              </div>
              <button className="btn btn-coral" onClick={handleLogout} style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-right-from-bracket"></i>
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem' }}>
              Login / Sign Up
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button className="hamburger-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'none'
          }}>
            <i className={mobileOpen ? "fa-solid fa-times" : "fa-solid fa-bars"}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer Drawer */}
      {mobileOpen && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '71px',
          left: 0,
          right: 0,
          borderWidth: '0 0 1px 0',
          borderRadius: 0,
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <Link to="/" className="mobile-link" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/enquiry" className="mobile-link" onClick={() => setMobileOpen(false)}>Enquiry Desk</Link>
          
          {user && user.role === 'customer' && (
            <Link to="/orders" className="mobile-link" onClick={() => setMobileOpen(false)}>My Orders</Link>
          )}

          {user && user.role === 'seller' && (
            <>
              <Link to="/seller/orders" className="mobile-link" onClick={() => setMobileOpen(false)}>Live Orders</Link>
              <Link to="/seller/menu" className="mobile-link" onClick={() => setMobileOpen(false)}>Manage Menu</Link>
              <Link to="/seller/settings" className="mobile-link" onClick={() => setMobileOpen(false)}>Restaurant Settings</Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" className="mobile-link" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
          )}

          {/* Mobile Mode toggler */}
          <button className="btn btn-secondary" onClick={() => { toggleTheme(); setMobileOpen(false); }} style={{
            width: '100%',
            justifyContent: 'center',
            borderRadius: '10px',
            gap: '0.75rem',
            cursor: 'pointer'
          }}>
            <i className={theme === 'dark' ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
            <span>{theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
          </button>

          {user ? (
            <div style={{
              borderTop: '1px solid var(--border-glass)',
              paddingTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>@{user.username}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user.role}</p>
              </div>
              <button className="btn btn-coral" onClick={handleLogout} style={{ padding: '0.5rem 1rem', borderRadius: '10px' }}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ width: '100%' }}>
              Login / Sign Up
            </Link>
          )}
        </div>
      )}

      {/* CSS Styles overrides for Nav Desktop/Mobile toggling */}
      <style>{`
        .nav-link {
          text-decoration: none;
          color: var(--text-secondary);
          font-family: var(--font-title);
          font-weight: 500;
          font-size: 0.95rem;
          transition: color var(--transition-fast);
          display: flex;
          align-items: center;
        }
        .nav-link:hover {
          color: var(--accent-gold);
        }
        .mobile-link {
          text-decoration: none;
          color: var(--text-primary);
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 1.1rem;
          padding: 0.5rem 0;
        }
        .mobile-link:hover {
          color: var(--accent-gold);
        }
        @media (max-width: 768px) {
          .nav-links-desktop, .user-control-desktop, .cart-btn-label {
            display: none !important;
          }
          .hamburger-btn {
            display: block !important;
            margin-left: 0.5rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
