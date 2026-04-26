import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Trash2, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'markdown-to-jsx';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: "How can I help you today?" }
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
        content: `**Error:** ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ id: Date.now(), role: 'ai', content: "New chat started." }]);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="model-selector">
          <span className="model-name">ChatGPT</span>
          <span className="model-version">2.5</span>
          <ChevronDown size={16} color="#b4b4b4" />
        </div>
        <button onClick={clearChat} style={{ background: 'transparent', border: 'none', color: '#b4b4b4', cursor: 'pointer' }}>
          <Trash2 size={18} />
        </button>
      </header>

      <main className="chat-window">
        <AnimatePresence>
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.role}`}>
              {msg.role === 'ai' && (
                <div className="avatar ai">
                  <Sparkles size={18} />
                </div>
              )}
              <div className="message-bubble">
                <div className="markdown">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="avatar user" style={{ marginLeft: '12px' }}>
                  <span>J</span>
                </div>
              )}
            </div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="message-wrapper ai">
            <div className="avatar ai">
              <Sparkles size={18} />
            </div>
            <div className="typing">
              <span>●</span><span>●</span><span>●</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <div className="input-area-wrapper">
        <form onSubmit={handleSubmit} className="input-container">
          <textarea
            className="input-field"
            placeholder="Message ChatGPT..."
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
            <ArrowUp size={20} />
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: '#b4b4b4' }}>
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}

export default App;
