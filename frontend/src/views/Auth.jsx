import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.state?.showSignUp ? false : true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('customer'); // default
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, user, error: authError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    // Validation
    if (!email || !password || (!isLogin && (!username || !phoneNumber))) {
      setFormError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    if (!isLogin && !/^[0-9+\-\s()]{8,20}$/.test(phoneNumber)) {
      setFormError('Please enter a valid phone number (at least 8 digits).');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password, role, phoneNumber);
      }
      navigate('/');
    } catch (err) {
      console.error('Auth submission error:', err);
      // Auth error is captured in context, local state is just backup
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearInputs = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setRole('customer');
    setFormError('');
  };

  return (
    <div className="container" style={{
      marginTop: '5rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2.5rem 2rem',
        background: 'var(--bg-glass)'
      }}>
        {/* Tab Toggle buttons */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-glass)',
          marginBottom: '2rem'
        }}>
          <button onClick={() => { setIsLogin(true); clearInputs(); }} style={{
            flex: 1,
            background: 'none',
            border: 'none',
            borderBottom: isLogin ? '2px solid var(--accent-gold)' : '2px solid transparent',
            color: isLogin ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-title)',
            fontSize: '1.1rem',
            fontWeight: 600,
            paddingBottom: '0.75rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}>
            Log In
          </button>
          <button onClick={() => { setIsLogin(false); clearInputs(); }} style={{
            flex: 1,
            background: 'none',
            border: 'none',
            borderBottom: !isLogin ? '2px solid var(--accent-gold)' : '2px solid transparent',
            color: !isLogin ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-title)',
            fontSize: '1.1rem',
            fontWeight: 600,
            paddingBottom: '0.75rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}>
            Sign Up
          </button>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-title)',
          fontSize: '1.75rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: 'var(--text-primary)'
        }}>
          {isLogin ? 'Welcome Back!' : 'Create Your Account'}
        </h2>

        {/* Errors display */}
        {(formError || authError) && (
          <div className="glass-panel" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            color: 'var(--accent-coral)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{formError || authError}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  placeholder="e.g. foodlover99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Contact Phone Number</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="e.g. delicious@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: isLogin ? '1.5rem' : '1.25rem' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label>Select User Role</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                <label className="radio-label" style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: role === 'customer' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0,0,0,0.2)',
                  border: role === 'customer' ? '1px solid var(--accent-gold)' : '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  color: role === 'customer' ? 'var(--accent-gold)' : 'var(--text-secondary)'
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={role === 'customer'}
                    onChange={() => setRole('customer')}
                    style={{ accentColor: 'var(--accent-gold)' }}
                  />
                  <span>Customer</span>
                </label>
                
                <label className="radio-label" style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: role === 'seller' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0,0,0,0.2)',
                  border: role === 'seller' ? '1px solid var(--accent-gold)' : '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  color: role === 'seller' ? 'var(--accent-gold)' : 'var(--text-secondary)'
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={role === 'seller'}
                    onChange={() => setRole('seller')}
                    style={{ accentColor: 'var(--accent-gold)' }}
                  />
                  <span>Restaurant Owner</span>
                </label>
              </div>
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{
            width: '100%',
            padding: '0.9rem',
            fontSize: '1.05rem',
            marginTop: '0.5rem'
          }}>
            {isSubmitting ? (
              <div className="pulse-glow-box" style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid #000',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <span>{isLogin ? 'Log In' : 'Sign Up & Begin Done'}</span>
            )}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Auth;
