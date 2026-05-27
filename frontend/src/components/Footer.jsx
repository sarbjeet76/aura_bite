import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="glass-panel" style={{
      marginTop: '5rem',
      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
      borderWidth: '1px 0 0 0',
      background: 'var(--bg-glass)',
      padding: '4rem 0 2rem 0'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-coral))',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="fa-solid fa-utensils" style={{ color: '#000', fontSize: '0.9rem' }}></i>
              </div>
              <span style={{
                fontFamily: 'var(--font-title)',
                fontWeight: 800,
                fontSize: '1.2rem',
                color: 'var(--text-primary)'
              }}>AuraBite</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Experiencing gastronomic excellence! AuraBite delivers premium dishes from top-tier kitchens right to your dining room. Rate, review, and track in real-time.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href="#" className="social-icon"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="social-icon"><i className="fa-brands fa-x-twitter"></i></a>
              <a href="#" className="social-icon"><i className="fa-brands fa-facebook"></i></a>
              <a href="#" className="social-icon"><i className="fa-brands fa-youtube"></i></a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Quick Links</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><a href="#" className="footer-link">Gourmet Restaurants</a></li>
              <li><a href="#" className="footer-link">Trending Dishes</a></li>
              <li><a href="#" className="footer-link">Special Dietary Options</a></li>
              <li><a href="#" className="footer-link">Partner Program</a></li>
              <li><Link to="/enquiry" className="footer-link">Support & Enquiries</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Contact Us</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-location-dot" style={{ color: 'var(--accent-gold)' }}></i>
                <span>451 Foodie Parkway, Suite 100, Culinary City</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-phone" style={{ color: 'var(--accent-gold)' }}></i>
                <span>+91 76****5919</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-envelope" style={{ color: 'var(--accent-gold)' }}></i>
                <span>Sarbjeet@aurabite.com</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-clock" style={{ color: 'var(--accent-gold)' }}></i>
                <span>Support Hours: 08:00 AM - 11:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Join Aura Club</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Subscribe to unlock premium offers, seasonal menus, and culinary events.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="email" placeholder="Enter your email" className="form-input" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
              <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}>Join</button>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-glass)',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <p>© {new Date().getFullYear()} AuraBite Inc.   💕build by Sarbjeet💕    All Rights Reserved. </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Cookie Preferences</a>
          </div>
        </div>
      </div>

      <style>{`
        .social-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-glass);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .social-icon:hover {
          background: var(--accent-gold);
          color: #000;
          transform: translateY(-3px);
          box-shadow: var(--shadow-glow);
        }
        .footer-link {
          text-decoration: none;
          color: var(--text-secondary);
          transition: color var(--transition-fast);
          font-size: 0.9rem;
        }
        .footer-link:hover {
          color: var(--accent-gold);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
