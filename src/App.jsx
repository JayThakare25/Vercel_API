import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'markdown-to-jsx';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: "Private AI Assistant. How can I help you today?" }
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
        content: `Error: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ id: Date.now(), role: 'ai', content: "Chat cleared." }]);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <h1>Gemini Proxy</h1>
        </div>
        <button onClick={clearChat} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer' }}>
          <Trash2 size={18} />
        </button>
      </header>

      <main className="chat-window">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`message ${msg.role}`}
            >
              <span className="message-label">{msg.role === 'user' ? 'You' : 'Assistant'}</span>
              <div className="message-content">
                <div className="markdown">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="message ai">
            <span className="message-label">Assistant</span>
            <div className="typing">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <div className="input-container-wrapper">
        <form onSubmit={handleSubmit} className="input-container">
          <input
            type="text"
            className="input-field"
            placeholder="Message Gemini..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
            <ArrowUp size={18} />
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '12px', color: '#333', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Unrestricted Access • Powered by Gemini 2.5
        </div>
      </div>
    </div>
  );
}

export default App;
