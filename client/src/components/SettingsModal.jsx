import React, { useState } from 'react';
import { 
  X, User, Palette, MessageSquare, Brain, FileBox, Bell, Shield, 
  Globe, Link as LinkIcon, HardDrive, HelpCircle, Info, Bot
} from 'lucide-react';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(4px)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  },
  modal: {
    width: '100%',
    maxWidth: '1000px',
    height: '85vh',
    background: 'var(--modal-bg)',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    display: 'flex',
    overflow: 'hidden',
    animation: 'slideUp 0.3s ease-out',
    position: 'relative'
  },
  sidebar: {
    width: '280px',
    background: 'var(--modal-sidebar-bg)',
    borderRight: '1px solid var(--border-light)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    padding: '1.5rem 0'
  },
  sidebarHeader: {
    padding: '0 1.5rem 1rem 1.5rem',
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-main)'
  },
  navItem: {
    padding: '12px 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    borderLeft: '3px solid transparent'
  },
  navItemActive: {
    color: 'var(--accent)',
    background: 'var(--nav-item-active-bg)',
    borderLeftColor: 'var(--accent)',
    fontWeight: '600'
  },
  contentArea: {
    flex: 1,
    padding: '2.5rem',
    overflowY: 'auto',
    background: 'var(--modal-bg)',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    background: 'var(--modal-close-bg)',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    transition: 'all 0.2s',
    zIndex: 10
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '8px'
  },
  sectionSubtitle: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    marginBottom: '2rem'
  },
  formGroup: {
    marginBottom: '1.5rem',
    maxWidth: '600px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-light)',
    background: 'var(--bg-input-wrapper)',
    color: 'var(--text-main)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  toggleWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-light)'
  },
  toggleLabel: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--text-main)'
  },
  toggleSub: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '4px'
  },
  switch: {
    position: 'relative',
    width: '44px',
    height: '24px',
    background: '#e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background 0.3s'
  },
  switchOn: {
    background: 'var(--accent)'
  },
  switchHandle: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    background: 'white',
    borderRadius: '50%',
    transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  switchHandleOn: {
    transform: 'translateX(20px)'
  },
  selectWrapper: {
    position: 'relative',
    maxWidth: '300px'
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-light)',
    fontSize: '14px',
    appearance: 'none',
    background: 'var(--bg-input-wrapper)',
    color: 'var(--text-main)',
    cursor: 'pointer'
  },
  primaryBtn: {
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'opacity 0.2s'
  },
  dangerBtn: {
    background: '#fee2e2',
    color: '#ef4444',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  avatarPreview: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'var(--modal-close-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    marginBottom: '1rem',
    fontSize: '24px',
    fontWeight: '700'
  }
};

const Toggle = ({ label, subLabel, isOn, onToggle }) => (
  <div style={styles.toggleWrapper}>
    <div>
      <div style={styles.toggleLabel}>{label}</div>
      {subLabel && <div style={styles.toggleSub}>{subLabel}</div>}
    </div>
    <div 
      style={{...styles.switch, ...(isOn ? styles.switchOn : {})}}
      onClick={onToggle}
    >
      <div style={{...styles.switchHandle, ...(isOn ? styles.switchHandleOn : {})}} />
    </div>
  </div>
);

