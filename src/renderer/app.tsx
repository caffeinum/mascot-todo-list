import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div className="w-screen h-screen flex items-center justify-center cursor-move">
      <div className="text-8xl select-none">
        🥺
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
