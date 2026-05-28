import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  // Home Hero Slider States
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImages = ['/hero-bg.jpg', '/hero1.jpg', '/hero2.jpg', '/hero3.jpg'];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch restaurants
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/restaurants');
        if (res.data.success) {
          setRestaurants(res.data.data);
          setFilteredRestaurants(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Filter restaurants
  useEffect(() => {
    let result = restaurants;

    // Search query filter
    if (searchQuery.trim() !== '') {
      result = result.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisineType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Cuisine filter
    if (selectedCuisine !== 'All') {
      result = result.filter((r) => r.cuisineType === selectedCuisine);
    }

    setFilteredRestaurants(result);
  }, [searchQuery, selectedCuisine, restaurants]);

  // List of unique cuisines
  const cuisinesList = ['All', 'Italian', 'Japanese', 'Mexican', 'Indian', 'Vegan', 'Gourmet Burgers', 'Thai', 'French Pastries'];

  return (
    <div className="animate-fade-in">
      {/* Hero Banner Section */}
      <header className="glass-panel" style={{
        margin: '2rem auto 3rem auto',
        maxWidth: '1280px',
        padding: '5.5rem 3rem',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-glow)'
      }}>
        {/* Sliding Background Images */}
        {heroImages.map((img, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(rgba(9, 12, 21, 0.75), rgba(9, 12, 21, 0.88)), url("${img}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: index === heroIndex ? 1 : 0,
              transition: 'opacity 0.4s ease-in-out',
              zIndex: 0,
              pointerEvents: 'none'
            }}
          />
        ))}

        {/* Glow Ambient Lights */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, var(--accent-gold-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, var(--accent-coral-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ maxWidth: '700px', position: 'relative', zIndex: 1 }}>
          <span className="badge badge-gold" style={{ marginBottom: '1.25rem', fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
            Gastronomic Excellence Delivered
          </span>
          <h1 style={{
            fontSize: '3.5rem',
            fontFamily: 'var(--font-title)',
            lineHeight: '1.15',
            color: '#ffffff',
            marginBottom: '1.5rem',
            letterSpacing: '-1.5px'
          }}>
            Satisfy Your <span style={{
              background: 'linear-gradient(to right, var(--accent-gold), var(--accent-coral))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(245,158,11,0.2)'
            }}>Gastronomic Craving</span>
          </h1>
          <p style={{
            color: '#d1d5db',
            fontSize: '1.2rem',
            lineHeight: '1.6',
            marginBottom: '2.5rem'
          }}>
            Explore premium menu items from top-tier boutique restaurants in your area. Order instantly, monitor status in real-time, and critique reviews with other food lovers.
          </p>

          {/* Search bar inside Hero */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            background: 'rgba(0, 0, 0, 0.45)',
            padding: '0.5rem',
            borderRadius: '16px',
            border: '1px solid var(--border-glass)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '1rem',
              color: '#9ca3af'
            }}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <input
              type="text"
              placeholder="Search by restaurant name or cuisine type..."
              className="form-input"
              style={{
                border: 'none',
                background: 'none',
                padding: '0.75rem 0.5rem',
                fontSize: '1.05rem',
                color: '#ffffff'
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '12px' }}>
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Cuisines Filters */}
      <section className="container" style={{ marginBottom: '3rem' }}>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          scrollbarWidth: 'none'
        }}>
          {cuisinesList.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className="btn"
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-full)',
                background: selectedCuisine === cuisine
                  ? 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))'
                  : 'var(--bg-secondary)',
                color: selectedCuisine === cuisine ? '#000' : 'var(--text-secondary)',
                border: selectedCuisine === cuisine ? 'none' : '1px solid var(--border-glass)',
                whiteSpace: 'nowrap'
              }}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </section>

      {/* Restaurants Display Grid */}
      <main className="container" style={{ marginBottom: '5rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-title)',
          fontSize: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className="fa-solid fa-store" style={{ color: 'var(--accent-gold)' }}></i>
          Popular Gourmet Spotlights
        </h2>

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
            <p style={{ color: 'var(--text-secondary)' }}>Scouting local kitchens...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          /* Empty matches alerts */
          <div className="glass-panel" style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <i className="fa-solid fa-burger-slash" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}></i>
            <h3 style={{ fontFamily: 'var(--font-title)', marginBottom: '0.5rem' }}>No Restaurants Found</h3>
            <p style={{ fontSize: '0.95rem' }}>Try refining your search term or select another cuisine type tag.</p>
          </div>
        ) : (
          <div className="grid-cards">
            {filteredRestaurants.map((restaurant) => (
              <Link
                key={restaurant._id}
                to={`/restaurant/${restaurant._id}`}
                className="glass-panel glass-panel-hover animate-fade-in"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  color: 'inherit',
                  overflow: 'hidden',
                  background: 'var(--bg-secondary)',
                  height: '100%'
                }}
              >
                {/* Image card wrapper */}
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform var(--transition-slow)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px'
                  }}>
                    <span className="badge badge-gold">{restaurant.cuisineType}</span>
                  </div>
                </div>

                {/* Details layout */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                    gap: '0.5rem'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{restaurant.name}</h3>
                    
                    {/* Star Rating Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--accent-gold)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      <i className="fa-solid fa-star" style={{ fontSize: '0.75rem' }}></i>
                      <span>{restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'New'}</span>
                    </div>
                  </div>

                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    marginBottom: '1.25rem',
                    flexGrow: 1
                  }}>
                    {restaurant.description.substring(0, 95)}...
                  </p>

                  <div style={{
                    borderTop: '1px solid var(--border-glass)',
                    paddingTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                  }}>
                    <div>
                      <i className="fa-solid fa-clock" style={{ marginRight: '0.4rem', color: 'var(--accent-gold)' }}></i>
                      <span>{restaurant.openingHours}</span>
                    </div>
                    <div>
                      <i className="fa-solid fa-message" style={{ marginRight: '0.4rem', color: 'var(--accent-gold)' }}></i>
                      <span>{restaurant.reviewsCount} reviews</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Home;
