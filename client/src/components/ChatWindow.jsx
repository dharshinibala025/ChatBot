import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import TypingIndicator from './TypingIndicator';
import { Sparkles, Bot, User, FileText, Download } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const styles = {
  container: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    scrollBehavior: 'smooth'
  },
  welcomeWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
    animation: 'fadeIn 0.5s ease-out'
  },
  welcomeIcon: {
    padding: '16px',
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(167, 139, 250, 0.1))',
    borderRadius: '24px',
    marginBottom: '24px',
    color: 'var(--accent)'
  },
  welcomeText: {
    fontSize: '28px',
    fontWeight: '600',
    color: 'var(--text-main)',
    marginBottom: '8px'
  },
  welcomeSubtext: {
    fontSize: '15px',
    color: 'var(--text-muted)'
  },
  messageList: {
    maxWidth: '100%',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  messageRow: (isUser) => ({
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    width: '100%'
  }),
  messageBubble: (isUser) => ({
    maxWidth: '80%',
    display: 'flex',
    gap: '16px'
  }),
  avatar: (isUser) => ({
    width: '32px',
    height: '32px',
    borderRadius: isUser ? '50%' : '8px',
    background: isUser ? 'var(--border-light)' : 'var(--accent)',
    color: isUser ? 'var(--text-main)' : 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }),
  messageContentWrapper: (isUser) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: isUser ? 'flex-end' : 'flex-start',
    maxWidth: '100%'
  }),
  messageContent: (isUser, isError, bubbleStyle) => {
    let baseStyles = {
      padding: '12px 16px',
      fontSize: '1em', // Inherit from data-font in root
      lineHeight: '1.6',
      color: isError ? '#dc2626' : 'var(--text-main)'
    };

    if (bubbleStyle === 'minimal') {
      return {
        ...baseStyles,
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: '0 8px'
      };
    }

    if (bubbleStyle === 'classic') {
      return {
        ...baseStyles,
        borderRadius: '8px',
        background: isUser ? 'var(--bubble-user)' : 'var(--bubble-ai)',
        border: '1px solid var(--border-light)',
        boxShadow: 'none'
      };
    }

    // Default 'modern'
    return {
      ...baseStyles,
      borderRadius: '16px',
      borderTopLeftRadius: !isUser ? '4px' : '16px',
      borderTopRightRadius: isUser ? '4px' : '16px',
      background: isUser ? 'var(--bubble-user)' : 'var(--bubble-ai)',
      border: isUser ? 'none' : '1px solid var(--border-light)',
      boxShadow: isUser ? 'none' : 'var(--shadow-sm)'
    };
  },
  loadingRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%'
  },
  fileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'var(--bg-input-wrapper)',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'var(--text-main)',
    width: 'fit-content',
    minWidth: '200px',
    maxWidth: '100%',
    marginBottom: '8px',
    boxShadow: 'var(--shadow-sm)'
  },
  fileIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'var(--bubble-user)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileDetails: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column'
  },
  fileName: {
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  fileMeta: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  imgAttachment: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '8px',
    marginBottom: '8px',
    objectFit: 'contain'
  }
};

export default function ChatWindow({ messages, loading, settings = {} }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const renderHTML = (content) => {
    const rawMarkup = marked.parse(content || '');
    const cleanMarkup = DOMPurify.sanitize(rawMarkup);
    return { __html: cleanMarkup };
  };

  const renderAttachment = (file) => {
    if (!file) return null;
    
    // Absolute URL mapping for downloaded files
    const fileUrl = file.url.startsWith('http') ? file.url : `${API_BASE}${file.url}`;
    
    if (file.type && file.type.startsWith('image/')) {
      return (
        <a href={fileUrl} target="_blank" rel="noreferrer">
          <img src={fileUrl} alt={file.name} style={styles.imgAttachment} />
        </a>
      );
    }
    
    const sizeKB = Math.round(file.size / 1024);
    
    return (
      <a href={fileUrl} target="_blank" rel="noreferrer" style={styles.fileCard} download={file.name}>
        <div style={styles.fileIconBox}>
          <FileText size={20} />
        </div>
        <div style={styles.fileDetails}>
          <div style={styles.fileName}>{file.name}</div>
          <div style={styles.fileMeta}>{file.type.split('/')[1]?.toUpperCase() || 'FILE'} • {sizeKB} KB</div>
        </div>
        <Download size={16} color="var(--text-muted)" style={{marginLeft: '8px'}} />
      </a>
    );
  };

  if (messages.length === 0 && !loading) {
    return (
      <div style={styles.container}>
        <div style={styles.welcomeWrapper}>
          <div style={styles.welcomeIcon}>
            <Sparkles size={40} />
          </div>
          <div style={styles.welcomeText}>Ready when you are.</div>
          <div style={styles.welcomeSubtext}>Ask me anything or select a conversation.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.messageList}>
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.tempId || index} style={styles.messageRow(isUser)}>
              <div style={styles.messageBubble(isUser)}>
                {!isUser && (
                  <div style={styles.avatar(false)}>
                    <Bot size={20} />
                  </div>
                )}
                <div style={styles.messageContentWrapper(isUser)}>
                  <div style={styles.messageContent(isUser, msg.isError, settings.bubbleStyle)}>
                    {msg.file && renderAttachment(msg.file)}
                    {msg.content && (
                      isUser ? (
                        msg.content
                      ) : (
                        <div 
                          className="prose" 
                          dangerouslySetInnerHTML={renderHTML(msg.content)} 
                        />
                      )
                    )}
                  </div>
                  {settings.timestamps !== false && (
                    <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>
                      {new Date(msg.tempId || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
                {isUser && (
                  <div style={styles.avatar(true)}>
                    <User size={18} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {loading && (
          <div style={styles.loadingRow}>
            <div style={styles.messageBubble(false)}>
              <div style={styles.avatar(false)}>
                <Bot size={20} />
              </div>
              <div style={styles.messageContentWrapper(false)}>
                <div style={styles.messageContent(false, false, settings.bubbleStyle)}>
                  {settings.typingAnimation !== false ? <TypingIndicator /> : <div style={{color: 'var(--text-muted)', fontStyle: 'italic'}}>Generating response...</div>}
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} style={{ height: 1 }} />
      </div>
    </div>
  );
}
