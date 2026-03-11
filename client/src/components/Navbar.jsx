import React from 'react';
import { Menu, Settings, LogOut } from 'lucide-react';

const styles = {
  navbar: {
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    background: 'var(--bg-panel)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    zIndex: 10,
    flexShrink: 0
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  menuBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'background 0.2s',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logo: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '14px'
  },
  titleWrapper: {
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    fontWeight: '700',
    color: 'var(--text-main)',
    fontSize: '15px',
    lineHeight: '1.2'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    lineHeight: '1.2'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '12px',
    transition: 'background 0.2s'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--accent)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px'
  },
  settingsBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'background 0.2s, color 0.2s',
  }
};

export default function Navbar({ userEmail, onLogout, toggleSidebar, sidebarOpen }) {
  const getInitials = (email) => {
    return email ? email[0].toUpperCase() : 'U';
  };

  return (
    <div style={styles.navbar}>
      <div style={styles.left}>
        {!sidebarOpen && (
          <button 
            style={styles.menuBtn} 
            onClick={toggleSidebar}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Menu size={20} />
          </button>
        )}
        <div style={styles.brand}>
          <div style={styles.logo}>Cb</div>
          <div style={styles.titleWrapper}>
            <div style={styles.title}>Chatbot</div>
            <div style={styles.subtitle}>Ask anything</div>
          </div>
        </div>
      </div>
      
      <div style={styles.right}>
        {userEmail && (
          <>
            <button 
              style={styles.settingsBtn}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
            <button 
              style={styles.avatarBtn} 
              onClick={() => {
                if(window.confirm('Logout?')) onLogout();
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title={`Logged in as ${userEmail}. Click to logout.`}
            >
              <div style={styles.avatar}>{getInitials(userEmail)}</div>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
