import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { registerSW } from 'virtual:pwa-register';

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredPWAEvent = e;
});

try {
  registerSW({
    onNeedRefresh() {},
    onOfflineReady() {}
  });
} catch(e) {
  console.error('SW Error:', e);
}

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
} catch(e) {
  console.error("Render Error:", e);
  document.body.innerHTML += '<div style="background:red;color:white;padding:20px;">Render Error: ' + e.message + '</div>';
}
