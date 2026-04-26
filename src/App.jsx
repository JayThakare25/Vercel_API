import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Trash2, User, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'markdown-to-jsx';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: "# Welcome to Gemini Proxy\nThis is your private space for unrestricted AI access. How can I assist you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'ai', 
        content: data.content 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'ai', 
        content: `### ⚠️ Connection Error\n${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ id: Date.now(), role: 'ai', content: "Chat cleared. New session started." }]);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-group">
          <div className="status-dot"></div>
          <h1>GEMINI PROXY</h1>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={clearChat} style={{ background: 'transparent', border: 'none', color: '#777', cursor: 'pointer' }}>
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <main className="chat-window">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`message-tile ${msg.role}`}
            >
              <div className="tile-header">
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                <span>{msg.role === 'user' ? 'You' : 'Assistant'}</span>
              </div>
              <div className="tile-content">
                <div className="markdown">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="message-tile ai">
            <div className="tile-header">
              <Sparkles size={14} />
              <span>Thinking</span>
            </div>
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <div className="footer-container">
        <form onSubmit={handleSubmit} className="input-tile">
          <input
            type="text"
            className="input-field"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
            <ArrowUp size={20} />
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.65rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Encrypted Session • Gemini 2.5 Flash
        </p>
      </div>
    </div>
  );
}

export default App;
