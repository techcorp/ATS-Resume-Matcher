
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("ATS Pro: index.tsx evaluation starting...");

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("ATS Pro Critical: Root element #root missing.");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log("ATS Pro: Root created, rendering App...");
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("ATS Pro: Initial render call complete.");
  } catch (error) {
    console.error("ATS Pro: Failed to mount React application:", error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
