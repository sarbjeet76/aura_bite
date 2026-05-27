import React, { useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart = ({ isOpen, onClose }) => {
  const { cartItems, cartRestaurant, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // Structured Address Form States
  const [street, setStreet] = useState('451 Foodie Parkway, Suite 100');
  const [city, setCity] = useState('Culinary City');
  const [stateName, setStateName] = useState('Delhi');
  const [pincode, setPincode] = useState('110001');
  const [landmark, setLandmark] = useState('Near Food Plaza');

  // Payment Method States
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [successOrder, setSuccessOrder] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!user) {
      alert('Please log in or sign up to place an order.');
      onClose();
      navigate('/auth');
      return;
    }

    if (!street.trim() || !city.trim() || !stateName.trim() || !pincode.trim()) {
      alert('Please fill out all required address fields (Street, City, State, Pincode).');
      return;
    }

    if (paymentMethod === 'Credit/Debit Card') {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        alert('Please fill out all credit/debit card information.');
        return;
      }
    }

    setCheckoutLoading(true);
    try {
      const itemsPayload = cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity
      }));

      const res = await axios.post('http://localhost:5000/api/orders', {
        restaurantId: cartRestaurant.id,
        items: itemsPayload,
        deliveryAddress: {
          street,
          city,
          state: stateName,
          pincode,
          landmark
        },
        paymentMethod
      });

      if (res.data.success) {
        setSuccessOrder(res.data.data);
        clearCart();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleTrackOrder = () => {
    setSuccessOrder(null);
    onClose();
    navigate('/orders');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)'
    }}>
      {/* Click outside overlay to close */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0 }} />

      {/* Cart Container Panel */}
      <div className="glass-panel animate-slide-in" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '450px',
        height: '100vh',
        borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
        background: 'var(--bg-secondary)',
        borderWidth: '0 0 0 1px',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {successOrder ? (
          /* Order Placement Success View */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            animation: 'fadeIn 0.4s ease'
          }}>
            <div className="pulse-glow-box" style={{
              width: '80px',
              height: '80px',
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--accent-gold)',
              marginBottom: '2rem'
            }}>
              <i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-gold)', fontSize: '3rem' }}></i>
            </div>
            <h2 className="glow-text" style={{ fontFamily: 'var(--font-title)', marginBottom: '1rem' }}>Order Placed!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              Your order has been sent to <strong>{successOrder.restaurantId?.name}</strong> in real-time.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '2.5rem' }}>
              Order ID: {successOrder._id}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={handleTrackOrder}>
                <i className="fa-solid fa-truck-ramp-box"></i>
                Track Live Order
              </button>
              <button className="btn btn-secondary" onClick={() => { setSuccessOrder(null); onClose(); }}>
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* Main Cart Content View */
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              borderBottom: '1px solid var(--border-glass)',
              paddingBottom: '1rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-shopping-cart" style={{ color: 'var(--accent-gold)' }}></i>
                Your Cart
              </h2>
              <button onClick={onClose} style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.25rem',
                cursor: 'pointer'
              }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexGrow: 1,
                color: 'var(--text-muted)'
              }}>
                <i className="fa-solid fa-basket-shopping" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}></i>
                <p style={{ fontFamily: 'var(--font-title)', fontWeight: 500 }}>Your cart is empty</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Add delicious dishes to get started.</p>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Ordering from: <strong style={{ color: 'var(--accent-gold)' }}>{cartRestaurant?.name}</strong>
                </p>

                {/* Items List scrollbox */}
                <div style={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  paddingRight: '0.5rem',
                  marginBottom: '1.5rem'
                }}>
                  {cartItems.map((item) => (
                    <div key={item.menuItemId} className="glass-panel" style={{
                      padding: '1rem',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                      background: 'rgba(0, 0, 0, 0.15)'
                    }}>
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div style={{ flexGrow: 1 }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>{item.name}</h4>
                        <p style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 500 }}>
                          ₹{item.price}
                        </p>
                      </div>
                      
                      {/* Quantity adjustments */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                        padding: '0.25rem'
                      }}>
                        <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          width: '24px',
                          height: '24px'
                        }}>
                          <i className="fa-solid fa-minus" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          width: '24px',
                          height: '24px'
                        }}>
                          <i className="fa-solid fa-plus" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                      </div>

                      <button onClick={() => removeFromCart(item.menuItemId)} style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        transition: 'color var(--transition-fast)'
                      }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-coral)'}
                         onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Checkout section */}
                <div style={{
                  borderTop: '1px solid var(--border-glass)',
                  paddingTop: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  paddingRight: '0.25rem'
                }}>
                  {/* Structured Delivery Address Section */}
                  <div style={{
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.15)'
                  }}>
                    <p style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--accent-gold)', 
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <i className="fa-solid fa-location-dot"></i>
                      Delivery Destination Address Form
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Street Address, House/Flat No."
                        className="form-input"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                      />
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="City"
                          className="form-input"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                        />
                        <input
                          type="text"
                          placeholder="State"
                          className="form-input"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                        />
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Pincode"
                          className="form-input"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                        />
                        <input
                          type="text"
                          placeholder="Landmark (Optional)"
                          className="form-input"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector Section */}
                  <div style={{
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.15)'
                  }}>
                    <p style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--accent-gold)', 
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <i className="fa-solid fa-credit-card"></i>
                      Payment Method
                    </p>

                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        width: '100%',
                        marginBottom: paymentMethod === 'Credit/Debit Card' ? '0.5rem' : '0'
                      }}
                    >
                      <option value="Cash on Delivery">💵 Cash on Delivery (COD)</option>
                      <option value="AuraPay Wallet">🛡️ AuraPay Wallet Fallback</option>
                      <option value="Credit/Debit Card">💳 Credit / Debit Card</option>
                    </select>

                    {/* Simulated Credit Card Sub-form */}
                    {paymentMethod === 'Credit/Debit Card' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', animation: 'fadeIn 0.2s ease-out' }}>
                        <input
                          type="text"
                          placeholder="16-Digit Card Number"
                          className="form-input"
                          maxLength="16"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="form-input"
                            maxLength="5"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
                          />
                          <input
                            type="password"
                            placeholder="CVV"
                            className="form-input"
                            maxLength="3"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-title)' }}>Total Amount</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                      ₹{totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <button className="btn btn-primary" onClick={handleCheckout} disabled={checkoutLoading} style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.05rem',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.75rem'
                  }}>
                    {checkoutLoading ? (
                      <div className="pulse-glow-box" style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: '2px solid #000',
                        borderTopColor: 'transparent',
                        animation: 'spin 1s linear infinite'
                      }} />
                    ) : (
                      <>
                        <i className="fa-solid fa-credit-card"></i>
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        .animate-slide-in {
          animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Cart;
