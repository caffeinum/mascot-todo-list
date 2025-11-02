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
    console.log('showChat changed:', showChat);
    if (window.electronAPI) {
      console.log('calling toggleChat with:', showChat);
      window.electronAPI.toggleChat(showChat);
    } else {
      console.log('electronAPI not available');
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
      <div 
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          WebkitAppRegion: 'drag',
          position: 'relative'
        } as any}
      >
        {/* emoji in top-right */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            console.log('emoji clicked!');
            setShowChat(true);
          }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '40px',
            fontSize: '64px',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            cursor: 'pointer',
            WebkitAppRegion: 'no-drag',
            pointerEvents: 'auto',
            zIndex: 999
          } as any}
        >
          🥺
        </div>
        {/* small drag handle to the right of emoji */}
        <div
          style={{
            position: 'absolute',
            top: '32px',
            right: '12px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.3)',
            WebkitAppRegion: 'drag',
            cursor: 'move',
            zIndex: 1000
          } as any}
        />
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      padding: '16px',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* emoji in top-right */}
      <div 
        style={{
          position: 'absolute',
          top: '16px',
          right: '40px',
          fontSize: '64px',
          userSelect: 'none',
          WebkitAppRegion: 'drag',
          zIndex: 999
        } as any}
      >
        🥺
      </div>

      {/* small drag handle to the right of emoji */}
      <div
        style={{
          position: 'absolute',
          top: '32px',
          right: '12px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.3)',
          WebkitAppRegion: 'drag',
          cursor: 'move',
          zIndex: 1000
        } as any}
      />

      {/* chat container */}
      <div style={{
        width: '100%',
        height: '100%',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
        {/* close button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start'
        }}>
          <button
            onClick={() => setShowChat(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '0',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>

        {/* messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '12px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#999',
              fontSize: '14px',
              marginTop: '40px'
            }}>
              start chatting...
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  background: 'white',
                  color: '#333',
                  padding: '12px 16px',
                  borderRadius: '20px',
                  maxWidth: '85%',
                  alignSelf: 'flex-start',
                  fontSize: '14px',
                  wordWrap: 'break-word',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: '-8px',
                  bottom: '12px',
                  width: '0',
                  height: '0',
                  borderRight: '8px solid white',
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent'
                }} />
                {msg}
              </div>
            ))
          )}
        </div>

        {/* input */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
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
            placeholder="Type a message"
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '25px',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              color: '#333'
            }}
          />
          <button
            onClick={handleSend}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#d1d1d6',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              flexShrink: 0
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: 'translateX(1px)' }}>
              <path d="M5 10L15 10M15 10L11 6M15 10L11 14" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
