import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

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
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-title)' }}>Verifying credentials...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    // Redirect to Auth page if not logged in
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to access denied page or main home
    return (
      <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3.5rem', color: 'var(--accent-coral)', marginBottom: '1.5rem' }}></i>
          <h2 className="coral-glow-text" style={{ marginBottom: '1rem', color: 'var(--accent-coral)' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            You do not have the required role privileges to access this dashboard ({allowedRoles.join(', ')}).
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
