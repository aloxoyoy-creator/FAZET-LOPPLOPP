import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/theme.css';
import './styles/theme-legacy-overrides.css';
import './styles/fazet-themes.css';
import { applyThemePrefs } from './lib/themePrefs';
import App from './App';
import RuntimeErrorBoundary from './components/ui/RuntimeErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { registerPWA } from './pwa';
import { ThemeProvider } from './vendor/schoolhub-ui/context/ThemeContext';

registerPWA();

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root tidak ditemukan.');

applyThemePrefs();
createRoot(root).render(
  <StrictMode>
    <RuntimeErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </RuntimeErrorBoundary>
  </StrictMode>
);
