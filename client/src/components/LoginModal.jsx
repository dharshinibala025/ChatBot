import React, { useState } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    animation: 'fadeIn 0.3s ease-out'
  },
  card: {
    width: '400px',
    maxWidth: '90%',
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: '1.5'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border-light)',
    fontSize: '15px',
    outline: 'none',
    transition: 'border 0.2s, box-shadow 0.2s',
    marginTop: '8px'
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '16px'
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'wait'
  }
};

export default function LoginModal({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onLogin(data.id, data.email);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>
          Enter your email to continue. We'll remember you next time on this device.
        </p>
        
        <div>
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="you@example.com"
            onFocus={e => {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.boxShadow = 'var(--shadow-input-focus)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border-light)';
              e.target.style.boxShadow = 'none';
            }}
            disabled={loading}
          />
          {error && <div style={{color: '#ef4444', fontSize: '13px', marginTop: '8px'}}>{error}</div>}
        </div>
        
        <button 
          type="submit" 
          style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}}
          disabled={loading}
          onMouseEnter={e => { if(!loading) e.currentTarget.style.background = 'var(--accent-hover)'}}
          onMouseLeave={e => { if(!loading) e.currentTarget.style.background = 'var(--accent)'}}
        >
          {loading ? 'Continuing...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
