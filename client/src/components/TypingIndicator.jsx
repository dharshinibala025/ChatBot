import React from 'react';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    height: '24px'
  },
  dot: {
    width: '6px',
    height: '6px',
    backgroundColor: 'var(--text-muted)',
    borderRadius: '50%',
    animation: 'bounceDot 1.4s infinite ease-in-out both'
  },
  dot1: { animationDelay: '-0.32s' },
  dot2: { animationDelay: '-0.16s' },
  dot3: { animationDelay: '0s' }
};

export default function TypingIndicator() {
  return (
    <div style={styles.container}>
      <div style={{...styles.dot, ...styles.dot1}}></div>
      <div style={{...styles.dot, ...styles.dot2}}></div>
      <div style={{...styles.dot, ...styles.dot3}}></div>
    </div>
  );
}
