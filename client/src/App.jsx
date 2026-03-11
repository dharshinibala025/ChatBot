import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import LoginModal from './components/LoginModal';

const API_BASE_URL = 'http://localhost:5000'; // Define backend URL if needed or use relative

export default function App() {
  const [userId, setUserId] = useState(localStorage.getItem('user_id') || null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('user_email') || null);
  const [sessionId, setSessionId] = useState(localStorage.getItem('session_id') || null);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

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

  const handleSendMessage = async (text) => {
    if (!text.trim() || !userId) return;

    const newMsg = { role: 'user', content: text, tempId: Date.now() };
    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          user_id: userId,
          session_id: sessionId
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
    <div className="app-container">
      {!userId && <LoginModal onLogin={handleLogin} />}
      
      <Sidebar 
        isOpen={sidebarOpen} 
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
        />
        
        <ChatWindow 
          messages={messages} 
          loading={loading}
        />
        
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={loading || !userId}
        />
      </div>
    </div>
  );
}