export default function SettingsModal({ isOpen, onClose, settings, onUpdate, initialTab = 'profile' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    onUpdate(key, !settings[key]);
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'behavior', icon: Brain, label: 'AI Behavior' },
    { id: 'media', icon: FileBox, label: 'File & Media' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'privacy', icon: Shield, label: 'Privacy & Security' },
    { id: 'language', icon: Globe, label: 'Language' },
    { id: 'integrations', icon: LinkIcon, label: 'Integrations' },
    { id: 'data', icon: HardDrive, label: 'Data Management' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support' },
    { id: 'about', icon: Info, label: 'About' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <h2 style={styles.sectionTitle}>Profile Settings</h2>
            <p style={styles.sectionSubtitle}>Manage your personal information and account details.</p>
            
            <div style={styles.avatarPreview}>U</div>
            <button style={{...styles.primaryBtn, background: 'var(--modal-close-bg)', color: 'var(--text-main)', marginBottom: '1.5rem', marginTop: 0}}>Change Avatar</button>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Display Name</label>
              <input 
                type="text" 
                style={styles.input} 
                placeholder="User" 
                value={settings.displayName || ''} 
                onChange={(e) => onUpdate('displayName', e.target.value)} 
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input 
                type="text" 
                style={styles.input} 
                placeholder="@user" 
                value={settings.username || ''} 
                onChange={(e) => onUpdate('username', e.target.value)} 
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                type="email" 
                style={styles.input} 
                placeholder="user@example.com" 
                value={settings.email || ''} 
                onChange={(e) => onUpdate('email', e.target.value)} 
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <input type="password" style={styles.input} placeholder="Enter new password" />
            </div>
            <button style={{...styles.primaryBtn, marginTop: '0.5rem'}}>Save Password Changes</button>
          </>
        );
      
      case 'appearance':
        return (
          <>
            <h2 style={styles.sectionTitle}>Appearance</h2>
            <p style={styles.sectionSubtitle}>Customize how the chatbot interface looks.</p>
            
            <Toggle label="Dark Mode" subLabel="Switch to a dark UI theme" isOn={settings.darkMode} onToggle={() => handleToggle('darkMode')} />
            
            <div style={{...styles.formGroup, marginTop: '1.5rem'}}>
              <label style={styles.label}>Theme Color</label>
              <div style={styles.selectWrapper}>
                <select style={styles.select} value={settings.themeColor} onChange={(e) => onUpdate('themeColor', e.target.value)}>
                  <option value="purple">Purple (Default)</option>
                  <option value="blue">Ocean Blue</option>
                  <option value="green">Emerald Green</option>
                  <option value="slate">Minimal Slate</option>
                </select>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Font Size</label>
              <div style={styles.selectWrapper}>
                <select style={styles.select} value={settings.fontSize} onChange={(e) => onUpdate('fontSize', e.target.value)}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Chat Bubble Style</label>
              <div style={styles.selectWrapper}>
                <select style={styles.select} value={settings.bubbleStyle} onChange={(e) => onUpdate('bubbleStyle', e.target.value)}>
                  <option value="modern">Modern Rounded</option>
                  <option value="classic">Classic Bubbles</option>
                  <option value="minimal">Minimal Text</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'chat':
        return (
          <>
            <h2 style={styles.sectionTitle}>Chat Settings</h2>
            <p style={styles.sectionSubtitle}>Control how conversations behave and display.</p>
            
            <Toggle label="Start New Chat on Open" subLabel="Automatically launch a fresh chat when opening the app" isOn={settings.autoNewChat} onToggle={() => handleToggle('autoNewChat')} />
            <Toggle label="Show Chat History" subLabel="Display past conversations in the sidebar" isOn={settings.showHistory} onToggle={() => handleToggle('showHistory')} />
            <Toggle label="Message Timestamps" subLabel="Show the exact time messages were sent" isOn={settings.timestamps} onToggle={() => handleToggle('timestamps')} />
            <Toggle label="Typing Animation" subLabel="Show jumping dots while the AI is responding" isOn={settings.typingAnimation} onToggle={() => handleToggle('typingAnimation')} />
            <Toggle label="AI Streaming" subLabel="Stream text response progressively as it generates" isOn={settings.aiStreaming} onToggle={() => handleToggle('aiStreaming')} />
            
            <div style={{marginTop: '2rem'}}>
              <button style={styles.dangerBtn}>Clear Current Chat</button>
            </div>
          </>
        );

      case 'behavior':
        return (
          <>
            <h2 style={styles.sectionTitle}>AI Behavior</h2>
            <p style={styles.sectionSubtitle}>Tune how the reasoning engine formulates its answers.</p>

            <div style={{...styles.formGroup, marginTop: '1rem'}}>
              <label style={styles.label}>Response Style</label>
              <div style={styles.selectWrapper}>
                <select style={styles.select} value={settings.responseStyle} onChange={(e) => onUpdate('responseStyle', e.target.value)}>
                  <option value="creative">Creative & Imaginative</option>
                  <option value="balanced">Balanced & Conversational</option>
                  <option value="precise">Precise & Factual</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Response Length Limit</label>
              <div style={styles.selectWrapper}>
                <select style={styles.select} value={settings.responseLength} onChange={(e) => onUpdate('responseLength', e.target.value)}>
                  <option value="auto">Auto (Context Dependent)</option>
                  <option value="short">Short & Concise</option>
                  <option value="medium">Medium Detail</option>
                  <option value="long">Long & Comprehensive</option>
                </select>
              </div>
            </div>

            <Toggle label="Follow-up Suggestions" subLabel="Suggest next questions to ask the AI" isOn={settings.followUpSuggestions} onToggle={() => handleToggle('followUpSuggestions')} />
            <Toggle label="Smart Replies" subLabel="Offer quick buttons to respond to the AI" isOn={settings.smartReplies} onToggle={() => handleToggle('smartReplies')} />
          </>
        );

      case 'media':
        return (
          <>
            <h2 style={styles.sectionTitle}>File & Media</h2>
            <p style={styles.sectionSubtitle}>Manage attachments, limits, and upload preferences.</p>
            
            <Toggle label="Enable Image Uploads" subLabel="Allow JPG, PNG, WEBP files" isOn={settings.imageUploads} onToggle={() => handleToggle('imageUploads')} />
            <Toggle label="Enable Document Uploads" subLabel="Allow PDF, TXT, DOCX files" isOn={settings.docUploads} onToggle={() => handleToggle('docUploads')} />
            <Toggle label="Drag-and-Drop Editor" subLabel="Drop files anywhere over the input to attach" isOn={settings.dragDrop} onToggle={() => handleToggle('dragDrop')} />

            <div style={{...styles.formGroup, marginTop: '2rem'}}>
              <label style={styles.label}>Maximum Upload Size per File</label>
              <div style={styles.selectWrapper}>
                <select style={styles.select} defaultValue="10">
                  <option value="5">5 MB</option>
                  <option value="10">10 MB (Recommended)</option>
                  <option value="25">25 MB</option>
                  <option value="50">50 MB</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'notifications':
        return (
          <>
            <h2 style={styles.sectionTitle}>Notifications</h2>
            <p style={styles.sectionSubtitle}>Manage how you receive alerts and updates.</p>
            
            <Toggle label="Desktop Push Notifications" subLabel="Get alerted when an AI response finishes in the background" isOn={settings.desktopNotif} onToggle={() => handleToggle('desktopNotif')} />
            <Toggle label="Sound Alerts" subLabel="Play a chime for new messages" isOn={settings.soundAlerts} onToggle={() => handleToggle('soundAlerts')} />
            <Toggle label="Email Summaries" subLabel="Receive weekly usage reports" isOn={false} onToggle={() => {}} />
            <Toggle label="Feature Announcements" subLabel="Be notified of platform updates" isOn={true} onToggle={() => {}} />
          </>
        );

      case 'privacy':
        return (
          <>
            <h2 style={styles.sectionTitle}>Privacy & Security</h2>
            <p style={styles.sectionSubtitle}>Control your data, sessions, and account security.</p>

            <Toggle label="Save Conversation History" subLabel="Automatically store chats to your account" isOn={settings.convHistory} onToggle={() => handleToggle('convHistory')} />
            <Toggle label="Two-Factor Authentication (2FA)" subLabel="Require a code on login" isOn={settings.twoFactor} onToggle={() => handleToggle('twoFactor')} />

            <div style={{...styles.formGroup, marginTop: '1.5rem'}}>
              <label style={styles.label}>Auto-Delete Chats</label>
              <div style={styles.selectWrapper}>
                <select style={styles.select} defaultValue="never">
                  <option value="never">Never (Keep Forever)</option>
                  <option value="7">After 7 Days</option>
                  <option value="30">After 30 Days</option>
                </select>
              </div>
            </div>

            <div style={{marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
               <button style={styles.primaryBtn}>Manage Active Sessions</button>
               <button style={styles.dangerBtn}>Delete Account</button>
            </div>
          </>
        );

      case 'language':
        return (
          <>
            <h2 style={styles.sectionTitle}>Language</h2>
            <p style={styles.sectionSubtitle}>Set localized preferences for the app and AI.</p>

            <div style={styles.formGroup}>
              <label style={styles.label}>Interface Language</label>
              <div style={styles.selectWrapper}>
                <select style={styles.select} value={settings.language} onChange={(e) => onUpdate('language', e.target.value)}>
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>AI Default Language</label>
              <div style={styles.selectWrapper}>
                <select style={styles.select} value={settings.aiLanguage} onChange={(e) => onUpdate('aiLanguage', e.target.value)}>
                  <option value="auto">Auto-Detect</option>
                  <option value="en">Always English</option>
                  <option value="es">Always Spanish</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'integrations':
        return (
          <>
            <h2 style={styles.sectionTitle}>Integrations</h2>
            <p style={styles.sectionSubtitle}>Connect third-party tools and API keys.</p>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div style={{padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <div style={{fontWeight: '600', color: 'var(--text-main)'}}>Google Drive</div>
                  <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>Import documents directly from Drive</div>
                </div>
                <button style={{...styles.primaryBtn, marginTop: 0, padding: '6px 16px', background: 'var(--modal-close-bg)', color: 'var(--text-main)'}}>Connect</button>
              </div>
              
              <div style={{padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <div style={{fontWeight: '600', color: 'var(--text-main)'}}>Dropbox</div>
                  <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>Sync attached files to Dropbox</div>
                </div>
                <button style={{...styles.primaryBtn, marginTop: 0, padding: '6px 16px', background: 'var(--modal-close-bg)', color: 'var(--text-main)'}}>Connect</button>
              </div>
              
              <div style={{padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <div>
                  <div style={{fontWeight: '600', color: 'var(--text-main)'}}>API Sandbox</div>
                  <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>Manage developer access tokens</div>
                </div>
                <button style={{...styles.primaryBtn, marginTop: 0, padding: '6px 16px', background: 'var(--modal-close-bg)', color: 'var(--text-main)'}}>Manage</button>
              </div>
            </div>
          </>
        );

      case 'data':
        return (
          <>
            <h2 style={styles.sectionTitle}>Data Management</h2>
            <p style={styles.sectionSubtitle}>Retain ownership of your histories and files.</p>
            
            <div style={{marginBottom: '2rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span style={styles.label}>Storage Usage</span>
                <span style={{fontSize: '13px', color: 'var(--text-muted)'}}>45MB / 1GB</span>
              </div>
              <div style={{height: '8px', background: 'var(--modal-close-bg)', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{height: '100%', width: '4.5%', background: 'var(--accent)', borderRadius: '4px'}} />
              </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px'}}>
              <button style={{...styles.primaryBtn, marginTop: 0, background: 'var(--modal-close-bg)', color: 'var(--text-main)'}}>Export Chat History (.JSON)</button>
              <button style={{...styles.primaryBtn, marginTop: 0, background: 'var(--modal-close-bg)', color: 'var(--text-main)'}}>Backup Conversations Local</button>
              <button style={{...styles.primaryBtn, marginTop: 0, background: 'var(--modal-close-bg)', color: 'var(--text-main)'}}>Restore Previous Backup</button>
              <button style={{...styles.dangerBtn, marginTop: '1rem'}}>Delete All Logged Data</button>
            </div>
          </>
        );
        
      case 'help':
        return (
          <>
            <h2 style={styles.sectionTitle}>Help & Support</h2>
            <p style={styles.sectionSubtitle}>Get assistance and report platform issues.</p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px'}}>
              <button style={{...styles.primaryBtn, marginTop: 0, background: 'var(--modal-close-bg)', color: 'var(--text-main)'}}>View FAQ Center</button>
              <button style={{...styles.primaryBtn, marginTop: 0, background: 'var(--modal-close-bg)', color: 'var(--text-main)'}}>Contact Support Node</button>
              <button style={{...styles.primaryBtn, marginTop: 0, background: 'var(--modal-close-bg)', color: 'var(--text-main)'}}>Report a Problem</button>
              <button style={{...styles.primaryBtn, marginTop: 0, background: 'var(--modal-close-bg)', color: 'var(--text-main)'}}>Send Feedback</button>
            </div>
          </>
        );

      case 'about':
        return (
          <>
            <h2 style={styles.sectionTitle}>About</h2>
            <p style={styles.sectionSubtitle}>Platform and license details.</p>
            
            <div style={{background: 'var(--modal-sidebar-bg)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem'}}>
                <div style={{width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent), #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
                  <Bot size={22} />
                </div>
                <div>
                  <div style={{fontWeight: 'bold', color: 'var(--text-main)'}}>AI Assistant OS</div>
                  <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>Version 1.0.4 (Build 429)</div>
                </div>
              </div>
              <p style={{fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6'}}>
                Powered by next-gen LLMs and an optimized React framework to deliver high-performance, seamless text interactions securely to your device.
              </p>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px'}}>
              <button style={{...styles.primaryBtn, marginTop: 0, background: 'transparent', textAlign: 'left', padding: '8px 0', color: 'var(--accent)'}}>Terms of Service →</button>
              <button style={{...styles.primaryBtn, marginTop: 0, background: 'transparent', textAlign: 'left', padding: '8px 0', color: 'var(--accent)'}}>Privacy Policy →</button>
              <button style={{...styles.primaryBtn, marginTop: 0, background: 'transparent', textAlign: 'left', padding: '8px 0', color: 'var(--accent)'}}>Open Source Licenses →</button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button 
          style={styles.closeBtn} 
          onClick={onClose}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--modal-close-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--modal-close-bg)'}
        >
          <X size={20} />
        </button>

        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>Settings</div>
          {tabs.map(tab => (
            <div 
              key={tab.id}
              style={{
                ...styles.navItem, 
                ...(activeTab === tab.id ? styles.navItemActive : {})
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              {tab.label}
            </div>
          ))}
        </div>

        <div style={styles.contentArea}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
