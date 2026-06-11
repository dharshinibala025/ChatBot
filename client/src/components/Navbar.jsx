import React, { useState, useRef, useEffect } from 'react';
import { Menu, Settings, LogOut, User, Palette, MessageSquare, HelpCircle, MessageCircle, Bot } from 'lucide-react';

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
    gap: '12px',
    position: 'relative' // Needed for absolute positioning of profile menu
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
  },
  profileMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: '0',
    width: '280px',
    background: 'var(--bg-panel)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-light)',
    overflow: 'hidden',
    animation: 'scaleIn 0.2s ease-out transform-origin-top-right',
    transformOrigin: 'top right',
    zIndex: 50
  },
  profileHeader: {
    padding: '16px',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'var(--accent)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '20px',
    flexShrink: 0
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  headerName: {
    fontWeight: '600',
    color: 'var(--text-main)',
    fontSize: '15px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  headerEmail: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  menuSection: {
    padding: '8px 0',
    borderBottom: '1px solid var(--border-light)'
  },
  menuItem: {
    width: '100%',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-main)',
    fontSize: '14px',
    transition: 'background 0.2s',
    textAlign: 'left'
  },
  logoutItem: {
    color: '#dc2626'
  }
};

export default function Navbar({ userEmail, onLogout, toggleSidebar, sidebarOpen, setIsSettingsOpen, setSettingsTab, showSidebarToggle = true, settings = {} }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const displayEmail = settings.email || userEmail;
  const displayName = settings.displayName || settings.username || (displayEmail ? displayEmail.split('@')[0] : 'User');

  const getInitials = () => {
    return displayName ? displayName.charAt(0).toUpperCase() : 'U';
  };

  const handleMenuClick = (action) => {
    setIsProfileOpen(false);
    if (action === 'profile') {
      setSettingsTab('profile');
      setIsSettingsOpen(true);
    } else if (action === 'settings') {
      setSettingsTab('profile');
      setIsSettingsOpen(true);
    } else if (action === 'appearance') {
      setSettingsTab('appearance');
      setIsSettingsOpen(true);
    } else if (action === 'history') {
      if (!sidebarOpen) toggleSidebar();
    } else if (action === 'help') {
      setSettingsTab('help');
      setIsSettingsOpen(true);
    } else if (action === 'feedback') {
      setSettingsTab('help');
      setIsSettingsOpen(true);
    } else if (action === 'logout') {
      if(window.confirm('Securely logout?')) onLogout();
    }
  };

  return (
    <div style={styles.navbar}>
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div style={styles.left}>
        {showSidebarToggle && !sidebarOpen && (
          <button 
            style={styles.menuBtn} 
            onClick={toggleSidebar}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--icon-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Menu size={20} />
          </button>
        )}
        <div style={styles.brand}>
          <div style={styles.logo}>
            <Bot size={18} />
          </div>
          <div style={styles.titleWrapper}>
            <div style={styles.title}>AI Assistant</div>
            <div style={styles.subtitle}>Smart AI Assistant</div>
          </div>
        </div>
      </div>
      
      <div style={styles.right} ref={profileRef}>
        {userEmail && (
          <>
            <button 
              style={styles.settingsBtn}
              onClick={() => setIsSettingsOpen(true)}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--icon-hover)';
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
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--icon-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={styles.avatar}>{getInitials()}</div>
            </button>
            
            {isProfileOpen && (
              <div style={styles.profileMenu}>
                <div style={styles.profileHeader}>
                  <div style={styles.headerAvatar}>{getInitials()}</div>
                  <div style={styles.headerInfo}>
                    <div style={styles.headerName}>{displayName}</div>
                    <div style={styles.headerEmail}>{displayEmail}</div>
                  </div>
                </div>
                
                <div style={styles.menuSection}>
                  <button 
                    style={styles.menuItem}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bubble-user)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleMenuClick('profile')}
                  >
                    <User size={16} color="var(--text-muted)" /> My Profile
                  </button>
                  <button 
                    style={styles.menuItem}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bubble-user)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleMenuClick('settings')}
                  >
                    <Settings size={16} color="var(--text-muted)" /> Account Settings
                  </button>
                  <button 
                    style={styles.menuItem}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bubble-user)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleMenuClick('appearance')}
                  >
                    <Palette size={16} color="var(--text-muted)" /> Appearance
                  </button>
                </div>
                
                <div style={styles.menuSection}>
                  <button 
                    style={styles.menuItem}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bubble-user)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleMenuClick('history')}
                  >
                    <MessageSquare size={16} color="var(--text-muted)" /> Chat History
                  </button>
                </div>

                <div style={styles.menuSection}>
                  <button 
                    style={styles.menuItem}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bubble-user)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleMenuClick('help')}
                  >
                    <HelpCircle size={16} color="var(--text-muted)" /> Help & Support
                  </button>
                  <button 
                    style={styles.menuItem}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bubble-user)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleMenuClick('feedback')}
                  >
                    <MessageCircle size={16} color="var(--text-muted)" /> Send Feedback
                  </button>
                </div>

                <div style={{padding: '8px 0'}}>
                  <button 
                    style={{...styles.menuItem, ...styles.logoutItem}}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleMenuClick('logout')}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
