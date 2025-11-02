import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'move'
    }}>
      <div style={{
        fontSize: '96px',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}>
        🥺
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
