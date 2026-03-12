import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import LoginModal from './components/LoginModal';
import SettingsModal from './components/SettingsModal';

const API_BASE_URL = 'http://localhost:5000'; // Define backend URL if needed or use relative

export default function App() {
  const [userId, setUserId] = useState(localStorage.getItem('user_id') || null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('user_email') || null);
  const [sessionId, setSessionId] = useState(null); // Always start with a new chat
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Global Settings State
  const defaultSettings = {
    displayName: '',
    username: '',
    email: '',
    darkMode: false,
    themeColor: 'purple',
    fontSize: 'medium',
    bubbleStyle: 'modern',
    autoNewChat: true,
    showHistory: true,
    timestamps: false,
    typingAnimation: true,
    aiStreaming: true,
    responseStyle: 'balanced',
    responseLength: 'auto',
    followUpSuggestions: true,
    smartReplies: false,
    imageUploads: true,
    docUploads: true,
    dragDrop: true,
    desktopNotif: false,
    soundAlerts: false,
    convHistory: true,
    twoFactor: false,
    language: 'en',
    aiLanguage: 'auto'
  };

  const [globalSettings, setGlobalSettings] = useState(() => {
    const saved = localStorage.getItem('chatbot_settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const updateSetting = (key, value) => {
    setGlobalSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('chatbot_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Fetch history when user changes
  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId]);

  // Fetch messages when session changes
  useEffect(() => {
    if (sessionId) {
      loadMessagesForSession(sessionId);
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/history?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  const loadMessagesForSession = async (sid) => {
    try {
      const res = await fetch(`/api/conversation/${sid}`);
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const handleLogin = (id, email) => {
    setUserId(id);
    setUserEmail(email);
    localStorage.setItem('user_id', id);
    localStorage.setItem('user_email', email);
  };

  const handleLogout = () => {
    setUserId(null);
    setUserEmail(null);
    setSessionId(null);
    setMessages([]);
    setHistory([]);
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('session_id');
  };

  const handleSendMessage = async (text, filePayload = null) => {
    if ((!text.trim() && !filePayload) || !userId) return;

    let attachedFile = null;
    setLoading(true);

    // 1. Upload file if present
    if (filePayload) {
      try {
        const formData = new FormData();
        formData.append('file', filePayload);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (uploadRes.ok) {
          attachedFile = await uploadRes.json();
        } else {
          console.error("Upload failed");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Upload network error", err);
        setLoading(false);
        return;
      }
    }

    // 2. Add message to UI
    const newMsg = { 
      role: 'user', 
      content: text, 
      file: attachedFile,
      tempId: Date.now() 
    };
    setMessages((prev) => [...prev, newMsg]);

    // 3. Send chat to bot
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          user_id: userId,
          session_id: sessionId,
          file: attachedFile,
          responseStyle: globalSettings.responseStyle,
          responseLength: globalSettings.responseLength
        })
      });
      const data = await res.json();
      
      const assistantMsg = { role: 'assistant', content: data.reply, tempId: Date.now() + 1 };
      setMessages((prev) => [...prev, assistantMsg]);
      
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
        localStorage.setItem('session_id', data.session_id);
      }
      
      // Refresh history in case it's a new conversation
      loadHistory();
      
    } catch (err) {
      console.error('Send message failed', err);
      const errorMsg = { role: 'assistant', content: 'An error occurred. Please try again.', isError: true, tempId: Date.now() + 2 };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setSessionId(null);
    localStorage.removeItem('session_id');
    setMessages([]);
    if (window.innerWidth < 768 && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const handleSelectSession = (sid) => {
    setSessionId(sid);
    localStorage.setItem('session_id', sid);
    if (window.innerWidth < 768 && sidebarOpen) {
      setSidebarOpen(false); // Close sidebar on mobile after selection
    }
  };

  const handleDeleteSession = async (sid) => {
    try {
      await fetch('/api/conversation/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid })
      });
      if (sessionId === sid) {
        handleNewChat();
      } else {
        loadHistory();
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleRenameSession = async (sid, newTitle) => {
    try {
      await fetch('/api/conversation/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, title: newTitle })
      });
      loadHistory();
    } catch (err) {
      console.error('Rename failed', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch('/api/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      handleNewChat();
      setHistory([]);
    } catch (err) {
      console.error('Clear failed', err);
    }
  };

  return (
    <div 
      className="app-container"
      data-theme={globalSettings.darkMode ? 'dark' : 'light'}
      data-color={globalSettings.themeColor}
      data-font={globalSettings.fontSize}
    >
      {!userId && <LoginModal onLogin={handleLogin} />}
      
      <Sidebar 
        isOpen={sidebarOpen && globalSettings.showHistory} 
        setIsOpen={setSidebarOpen} 
        history={history}
        currentSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDelete={handleDeleteSession}
        onRename={handleRenameSession}
        onClearAll={handleClearAll}
      />
      
      <div className="main-content">
        <Navbar 
          userEmail={userEmail} 
          onLogout={handleLogout} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          setSettingsTab={setSettingsTab}
          showSidebarToggle={globalSettings.showHistory}
          settings={globalSettings}
        />
        
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          settings={globalSettings}
          onUpdate={updateSetting}
          initialTab={settingsTab}
        />
        
        <ChatWindow 
          messages={messages} 
          loading={loading}
          settings={globalSettings}
        />
        
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={loading || !userId}
          settings={globalSettings}
        />
      </div>
    </div>
  );
}
