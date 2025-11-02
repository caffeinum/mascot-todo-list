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
          alignItems: 'center',
          justifyContent: 'center',
          WebkitAppRegion: 'drag',
          border: '2px solid red',
          position: 'relative'
        } as any}
      >
        {/* drag handle */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.2)',
            WebkitAppRegion: 'drag',
            cursor: 'move',
            zIndex: 1000
          } as any}
        />
        <div 
          onClick={(e) => {
            e.stopPropagation();
            console.log('emoji clicked!');
            setShowChat(true);
          }}
          style={{
            fontSize: '96px',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            cursor: 'pointer',
            WebkitAppRegion: 'no-drag',
            pointerEvents: 'auto',
            border: '2px solid red'
          } as any}
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
      flexDirection: 'row',
      alignItems: 'stretch',
      padding: '16px',
      boxSizing: 'border-box',
      border: '2px solid red',
      position: 'relative',
      gap: '12px'
    }}>
      {/* drag handle */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.2)',
          WebkitAppRegion: 'drag',
          cursor: 'move',
          zIndex: 1000
        } as any}
      />

      {/* chat container on left */}
      <div style={{
        flex: 1,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '3px solid red'
      }}>
        {/* close button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end'
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
          gap: '6px',
          minHeight: '100px',
          maxHeight: '180px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#999',
              fontSize: '12px',
              marginTop: '20px'
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
                  padding: '6px 10px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  alignSelf: 'flex-end',
                  fontSize: '13px',
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
          gap: '6px'
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
              padding: '8px 12px',
              borderRadius: '16px',
              border: '1px solid #ddd',
              outline: 'none',
              fontSize: '13px',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          />
          <button
            onClick={handleSend}
            style={{
              background: '#007aff',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            send
          </button>
        </div>
      </div>

      {/* emoji on right */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitAppRegion: 'drag',
          border: '2px solid red'
        } as any}
      >
        <div style={{ fontSize: '96px', userSelect: 'none', border: '2px solid red' }}>🥺</div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
