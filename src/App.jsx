import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'markdown-to-jsx';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: "Hello! I'm your private AI assistant. How can I help you today?" }
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
        content: `**Error:** ${error.message}. Make sure your GEMINI_API_KEY is configured in Vercel.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ id: Date.now(), role: 'ai', content: "Chat cleared. How can I help you now?" }]);
  };

  return (
    <div className="app-container">
      <div className="bg-mesh"></div>
      
      <header className="header">
        <div className="logo">
          <Sparkles size={28} />
          <h1>Gemini Proxy</h1>
        </div>
        <button onClick={clearChat} className="send-btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '10px' }}>
          <Trash2 size={20} />
        </button>
      </header>

      <main className="chat-window glass">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`message ${msg.role}`}
            >
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.8 }}>
                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                </span>
              </div>
              <div className="markdown">
                <Markdown>{msg.content}</Markdown>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="message ai"
          >
            <div className="markdown">Thinking...</div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </main>

      <form onSubmit={handleSubmit} className="input-container glass-dark" style={{ borderRadius: '24px' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
          <Send size={20} />
        </button>
      </form>
      
      <footer style={{ textAlign: 'center', marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Built for educational purposes. Private & Secure.
      </footer>
    </div>
  );
}

export default App;
