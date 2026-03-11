import React, { useState, useEffect, useRef } from 'react';
import { PanelLeftClose, Plus, MessageSquare, MoreVertical, Pencil, Trash2, Search } from 'lucide-react';

const styles = {
  sidebarContainer: (isOpen) => ({
    width: isOpen ? '260px' : '0px',
    background: 'var(--bg-sidebar)',
    color: 'var(--text-sidebar)',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    zIndex: 20,
    boxShadow: isOpen ? 'inset -1px 0 0 var(--border-sidebar)' : 'none'
  }),
  inner: {
    width: '260px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-sidebar-muted)',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s, color 0.2s'
  },
  newChatBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px 12px',
    background: 'transparent',
    border: '1px solid var(--border-sidebar)',
    borderRadius: '8px',
    color: 'var(--text-sidebar)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginBottom: '16px'
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '16px',
  },
  searchInput: {
    width: '100%',
    background: '#1e293b',
    border: '1px solid transparent',
    borderRadius: '8px',
    padding: '8px 12px 8px 36px',
    color: 'var(--text-sidebar)',
    fontSize: '13px',
    outline: 'none',
    transition: 'border 0.2s, background 0.2s'
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-sidebar-muted)',
  },
  historyList: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingRight: '4px'
  },
  historyItem: (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    background: isActive ? '#1e293b' : 'transparent',
    color: isActive ? 'white' : 'var(--text-sidebar-muted)',
    transition: 'background 0.2s, color 0.2s',
    position: 'relative'
  }),
  itemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0
  },
  itemTitle: {
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  menuBtn: {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7
  },
  dropdown: {
    position: 'absolute',
    right: '0',
    top: '100%',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '4px',
    zIndex: 30,
    minWidth: '120px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    color: '#cbd5e1',
    fontSize: '13px',
    cursor: 'pointer',
    borderRadius: '4px',
    textAlign: 'left'
  },
  dropdownItemHover: {
    background: '#334155'
  },
  dropdownItemDanger: {
    color: '#f87171'
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-sidebar)'
  },
  clearBtn: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-sidebar-muted)',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'background 0.2s, color 0.2s'
  }
};

export default function Sidebar({ isOpen, setIsOpen, history, currentSessionId, onSelectSession, onNewChat, onDelete, onRename, onClearAll }) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredHistory = history.filter(h => h.content.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === id ? null : id);
  };

  const handleRenameClick = (e, id, currentTitle) => {
    e.stopPropagation();
    setMenuOpenId(null);
    const newTitle = window.prompt('Enter new title:', currentTitle);
    if (newTitle && newTitle.trim() !== currentTitle) {
      onRename(id, newTitle.trim());
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setMenuOpenId(null);
    if (window.confirm('Delete this chat?')) {
      onDelete(id);
    }
  };

  return (
    <div style={styles.sidebarContainer(isOpen)}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <button 
            style={styles.closeBtn} 
            onClick={() => setIsOpen(false)}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-sidebar-muted)';
            }}
            title="Close sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        <button 
          style={styles.newChatBtn} 
          onClick={onNewChat}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Plus size={16} />
          New chat
        </button>

        <div style={styles.searchContainer}>
          <Search size={14} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search chats..." 
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={e => {
              e.target.style.background = '#0f172a';
              e.target.style.border = '1px solid #3b82f6';
            }}
            onBlur={e => {
              e.target.style.background = '#1e293b';
              e.target.style.border = '1px solid transparent';
            }}
          />
        </div>

        <div style={styles.historyList}>
          {filteredHistory.map(item => (
            <div 
              key={item.id} 
              style={styles.historyItem(currentSessionId === item.id)}
              onClick={() => onSelectSession(item.id)}
              onMouseEnter={e => { if(currentSessionId !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if(currentSessionId !== item.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={styles.itemContent}>
                <MessageSquare size={16} />
                <span style={styles.itemTitle}>{item.content}</span>
              </div>
              
              <button 
                style={styles.menuBtn}
                onClick={(e) => toggleMenu(e, item.id)}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
              >
                <MoreVertical size={16} />
              </button>

              {menuOpenId === item.id && (
                <div style={styles.dropdown} ref={menuRef}>
                  <button 
                    style={styles.dropdownItem}
                    onClick={(e) => handleRenameClick(e, item.id, item.content)}
                    onMouseEnter={e => e.currentTarget.style.background = styles.dropdownItemHover.background}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Pencil size={14} /> Rename
                  </button>
                  <button 
                    style={{...styles.dropdownItem, ...styles.dropdownItemDanger}}
                    onClick={(e) => handleDeleteClick(e, item.id)}
                    onMouseEnter={e => e.currentTarget.style.background = styles.dropdownItemHover.background}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {filteredHistory.length === 0 && history.length > 0 && searchQuery && (
            <div style={{color: 'var(--text-sidebar-muted)', fontSize: '13px', textAlign: 'center', marginTop: '20px'}}>
              No matches found.
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div style={styles.footer}>
            <button 
              style={styles.clearBtn}
              onClick={() => {
                if(window.confirm('Are you sure you want to clear all conversations?')) {
                  onClearAll();
                }
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#f87171';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-sidebar-muted)';
              }}
            >
              Clear conversations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
