import React, { useState, useRef, useEffect } from 'react';
import { Plus, Mic, Send } from 'lucide-react';

const styles = {
  container: {
    padding: '0 24px 24px 24px',
    background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, var(--bg-panel) 50%)',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    flexShrink: 0
  },
  wrapper: {
    maxWidth: '800px',
    width: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    background: 'white',
    border: '1px solid var(--border-light)',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-input)',
    padding: '10px 14px',
    transition: 'all 0.2s ease',
    gap: '12px'
  },
  wrapperFocus: {
    boxShadow: 'var(--shadow-input-focus)',
    borderColor: 'var(--accent)'
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'background 0.2s, color 0.2s'
  },
  iconBtnHover: {
    background: '#f3f4f6',
    color: 'var(--text-main)'
  },
  textarea: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    padding: '8px 4px',
    fontSize: '15px',
    lineHeight: '1.5',
    color: 'var(--text-main)',
    resize: 'none',
    outline: 'none',
    maxHeight: '150px',
    fontFamily: 'inherit'
  },
  sendBtn: {
    background: 'var(--text-main)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 0.2s, opacity 0.2s'
  },
  sendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  sendBtnActive: {
    background: 'var(--accent)',
  }
};

export default function ChatInput({ onSendMessage, disabled }) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'; // Reset
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 150) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSendMessage(text);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px';
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      <div style={{...styles.wrapper, ...(isFocused ? styles.wrapperFocus : {})}}>
        <button 
          style={styles.iconBtn}
          onMouseEnter={e => {
            e.currentTarget.style.background = styles.iconBtnHover.background;
            e.currentTarget.style.color = styles.iconBtnHover.color;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          title="Add attachment"
        >
          <Plus size={20} />
        </button>
        
        <textarea
          ref={textareaRef}
          style={styles.textarea}
          placeholder="Message Chatbot..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={1}
          disabled={disabled}
        />

        <button 
          style={styles.iconBtn}
          onMouseEnter={e => {
            e.currentTarget.style.background = styles.iconBtnHover.background;
            e.currentTarget.style.color = styles.iconBtnHover.color;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          title="Voice input"
        >
          <Mic size={20} />
        </button>

        <button 
          style={{
            ...styles.sendBtn, 
            ...((disabled || !text.trim()) ? styles.sendBtnDisabled : styles.sendBtnActive)
          }}
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          title="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
