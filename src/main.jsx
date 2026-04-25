import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { fetchConfig } from './lib/supabase.js'
import { CONFIG_KEY, NEGOCIO_DEFAULT } from './config/negocio.js'

import './styles/index.css'
import './styles/Responsive.css'

let touchStartY = 0;
document.addEventListener("touchstart", (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener("touchmove", (e) => {
  if (e.target.closest("input, textarea, select, .slots-grid, .admin-tabs, .admin-turnos")) return;
  const dy = e.touches[0].clientY - touchStartY;
  if (document.scrollingElement.scrollTop === 0 && dy > 0) e.preventDefault();
}, { passive: false });

async function init() {
  try {
    const remota = await fetchConfig();
    if (remota) {
      const { pinAdmin: _, ...sinPin } = remota;
      localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...NEGOCIO_DEFAULT, ...sinPin }));
    } else {
      localStorage.removeItem(CONFIG_KEY);
    }
  } catch {
    // Sin conexión, usa lo que haya en localStorage o defaults
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

init();
