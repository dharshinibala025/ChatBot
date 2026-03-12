import React, { useState, useRef, useEffect } from 'react';
import { Plus, Mic, Send, UploadCloud, FilePlus, X, Check } from 'lucide-react';
import FilePreview from './FilePreview';

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
    flexDirection: 'column',
    background: 'white',
    border: '1px solid var(--border-light)',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-input)',
    transition: 'all 0.2s ease',
  },
  wrapperFocus: {
    boxShadow: 'var(--shadow-input-focus)',
    borderColor: 'var(--accent)'
  },
  dragActive: {
    borderColor: 'var(--accent)',
    backgroundColor: 'rgba(124, 58, 237, 0.02)'
  },
  dragOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    color: 'var(--accent)',
    fontWeight: '600',
    gap: '8px'
  },
  inputRow: {
    display: 'flex',
    alignItems: 'flex-end',
    padding: '10px 14px',
    gap: '12px'
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
    minHeight: '24px',
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
  },
  errorToast: {
    position: 'absolute',
    top: '-40px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#ef4444',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    boxShadow: 'var(--shadow-md)',
    zIndex: 20,
    animation: 'fadeIn 0.2s ease-out'
  },
  dropdownMenu: {
    position: 'absolute',
    bottom: '60px',
    left: '12px',
    background: 'white',
    borderRadius: '16px',
    padding: '8px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    zIndex: 30,
    minWidth: '220px',
    transformOrigin: 'bottom left',
    animation: 'scaleIn 0.15s ease-out forwards'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--text-main)',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    transition: 'background 0.2s'
  },
  recordingOverlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '8px 4px',
    background: 'transparent'
  },
  recordingLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  pulseDot: {
    width: '12px',
    height: '12px',
    background: '#ef4444',
    borderRadius: '50%',
    animation: 'pulseRed 1.5s infinite'
  },
  recordingText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  recordingTimer: {
    fontFamily: 'monospace',
    fontSize: '15px',
    color: 'var(--text-main)',
    fontWeight: '500'
  },
  recordingActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  actionBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s'
  },
  actionCancel: {
    color: '#ef4444'
  },
  actionConfirm: {
    color: '#10b981',
    background: '#ecfdf5'
  }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ChatInput({ onSendMessage, disabled }) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sessionTranscript, setSessionTranscript] = useState('');

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const dragCounter = useRef(0);
  
  // Web Speech API Refs
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 150) + 'px';
    }
  }, [text]);

  // Click outside listener for Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Voice Recording Engine
  useEffect(() => {
    // Initialize SpeechRecognition on mount if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Update the accumulated transcript state
        setSessionTranscript((prev) => {
          const newTranscript = prev + finalTranscript;
          // Reactively set the final visible text based on history + whatever is currently being spoken
          setText(newTranscript + interimTranscript);
          return newTranscript;
        });
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          showError('Microphone access denied.');
        } else {
          showError(`Recording error: ${event.error}`);
        }
        stopRecordingEngine();
      };

      recognition.onend = () => {
        // Only trigger stop if it wasn't already stopped by the UI
        if (isRecording) {
            stopRecordingEngine();
        }
      };

      recognitionRef.current = recognition;
    }
    
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) {
      showError('Voice recording is not supported in this browser.');
      return;
    }
    
    try {
      setSessionTranscript(text ? text + ' ' : ''); // Append to existing text if any
      setIsRecording(true);
      setRecordingTime(0);
      recognitionRef.current.start();
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      showError('Failed to start microphone.');
    }
  };

  const stopRecordingEngine = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // Ignore stop errors if already stopped
    }
  };

  const handleStopRecording = () => {
    stopRecordingEngine();
    if (text.trim() && !disabled) {
      onSendMessage(text, null);
      setText('');
      setSessionTranscript('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px';
      }
    }
  };

  const handleCancelRecording = () => {
    stopRecordingEngine();
    // Revert text to whatever it was before this recording session (we'll just clear it for simplicity here)
    setText('');
    setSessionTranscript('');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 3000);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      showError('File too large. Maximum size is 10MB.');
      return;
    }
    
    // Basic type validation matching backend
    const allowedPrefixes = ['image/', 'video/', 'text/plain', 'application/pdf', 'application/zip', 'application/vnd', 'application/x-zip'];
    const isAllowed = allowedPrefixes.some(prefix => file.type.startsWith(prefix) || file.type.includes('zip') || file.type.includes('document'));
    
    if (!isAllowed) {
      showError('Unsupported file type.');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFileDataUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFileDataUrl(null);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleSend = () => {
    if ((text.trim() || selectedFile) && !disabled) {
      onSendMessage(text, selectedFile);
      setText('');
      setSelectedFile(null);
      setFileDataUrl(null);
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

  const handleMenuItemClick = (action) => {
    setIsMenuOpen(false);
    if (action === 'file') {
      fileInputRef.current?.click();
    } else {
      showError(`${action} feature coming soon!`);
    }
  };

  const wrapperProps = {
    style: {
      ...styles.wrapper, 
      ...(isFocused ? styles.wrapperFocus : {}),
      ...(isDragActive ? styles.dragActive : {})
    },
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseRed {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
      
      {errorMsg && <div style={styles.errorToast}>{errorMsg}</div>}
      
      <div {...wrapperProps}>
        {isDragActive && (
          <div style={styles.dragOverlay}>
            <UploadCloud size={32} />
            Drop file to attach
          </div>
        )}

        <FilePreview 
          file={selectedFile} 
          fileDataUrl={fileDataUrl} 
          onRemove={() => { setSelectedFile(null); setFileDataUrl(null); }} 
        />
        
        {isMenuOpen && (
          <div style={styles.dropdownMenu} ref={menuRef}>
            <button 
              style={styles.dropdownItem} 
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'} 
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={() => handleMenuItemClick('file')}
            >
              <FilePlus size={18} color="var(--accent)" /> Add photos & files
            </button>
          </div>
        )}

        <div style={styles.inputRow}>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
              e.target.value = null; // reset
            }}
            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
          />
          
          <button 
            style={{...styles.iconBtn, ...(isMenuOpen ? styles.iconBtnHover : {})}}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onMouseEnter={e => {
              if(!isMenuOpen) {
                e.currentTarget.style.background = styles.iconBtnHover.background;
                e.currentTarget.style.color = styles.iconBtnHover.color;
              }
            }}
            onMouseLeave={e => {
              if(!isMenuOpen) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
            title="Attach"
            disabled={disabled}
          >
            <Plus size={20} />
          </button>
          
          {isRecording ? (
             <div style={styles.recordingOverlay}>
               <div style={styles.recordingLeft}>
                 <div style={styles.pulseDot} />
                 <div style={styles.recordingText}>
                   Listening... 
                   <span style={styles.recordingTimer}>{formatTime(recordingTime)}</span>
                 </div>
               </div>
               <div style={styles.recordingActions}>
                 <button 
                  style={{...styles.actionBtn, ...styles.actionCancel}} 
                  onClick={handleCancelRecording}
                  onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  title="Cancel recording"
                 >
                   <X size={18} />
                 </button>
                 <button 
                  style={{...styles.actionBtn, ...styles.actionConfirm}} 
                  onClick={handleStopRecording}
                  onMouseEnter={e => e.currentTarget.style.background = '#d1fae5'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ecfdf5'}
                  title="Stop recording"
                 >
                   <Check size={18} />
                 </button>
               </div>
             </div>
          ) : (
            <>
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
                onClick={startRecording}
                onMouseEnter={e => {
                  e.currentTarget.style.background = styles.iconBtnHover.background;
                  e.currentTarget.style.color = '#ef4444'; // turn red on hover to indicate mic
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
                title="Start Voice Recording"
                disabled={disabled}
              >
                <Mic size={20} />
              </button>
            </>
          )}

          <button 
            style={{
              ...styles.sendBtn, 
              ...((disabled || (!text.trim() && !selectedFile)) ? styles.sendBtnDisabled : styles.sendBtnActive)
            }}
            onClick={handleSend}
            disabled={disabled || (!text.trim() && !selectedFile)}
            title="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
