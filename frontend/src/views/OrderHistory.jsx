import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status mapping to integer levels for timeline render
  const statusLevels = {
    'Pending': 1,
    'Preparing': 2,
    'Ready': 3,
    'Out for Delivery': 4,
    'Completed': 5,
    'Cancelled': 0
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Configure WebSockets listener for real-time status updates!
    const socket = getSocket();
    if (socket) {
      console.log('Registering socket listener for customer orders...');
      socket.on('order_status_updated', (updatedOrder) => {
        console.log('Real-time order update received:', updatedOrder);
        
        // Show audio/visual notification toast
        if (Notification.permission === 'granted') {
          new Notification(`Order Status Update!`, {
            body: `Your order from ${updatedOrder.restaurantId?.name} is now ${updatedOrder.status}!`,
            icon: '/vite.svg'
          });
        } else {
          alert(`🔔 Order Status Update: Your order is now "${updatedOrder.status}"!`);
        }

        // Update state
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
      });
    }

    // Request permissions for native browser push alerts
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission();
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('order_status_updated');
      }
    };
  }, []);

  return (
    <div className="container animate-fade-in" style={{ marginTop: '3rem', paddingBottom: '5rem' }}>
      <h1 style={{
        fontFamily: 'var(--font-title)',
        fontSize: '2.2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--accent-gold)' }}></i>
        Your Order History
      </h1>

      {loading ? (
        /* Loading animation block */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '40vh',
          gap: '1rem'
        }}>
          <div className="pulse-glow-box" style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--accent-gold)',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Retrieving your order ledger...</p>
        </div>
      ) : orders.length === 0 ? (
        /* Empty ledger card */
        <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
          <i className="fa-solid fa-pizza-slice" style={{ fontSize: '4rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}></i>
          <h2 style={{ fontFamily: 'var(--font-title)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No Orders Placed</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't ordered any delicious gourmet meals yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map((order) => {
            const currentLevel = statusLevels[order.status];
            
            return (
              <div key={order._id} className="glass-panel" style={{
                padding: '2rem',
                background: 'var(--bg-secondary)',
                border: order.status === 'Out for Delivery' || order.status === 'Ready'
                  ? '1px solid var(--accent-gold)'
                  : '1px solid var(--border-glass)',
                boxShadow: order.status === 'Out for Delivery'
                  ? 'var(--shadow-glow)'
                  : 'var(--shadow-md)',
                animation: order.status === 'Out for Delivery' ? 'pulseGlow 2.5s infinite ease-in-out' : 'none'
              }}>
                {/* Header block info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '1px solid var(--border-glass)',
                  paddingBottom: '1.25rem',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {order.restaurantId?.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Order ID: {order._id} | Placed: {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      <i className="fa-solid fa-location-dot" style={{ color: 'var(--accent-gold)', marginRight: '0.4rem' }}></i>
                      <strong>Delivery Address:</strong> {order.deliveryAddress ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}${order.deliveryAddress.landmark ? ` (Landmark: ${order.deliveryAddress.landmark})` : ''}` : 'N/A'}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <i className="fa-solid fa-credit-card" style={{ color: 'var(--accent-gold)', marginRight: '0.4rem' }}></i>
                      <strong>Payment Method:</strong> {order.paymentMethod || 'Cash on Delivery'}
                    </p>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${order.status === 'Cancelled' ? 'badge-coral' : 'badge-gold'}`} style={{
                      padding: '0.4rem 1rem',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {order.status}
                    </span>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '0.5rem' }}>
                      ₹{order.totalAmount.toFixed(2)}
                    </h4>
                  </div>
                </div>

                {/* Progress bar timeline (Not rendered for Cancelled orders) */}
                {order.status !== 'Cancelled' && (
                  <div style={{ margin: '2rem 0', padding: '0 1rem' }}>
                    <div style={{
                      position: 'relative',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '3px',
                      marginBottom: '1rem'
                    }}>
                      {/* Dynamic Fill percentage */}
                      <div style={{
                        position: 'absolute',
                        height: '100%',
                        background: 'linear-gradient(to right, var(--accent-gold), var(--accent-coral))',
                        width: `${((currentLevel - 1) / 4) * 100}%`,
                        borderRadius: '3px',
                        boxShadow: 'var(--shadow-glow)',
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                      }} />

                      {/* Nodes mapping */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        top: '-5px'
                      }}>
                        {['Placed', 'Preparing', 'Ready', 'Delivery', 'Completed'].map((node, index) => {
                          const isReached = index + 1 <= currentLevel;
                          return (
                            <div key={node} style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: isReached ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
                              border: isReached ? '3px solid #000' : '2px solid var(--border-glass)',
                              boxShadow: isReached ? 'var(--shadow-glow)' : 'none',
                              transition: 'all 0.4s ease'
                            }} />
                          );
                        })}
                      </div>
                    </div>

                    {/* Nodes titles */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      padding: '0 0.2rem'
                    }}>
                      <span>Pending</span>
                      <span>Preparing</span>
                      <span>Ready</span>
                      <span>Out for Delivery</span>
                      <span>Completed</span>
                    </div>
                  </div>
                )}

                {/* item details grid */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.15)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginTop: '1.5rem'
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-title)', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    Itemized Order Details
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {order.items.map((item) => (
                      <li key={item.menuItemId} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.9rem'
                      }}>
                        <div>
                          <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold', marginRight: '0.5rem' }}>
                            {item.quantity}x
                          </span>
                          <span>{item.name}</span>
                        </div>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
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

export default OrderHistory;
