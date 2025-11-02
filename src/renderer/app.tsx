import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div className="min-h-screen p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          ai agent overlay
        </h1>
        <p className="text-gray-600 mb-4">
          meow! your overlay is working 🐱
        </p>
        <div className="space-y-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
            <p className="font-semibold">tailwind works!</p>
          </div>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            click me
          </button>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
