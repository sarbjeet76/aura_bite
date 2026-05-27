import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Enquiry = () => {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Feedback');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-populate fields if user is logged in
  useEffect(() => {
    if (user) {
      setName(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMessage('Please fill out all contact fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/enquiries', {
        name,
        email,
        subject,
        message,
        userId: user ? user._id : null
      });

      if (res.data.success) {
        setSuccess(true);
        setMessage('');
      }
    } catch (err) {
      console.error('Enquiry post error:', err);
      setErrorMessage(err.response?.data?.message || 'Enquiry submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '4rem', paddingBottom: '5rem', minHeight: '80vh' }}>
      
      <div style={{
        maxWidth: '650px',
        margin: '0 auto',
        animation: 'fadeIn 0.4s ease-out'
      }}>
        {success ? (
          /* SUCCESS STATE PANEL */
          <div className="glass-panel" style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glow)',
            boxShadow: 'var(--shadow-glow)'
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
              margin: '0 auto 2rem auto'
            }}>
              <i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-gold)', fontSize: '3rem' }}></i>
            </div>
            
            <h2 className="glow-text" style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Enquiry Transmitted!
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Thank you for reaching out to AuraBite. Your concierge inquiry has been securely sent. Our dining concierge team will review it and follow up with you at <strong>{email}</strong> shortly.
            </p>
            
            <button 
              className="btn btn-primary" 
              onClick={() => setSuccess(false)}
              style={{ padding: '0.6rem 1.5rem', borderRadius: '10px' }}
            >
              Send Another Enquiry
            </button>
          </div>
        ) : (
          /* FORM STATE PANEL */
          <div className="glass-panel" style={{
            padding: '2.5rem 2rem',
            background: 'var(--bg-secondary)'
          }}>
            {/* Header info */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="badge badge-gold" style={{ marginBottom: '1rem', fontSize: '0.75rem' }}>
                Customer & Demo Support
              </span>
              <h1 style={{
                fontFamily: 'var(--font-title)',
                fontSize: '2.2rem',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
              }}>
                Gourmet Concierge Desk
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Have questions about our catering, partnership opportunities, or order delivery? Drop us a line!
              </p>
            </div>

            {/* Error alerts */}
            {errorMessage && (
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
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form tag */}
            <form onSubmit={handleSubmit}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Name */}
                <div className="form-group">
                  <label htmlFor="enqName">Your Name</label>
                  <input
                    id="enqName"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Your Name "
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="enqEmail">Email Address</label>
                  <input
                    id="enqEmail"
                    type="email"
                    className="form-input"
                    placeholder="e.g. user@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label htmlFor="enqSubject">Enquiry Topic</label>
                <select
                  id="enqSubject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    width: '100%'
                  }}
                >
                  <option value="General Feedback" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>General Feedback</option>
                  <option value="Catering Service Request" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Special Catering Service</option>
                  <option value="Restaurant Partner Request" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Restaurant Partnership</option>
                  <option value="Technical Platform Support" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Technical Platform Support</option>
                  <option value="Active Order & Delivery Issue" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Active Order & Delivery Inquiry</option>
                </select>
              </div>

              {/* Message */}
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label htmlFor="enqMessage">Detailed Message</label>
                <textarea
                  id="enqMessage"
                  className="form-input"
                  rows="5"
                  placeholder="How can our gourmet concierge team assist you today? Please provide order IDs or specific details."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Submit button */}
              <button 
                className="btn btn-primary" 
                type="submit" 
                disabled={isSubmitting} 
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '1.05rem'
                }}
              >
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
                  <span>Send Enquiry</span>
                )}
              </button>

            </form>
          </div>
        )}
      </div>

    </div>
  );
};

export default Enquiry;
