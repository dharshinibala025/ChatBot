import React from 'react';
import { X, FileText, FileArchive, File as FileIcon } from 'lucide-react';

const styles = {
  container: {
    padding: '12px',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#f8fafc',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    position: 'relative'
  },
  imageThumb: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid var(--border-light)',
    background: 'white'
  },
  docIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    background: 'var(--bubble-user)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--accent)'
  },
  details: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column'
  },
  name: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  size: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  removeBtn: {
    background: 'rgba(0,0,0,0.5)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'absolute',
    top: '8px',
    right: '8px',
    transition: 'background 0.2s'
  }
};

export default function FilePreview({ file, fileDataUrl, onRemove }) {
  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isZip = file.type.includes('zip');
  
  const getIcon = () => {
    if (isZip) return <FileArchive size={24} />;
    return <FileText size={24} />;
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div style={styles.container}>
      {isImage && fileDataUrl ? (
        <img src={fileDataUrl} alt="preview" style={styles.imageThumb} />
      ) : (
        <div style={styles.docIconWrapper}>
          {getIcon()}
        </div>
      )}
      
      <div style={styles.details}>
        <div style={styles.name}>{file.name}</div>
        <div style={styles.size}>{formatSize(file.size)}</div>
      </div>

      <button 
        style={styles.removeBtn}
        onClick={onRemove}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
        title="Remove file"
      >
        <X size={14} />
      </button>
    </div>
  );
}
