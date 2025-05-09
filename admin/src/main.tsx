import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading application...</div>}>
      <App />
    </Suspense>

  </StrictMode>
);
