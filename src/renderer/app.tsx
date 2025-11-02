import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

declare global {
  interface Window {
    electronAPI: {
      toggleChat: (show: boolean) => void;
    };
  }
}

function App() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.toggleChat(showChat);
    }
  }, [showChat]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput('');
    }
  };

  if (!showChat) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'move'
      }}>
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setShowChat(true);
          }}
          style={{
            fontSize: '96px',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            cursor: 'pointer'
          }}
        >
          🥺
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      {/* header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        cursor: 'move'
      }}>
        <span style={{ fontSize: '24px' }}>🥺</span>
        <button
          onClick={() => setShowChat(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          ✕
        </button>
      </div>

      {/* messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#999',
            marginTop: '40px',
            fontSize: '14px'
          }}>
            start chatting...
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                background: '#007aff',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '16px',
                maxWidth: '80%',
                alignSelf: 'flex-end',
                fontSize: '14px',
                wordWrap: 'break-word'
              }}
            >
              {msg}
            </div>
          ))
        )}
      </div>

      {/* input */}
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          placeholder="type a message..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '20px',
            border: '1px solid #ddd',
            outline: 'none',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        />
        <button
          onClick={handleSend}
          style={{
            background: '#007aff',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          send
        </button>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
