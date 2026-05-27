import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const RestaurantDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form States
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Review Edit States
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editError, setEditError] = useState('');

  const fetchDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/restaurants/${id}`);
      if (res.data.success) {
        setRestaurant(res.data.data.restaurant);
        setMenuItems(res.data.data.menuItems);
        setReviews(res.data.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDetails();
  }, [id]);

  const handleAddToCart = (item) => {
    if (!user) {
      alert('Please log in or sign up to add items to your cart.');
      navigate('/auth');
      return;
    }

    if (user.role !== 'customer') {
      alert('Only Customer accounts can place orders.');
      return;
    }

    const added = addToCart({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl
    }, {
      id: restaurant._id,
      name: restaurant.name
    });

    if (added) {
      // Inline flash/indicator could go here
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!user) {
      alert('Please log in or sign up to write a review.');
      navigate('/auth', { state: { showSignUp: true } });
      return;
    }

    if (!newComment.trim()) {
      setFormError('Please write a text comment.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/reviews', {
        restaurantId: restaurant._id,
        rating: newRating,
        comment: newComment
      });

      if (res.data.success) {
        setNewComment('');
        setNewRating(5);
        fetchDetails(); // Reload reviews & restaurant stats
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`);
      if (res.data.success) {
        fetchDetails();
      }
    } catch (err) {
      alert('Failed to delete review.');
    }
  };

  const handleStartEdit = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditError('');
  };

  const handleReviewUpdate = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editComment.trim()) {
      setEditError('Please write a text comment.');
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/reviews/${editingReviewId}`, {
        rating: editRating,
        comment: editComment
      });

      if (res.data.success) {
        setEditingReviewId(null);
        fetchDetails();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to edit review.');
    }
  };

  // Group menu items by category
  const categories = ['Appetizers', 'Mains', 'Drinks', 'Desserts'];

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
        <p style={{ color: 'var(--text-secondary)' }}>Gathering gourmet details...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>
        <h2>Restaurant Not Found</h2>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>
      
      {/* Restaurant Hero banner */}
      <div className="glass-panel" style={{
        margin: '2rem auto',
        maxWidth: '1280px',
        overflow: 'hidden',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Cover image */}
          <div style={{ height: '350px' }}>
            <img 
              src={restaurant.imageUrl} 
              alt={restaurant.name} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }} 
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60';
              }}
            />
          </div>

          {/* Details header info */}
          <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="badge badge-gold" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>
              {restaurant.cuisineType}
            </span>
            <h1 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              {restaurant.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
              {restaurant.description}
            </p>

            <ul style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--border-glass)',
              paddingTop: '1.5rem'
            }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-location-dot" style={{ color: 'var(--accent-gold)' }}></i>
                <span>{restaurant.address}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-clock" style={{ color: 'var(--accent-gold)' }}></i>
                <span>Open hours: {restaurant.openingHours}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-star" style={{ color: 'var(--accent-gold)' }}></i>
                <strong>{restaurant.rating > 0 ? `${restaurant.rating} Stars` : 'New Restaurant'}</strong>
                <span>({restaurant.reviewsCount} critiques)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main content grid: Menu left, reviews right */}
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '2.2fr 1fr',
        gap: '3rem',
        alignItems: 'start'
      }}>
        {/* Left column: menu section */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-book-open" style={{ color: 'var(--accent-gold)' }}></i>
            Gourmet Menu
          </h2>

          {categories.map((category) => {
            const items = menuItems.filter((i) => i.category === category);
            if (items.length === 0) return null;

            return (
              <div key={category} style={{ marginBottom: '2.5rem' }}>
                <h3 style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '1.3rem',
                  borderBottom: '1px solid var(--border-glass)',
                  paddingBottom: '0.5rem',
                  color: 'var(--accent-gold)',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>{category}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {items.map((item) => (
                    <div key={item._id} className="glass-panel" style={{
                      padding: '1.25rem',
                      display: 'flex',
                      gap: '1.25rem',
                      alignItems: 'center',
                      background: 'var(--bg-glass)'
                    }}>
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '10px',
                          objectFit: 'cover'
                        }} 
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60';
                        }}
                      />
                      
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</h4>
                          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                            ₹{item.price.toFixed(2)}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                          {item.description}
                        </p>
                      </div>

                      {/* Add button */}
                      <div>
                        {item.isAvailable ? (
                          <button className="btn btn-primary" onClick={() => handleAddToCart(item)} style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem'
                          }}>
                            <i className="fa-solid fa-cart-plus"></i>
                            <span>Add</span>
                          </button>
                        ) : (
                          <span className="badge badge-coral" style={{ fontSize: '0.7rem' }}>Sold Out</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column: reviews section */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-comments" style={{ color: 'var(--accent-gold)' }}></i>
            Critique Feed
          </h2>

          {/* Star Summary rating */}
          <div className="glass-panel" style={{
            padding: '1.5rem',
            background: 'var(--bg-secondary)',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>
              {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : '0.0'}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem', marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <i key={s} className={`fa-solid fa-star ${s <= Math.round(restaurant.rating) ? 'filled' : ''}`} style={{
                  color: s <= Math.round(restaurant.rating) ? 'var(--accent-gold)' : 'var(--text-muted)'
                }} />
              ))}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Based on {restaurant.reviewsCount} verified user critiques.
            </p>
          </div>

          {/* Review write form */}
          {(!user || user.role === 'customer') && (
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--bg-secondary)' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.15rem', marginBottom: '1rem' }}>Write a Review</h3>
              
              {formError && (
                <div style={{ color: 'var(--accent-coral)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '0.25rem' }}></i>
                  {formError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Your Rating</label>
                  <div className="star-rating" style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <i
                        key={s}
                        className={`fa-solid fa-star ${s <= newRating ? 'filled' : ''}`}
                        onClick={() => setNewRating(s)}
                        style={{
                          fontSize: '1.4rem',
                          cursor: 'pointer',
                          color: s <= newRating ? 'var(--accent-gold)' : 'var(--text-muted)'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="comment">Your Critique</label>
                  <textarea
                    id="comment"
                    className="form-input"
                    rows="3"
                    placeholder="Tell us about the dishes, service, or atmosphere..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                </div>

                <button className="btn btn-primary" type="submit" disabled={submitLoading} style={{
                  width: '100%',
                  padding: '0.6rem',
                  fontSize: '0.9rem'
                }}>
                  {submitLoading ? 'Submitting...' : 'Submit Critique'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews list Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reviews.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '2rem 0' }}>
                No critiques yet. Be the first to leave a review!
              </p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="glass-panel" style={{
                  padding: '1.25rem',
                  background: 'rgba(0, 0, 0, 0.25)',
                  position: 'relative'
                }}>
                  {/* Edit/Delete options overlay */}
                  {user && (user.role === 'admin' || review.userId === user._id) && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '0.5rem' }}>
                      {editingReviewId !== review._id && review.userId === user._id && (
                        <button onClick={() => handleStartEdit(review)} style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}>
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      )}
                      <button onClick={() => handleReviewDelete(review._id)} style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-coral)'}
                         onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  )}

                  {editingReviewId === review._id ? (
                    /* Review editing inline form */
                    <form onSubmit={handleReviewUpdate} style={{ marginTop: '0.5rem' }}>
                      {editError && <p style={{ color: 'var(--accent-coral)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{editError}</p>}
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <i
                              key={s}
                              className={`fa-solid fa-star ${s <= editRating ? 'filled' : ''}`}
                              onClick={() => setEditRating(s)}
                              style={{
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                color: s <= editRating ? 'var(--accent-gold)' : 'var(--text-muted)'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <textarea
                          className="form-input"
                          rows="2"
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Save</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditingReviewId(null)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    /* Display review content */
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>@{review.username}</strong>
                        <div style={{ display: 'flex', gap: '0.1rem' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <i key={s} className="fa-solid fa-star" style={{
                              fontSize: '0.75rem',
                              color: s <= review.rating ? 'var(--accent-gold)' : 'var(--text-muted)'
                            }} />
                          ))}
                        </div>
                      </div>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        lineHeight: '1.5',
                        marginBottom: '0.5rem'
                      }}>{review.comment}</p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(review.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Media styling styles overrides */}
      <style>{`
        @media (max-width: 992px) {
          .container {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RestaurantDetails;
