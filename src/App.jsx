import { useEffect, useState } from "react";
import ReservaWhatsApp from "./components/ReservaWhatsApp";
import AdminPanel from "./components/AdminPanel";
import { getConfig } from "./config/negocio";
import { TEMAS } from "./config/temas";

function getVista() {
  return window.location.hash === "#admin" ? "admin" : "reserva";
}

function isDark(hex) {
  const h = hex.slice(0, 7);
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  // luminancia relativa percibida
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function hexToRgba(hex, alpha) {
  const h = hex.slice(0, 7); // ignora canal alpha si viene de 8 chars
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyTema({ tema, colorFondo, colorAcento, colorBorde } = {}) {
  const root = document.documentElement;
  root.style.removeProperty("--bg");
  root.style.removeProperty("--accent");
  root.style.removeProperty("--accent-bg");
  root.style.removeProperty("--accent-border");
  root.style.removeProperty("--border");
  root.style.removeProperty("--border-input");
  root.style.removeProperty("--text");
  root.style.removeProperty("--text-h");
  root.style.removeProperty("--btn-text");

  const preset = TEMAS.find((t) => t.id === tema);

  if (tema === "personalizado") {
    root.setAttribute("data-tema", "claro");
    if (colorFondo) root.style.setProperty("--bg", colorFondo);
    if (colorAcento) {
      root.style.setProperty("--accent", colorAcento);
      root.style.setProperty("--accent-bg", hexToRgba(colorAcento, 0.12));
      root.style.setProperty("--accent-border", hexToRgba(colorAcento, 0.5));
      root.style.setProperty("--btn-text", isDark(colorAcento) ? "#fff" : "#111");
    }
    if (colorBorde) root.style.setProperty("--border-input", colorBorde);
    if (colorFondo && isDark(colorFondo)) {
      root.style.setProperty("--text", "#d1d5db");
      root.style.setProperty("--text-h", "#f9fafb");
    }
  } else if (preset) {
    root.setAttribute("data-tema", preset.base);
    if (preset.accent) {
      root.style.setProperty("--accent", preset.accent);
      root.style.setProperty("--accent-bg", hexToRgba(preset.accent, 0.12));
      root.style.setProperty("--accent-border", hexToRgba(preset.accent, 0.5));
      root.style.setProperty("--btn-text", isDark(preset.accent) ? "#fff" : "#111");
    }
    if (preset.bg) {
      root.style.setProperty("--bg", preset.bg);
    }
    if (preset.border) {
      root.style.setProperty("--border", preset.border);
    }
  } else {
    root.setAttribute("data-tema", "claro");
  }
}

function App() {
  const [vista, setVista] = useState(getVista);

  useEffect(() => {
    applyTema(getConfig());
    const onTema = (e) => applyTema(e.detail);
    window.addEventListener("turno-ya:tema", onTema);
    return () => window.removeEventListener("turno-ya:tema", onTema);
  }, []);

  useEffect(() => {
    const onHash = () => setVista(getVista());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (vista === "admin") return <AdminPanel />;
  return <ReservaWhatsApp />;
}

export default App;
