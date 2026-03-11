import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import TypingIndicator from './TypingIndicator';
import { Sparkles, Bot, User } from 'lucide-react';

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
    maxWidth: '800px',
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
    background: isUser ? '#e2e8f0' : 'var(--accent)',
    color: isUser ? '#64748b' : 'white',
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
  messageContent: (isUser, isError) => ({
    padding: '12px 16px',
    borderRadius: '16px',
    borderTopLeftRadius: !isUser ? '4px' : '16px',
    borderTopRightRadius: isUser ? '4px' : '16px',
    background: isUser ? 'var(--bubble-user)' : 'var(--bubble-ai)',
    color: isError ? '#dc2626' : (isUser ? '#0f172a' : 'var(--text-main)'),
    border: isUser ? 'none' : '1px solid var(--border-light)',
    fontSize: '15px',
    lineHeight: '1.6',
    boxShadow: isUser ? 'none' : 'var(--shadow-sm)'
  }),
  loadingRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%'
  }
};

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const renderHTML = (content) => {
    const rawMarkup = marked.parse(content || '');
    const cleanMarkup = DOMPurify.sanitize(rawMarkup);
    return { __html: cleanMarkup };
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
                  <div style={styles.messageContent(isUser, msg.isError)}>
                    {isUser ? (
                      msg.content
                    ) : (
                      <div 
                        className="prose" 
                        dangerouslySetInnerHTML={renderHTML(msg.content)} 
                      />
                    )}
                  </div>
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
                <div style={styles.messageContent(false, false)}>
                  <TypingIndicator />
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
