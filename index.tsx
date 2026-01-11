
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("ATS Pro: Entry point [index.tsx] initialized.");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Critical: Root element #root missing in index.html");
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
