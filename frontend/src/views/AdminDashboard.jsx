import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [enquiriesList, setEnquiriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics'); // metrics, users, moderation, reviews, enquiries

  // Moderation feeds
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingFeeds, setLoadingFeeds] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch Stats
      const statsRes = await axios.get('http://localhost:5000/api/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // Fetch Users
      const usersRes = await axios.get('http://localhost:5000/api/admin/users');
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }

      // Fetch reviews for moderation
      const reviewsRes = await axios.get('http://localhost:5000/api/admin/reviews');
      if (reviewsRes.data.success) {
        setReviewsList(reviewsRes.data.data);
      }

      // Fetch support enquiries
      const enquiriesRes = await axios.get('http://localhost:5000/api/enquiries');
      if (enquiriesRes.data.success) {
        setEnquiriesList(enquiriesRes.data.data);
      }

      // Fetch orders for moderation
      const ordersRes = await axios.get('http://localhost:5000/api/orders');
      if (ordersRes.data.success) {
        setRecentOrders(ordersRes.data.data);
      }

    } catch (error) {
      console.error('Error fetching admin workspace data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();

    // Set up real-time socket updates for Admin dashboard!
    const socket = getSocket();
    if (socket) {
      console.log('Registering socket listener for Admin stats...');
      socket.on('admin_stats_update', (event) => {
        console.log('Admin socket event captured:', event);
        
        // Re-fetch analytical counts to stay fully fresh in real-time!
        // We can manually calculate or trigger a lightweight endpoint call to keep it clean.
        fetchAdminData();
      });
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('admin_stats_update');
      }
    };
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, {
        role: newRole
      });

      if (res.data.success) {
        alert(res.data.message);
        
        // Sync locally
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        fetchAdminData(); // Refresh role tallies
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Role change failed.');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account? All their reviews and restaurant items will be permanently erased.')) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      if (res.data.success) {
        alert('User account deleted successfully.');
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        fetchAdminData();
      }
    } catch (err) {
      alert('Delete account failed.');
    }
  };

  const handleReviewToggleHide = async (reviewId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/reviews/${reviewId}/hide`);
      if (res.data.success) {
        alert(res.data.message);
        setReviewsList((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, isHidden: res.data.data.isHidden } : r))
        );
      }
    } catch (err) {
      alert('Failed to toggle review visibility.');
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer review?')) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/admin/reviews/${reviewId}`);
      if (res.data.success) {
        alert(res.data.message);
        setReviewsList((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      alert('Failed to delete review.');
    }
  };

  const handleEnquiryStatusChange = async (enquiryId, newStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/enquiries/${enquiryId}/status`, {
        status: newStatus
      });
      if (res.data.success) {
        alert(res.data.message);
        setEnquiriesList((prev) =>
          prev.map((e) => (e._id === enquiryId ? { ...e, status: newStatus } : e))
        );
      }
    } catch (err) {
      alert('Enquiry status update failed.');
    }
  };

  const handleEnquiryDelete = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry record?')) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/enquiries/${enquiryId}`);
      if (res.data.success) {
        alert(res.data.message);
        setEnquiriesList((prev) => prev.filter((e) => e._id !== enquiryId));
      }
    } catch (err) {
      alert('Enquiry deletion failed.');
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
        <p style={{ color: 'var(--text-secondary)' }}>Securing master logs...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ marginTop: '3rem', paddingBottom: '5rem' }}>
      
      {/* Page Title */}
      <h1 style={{
        fontFamily: 'var(--font-title)',
        fontSize: '2.2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <i className="fa-solid fa-screwdriver-wrench" style={{ color: 'var(--accent-gold)' }}></i>
        Admin Command Hub
      </h1>

      {/* Admin Tab Controls */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        borderBottom: '1px solid var(--border-glass)',
        marginBottom: '2.5rem',
        paddingBottom: '0.5rem'
      }}>
        {['metrics', 'users', 'moderation', 'reviews', 'enquiries'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="btn"
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: 'var(--radius-full)',
              background: activeTab === tab ? 'var(--accent-gold)' : 'transparent',
              color: activeTab === tab ? '#000' : 'var(--text-secondary)',
              border: activeTab === tab ? 'none' : '1px solid var(--border-glass)',
              fontWeight: 600,
              textTransform: 'capitalize'
            }}
          >
            {tab === 'moderation'
              ? 'Order Auditing'
              : tab === 'reviews'
              ? 'Review Moderation'
              : tab === 'enquiries'
              ? 'Support Enquiries'
              : tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: METRICS COUNTERS */}
      {activeTab === 'metrics' && stats && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Main counts Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-secondary)', textAlign: 'center' }}>
              <i className="fa-solid fa-money-bill-trend-up" style={{ fontSize: '2.2rem', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}></i>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Gross System Revenue</h4>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                ₹{stats.orders?.revenue?.toFixed(2)}
              </h2>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-secondary)', textAlign: 'center' }}>
              <i className="fa-solid fa-cart-shopping" style={{ fontSize: '2.2rem', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}></i>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Completed Transactions</h4>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                {stats.orders?.total}
              </h2>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-secondary)', textAlign: 'center' }}>
              <i className="fa-solid fa-users" style={{ fontSize: '2.2rem', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}></i>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Registered Profiles</h4>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                {stats.users?.total}
              </h2>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-secondary)', textAlign: 'center' }}>
              <i className="fa-solid fa-store" style={{ fontSize: '2.2rem', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}></i>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Operational Outlets</h4>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                {stats.restaurants}
              </h2>
            </div>
          </div>

          {/* User role tallies breakdown */}
          <div className="glass-panel" style={{ padding: '2.5rem', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              User Base Demographics Tally
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              <div style={{ borderLeft: '3px solid var(--accent-gold)', paddingLeft: '1.25rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Customers</p>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem' }}>{stats.users?.customers}</h4>
              </div>
              <div style={{ borderLeft: '3px solid var(--accent-coral)', paddingLeft: '1.25rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sellers / Restaurant Managers</p>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem' }}>{stats.users?.sellers}</h4>
              </div>
              <div style={{ borderLeft: '3px solid #fff', paddingLeft: '1.25rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Master Administrators</p>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem' }}>{stats.users?.admins}</h4>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: USER MANAGER */}
      {activeTab === 'users' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', background: 'var(--bg-secondary)', overflowX: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', marginBottom: '1.5rem', color: '#fff' }}>
            System Account Directory
          </h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 0.5rem' }}>Username</th>
                <th style={{ padding: '1rem 0.5rem' }}>Email Address</th>
                <th style={{ padding: '1rem 0.5rem' }}>Created At</th>
                <th style={{ padding: '1rem 0.5rem' }}>Authority Level (Role)</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>@{u.username}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      disabled={u._id === user._id}
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        cursor: u._id === user._id ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="customer">customer</option>
                      <option value="seller">seller</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                    <button
                      className="btn btn-coral"
                      onClick={() => handleUserDelete(u._id)}
                      disabled={u._id === user._id}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: u._id === user._id ? 'not-allowed' : 'pointer',
                        opacity: u._id === user._id ? 0.4 : 1
                      }}
                    >
                      <i className="fa-solid fa-trash-can" style={{ marginRight: '0.25rem' }}></i>
                      Erase
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: ORDER AUDITING */}
      {activeTab === 'moderation' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', background: 'var(--bg-secondary)' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            System-Wide Transaction Feed
          </h2>

          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
              No orders have been recorded across the platform yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentOrders.map((order) => (
                <div key={order._id} className="glass-panel" style={{
                  padding: '1.25rem',
                  background: 'rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order: {order._id}</span>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginTop: '0.25rem' }}>
                      Customer: @{order.userId?.username} | Restaurant: {order.restaurantId?.name}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Items count: {order.items?.length} | Placed: {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      <i className="fa-solid fa-location-dot" style={{ color: 'var(--accent-gold)', marginRight: '0.3rem' }}></i>
                      Dest: {order.deliveryAddress ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state}` : 'N/A'} | Phone: {order.deliveryAddress?.phone || order.userId?.phoneNumber || 'N/A'} | Pay: {order.paymentMethod || 'COD'}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div>
                      <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{order.status}</span>
                      <h4 style={{ color: 'var(--accent-gold)', marginTop: '0.25rem', fontWeight: 'bold' }}>
                        ₹{order.totalAmount.toFixed(2)}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: REVIEW MODERATION */}
      {activeTab === 'reviews' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', background: 'var(--bg-secondary)', overflowX: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            System-Wide Review Moderation Hub
          </h2>

          {reviewsList.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
              No reviews have been written yet.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Customer</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Restaurant</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Rating</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Comment</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviewsList.map((rev) => (
                  <tr key={rev._id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>@{rev.username}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {rev.restaurantId?.name || 'Unknown Restaurant'}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.1rem' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <i
                            key={s}
                            className="fa-solid fa-star"
                            style={{
                              fontSize: '0.75rem',
                              color: s <= rev.rating ? 'var(--accent-gold)' : 'var(--text-muted)'
                            }}
                          />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', maxWidth: '280px', wordWrap: 'break-word' }}>
                      {rev.comment}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      {rev.isHidden ? (
                        <span className="badge badge-coral" style={{ fontSize: '0.65rem' }}>Hidden</span>
                      ) : (
                        <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Visible</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn"
                          onClick={() => handleReviewToggleHide(rev._id)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            background: rev.isHidden ? 'var(--bg-tertiary)' : 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--border-glass)',
                            color: rev.isHidden ? 'var(--accent-gold)' : 'var(--accent-coral)',
                            cursor: 'pointer'
                          }}
                        >
                          <i className={rev.isHidden ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"} style={{ marginRight: '0.25rem' }}></i>
                          {rev.isHidden ? 'Unhide' : 'Hide'}
                        </button>
                        <button
                          className="btn btn-coral"
                          onClick={() => handleReviewDelete(rev._id)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fa-solid fa-trash-can" style={{ marginRight: '0.25rem' }}></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB CONTENT: SUPPORT ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', background: 'var(--bg-secondary)', overflowX: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Incoming Customer Support & Culinary Enquiries
          </h2>

          {enquiriesList.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
              No client support enquiries have been recorded yet.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Sender Details</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Subject & Topic</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Detailed Message</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Created At</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Resolution Status</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiriesList.map((enq) => (
                  <tr key={enq._id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      <div>{enq.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{enq.email}</div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>{enq.subject}</span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', maxWidth: '300px', wordWrap: 'break-word' }}>
                      {enq.message}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>
                      {new Date(enq.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <select
                        value={enq.status}
                        onChange={(e) => handleEnquiryStatusChange(enq._id, e.target.value)}
                        style={{
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-glass)',
                          color: 'var(--text-primary)',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <button
                        className="btn btn-coral"
                        onClick={() => handleEnquiryDelete(enq._id)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        <i className="fa-solid fa-trash-can" style={{ marginRight: '0.25rem' }}></i>
                        Dismiss
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

export default AdminDashboard;
