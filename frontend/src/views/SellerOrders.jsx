import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

const SellerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashAlert, setFlashAlert] = useState(false);

  const fetchSellerOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching seller orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerOrders();

    // Configure WebSockets listener for real-time order notifications!
    const socket = getSocket();
    if (socket && user?.restaurantId) {
      console.log('Registering socket listener for seller live orders room...');
      socket.on('new_order', (newOrder) => {
        console.log('Real-time new order received on seller panel:', newOrder);
        
        // Push alert and beep chime
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-120.wav');
          audio.play();
        } catch (e) {
          console.warn('Audio play failed:', e);
        }

        setFlashAlert(true);
        setTimeout(() => setFlashAlert(false), 3000);

        // Prepend to orders list
        setOrders((prev) => [newOrder, ...prev]);
      });
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('new_order');
      }
    };
  }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: newStatus
      });

      if (res.data.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        gap: '1rem'
      }}>
        <div className="pulse-glow-box" style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '3px solid var(--accent-gold)',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)' }}>Syncing with restaurant ledger...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user?.restaurantId) {
    return (
      <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
          <i className="fa-solid fa-store-slash" style={{ fontSize: '3.5rem', color: 'var(--accent-coral)', marginBottom: '1.5rem' }}></i>
          <h2>No Associated Restaurant Found</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem 0' }}>
            To begin receiving and managing customer orders, you must configure and register your restaurant details.
          </p>
          <a href="/seller/settings" className="btn btn-primary">Establish Your Storefront</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ marginTop: '3rem', paddingBottom: '5rem' }}>
      
      {/* Live Audio-Visual new order banner */}
      {flashAlert && (
        <div className="pulse-glow-box" style={{
          background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-coral))',
          color: '#000',
          padding: '1.25rem 2rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          boxShadow: 'var(--shadow-glow)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>🔔 LIVE ALERT: A new customer order has just arrived in real-time!</span>
          <button onClick={() => setFlashAlert(false)} style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', fontWeight: 'bold' }}>
            DISMISS
          </button>
        </div>
      )}

      <h1 style={{
        fontFamily: 'var(--font-title)',
        fontSize: '2.2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <i className="fa-solid fa-tower-broadcast" style={{ color: 'var(--accent-gold)' }}></i>
        Live Incoming Orders
      </h1>

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
          <i className="fa-solid fa-bell-slash" style={{ fontSize: '3.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}></i>
          <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Active Orders</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You are fully synced. When customers checkout, items will appear here in real-time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order._id} className="glass-panel" style={{
              padding: '1.5rem 2rem',
              background: 'var(--bg-secondary)',
              borderLeft: order.status === 'Pending' ? '4px solid var(--accent-gold)' : '1px solid var(--border-glass)',
              boxShadow: order.status === 'Pending' ? 'var(--shadow-glow)' : 'var(--shadow-sm)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem'
              }}>
                {/* Customer Details */}
                <div style={{ minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>@{order.userId?.username}</h3>
                    <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>{order.status}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Email: {order.userId?.email}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Order Ref: {order._id} | {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    <i className="fa-solid fa-location-dot" style={{ color: 'var(--accent-gold)', marginRight: '0.4rem' }}></i>
                    <strong>Deliver To:</strong> {order.deliveryAddress ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}${order.deliveryAddress.landmark ? ` (Landmark: ${order.deliveryAddress.landmark})` : ''} | 📞 Phone: ${order.deliveryAddress.phone || order.userId?.phoneNumber || 'N/A'}` : 'N/A'}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    <i className="fa-solid fa-credit-card" style={{ color: 'var(--accent-gold)', marginRight: '0.4rem' }}></i>
                    <strong>Payment Method:</strong> {order.paymentMethod || 'Cash on Delivery'}
                  </p>
                </div>

                {/* Ordered Items summary list */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.15)',
                  padding: '1rem 1.5rem',
                  borderRadius: '8px',
                  flexGrow: 1,
                  maxWidth: '500px'
                }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-title)' }}>
                    Items Ordered
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                    {order.items.map((item) => (
                      <li key={item.menuItemId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong style={{ color: 'var(--accent-gold)' }}>{item.quantity}x</strong> {item.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div style={{
                    borderTop: '1px solid var(--border-glass)',
                    marginTop: '0.75rem',
                    paddingTop: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    <span>Grand Total:</span>
                    <span style={{ color: 'var(--accent-gold)' }}>₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Workflow Status Actions Dropdown */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  alignItems: 'flex-end',
                  minWidth: '200px'
                }}>
                  <label htmlFor={`status-${order._id}`} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Advance Status Workflow</label>
                  <select
                    id={`status-${order._id}`}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      padding: '0.6rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-title)',
                      fontWeight: 600,
                      width: '100%'
                    }}
                  >
                    <option value="Pending">Pending Approval</option>
                    <option value="Preparing">Preparing Meal</option>
                    <option value="Ready">Ready for Pick Up</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Completed">Completed / Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SellerOrders;
