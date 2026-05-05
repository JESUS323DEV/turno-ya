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

const FORM_VARS = ["--bg","--accent","--accent-bg","--accent-border","--border","--border-input","--text","--text-h","--btn-text"];

function applyTema({ tema, colorFondo, colorAcento, colorBorde } = {}) {
  const root = document.documentElement;
  FORM_VARS.forEach(v => root.style.removeProperty(v));
  root.removeAttribute("data-tema");

  const formEl = document.getElementById("turno-ya-form");
  if (!formEl) {
    document.body.style.removeProperty("background-color");
    return;
  }

  FORM_VARS.forEach(v => formEl.style.removeProperty(v));

  const preset = TEMAS.find((t) => t.id === tema);

  if (tema === "personalizado") {
    formEl.setAttribute("data-tema", "claro");
    const bg = colorFondo || "#ffffff";
    formEl.style.setProperty("--bg", bg);
    if (colorAcento) {
      formEl.style.setProperty("--accent", colorAcento);
      formEl.style.setProperty("--accent-bg", hexToRgba(colorAcento, 0.12));
      formEl.style.setProperty("--accent-border", hexToRgba(colorAcento, 0.5));
      formEl.style.setProperty("--btn-text", isDark(colorAcento) ? "#fff" : "#111");
    }
    if (colorBorde) formEl.style.setProperty("--border-input", colorBorde);
    if (isDark(bg)) {
      formEl.style.setProperty("--text", "#d1d5db");
      formEl.style.setProperty("--text-h", "#f9fafb");
    }
    document.body.style.backgroundColor = bg;
  } else if (preset) {
    formEl.setAttribute("data-tema", preset.base);
    if (preset.accent) {
      formEl.style.setProperty("--accent", preset.accent);
      formEl.style.setProperty("--accent-bg", hexToRgba(preset.accent, 0.12));
      formEl.style.setProperty("--accent-border", hexToRgba(preset.accent, 0.5));
      formEl.style.setProperty("--btn-text", isDark(preset.accent) ? "#fff" : "#111");
    }
    const bg = preset.bg || (preset.base === "oscuro" ? "#16171d" : "#ffffff");
    formEl.style.setProperty("--bg", bg);
    if (preset.border) formEl.style.setProperty("--border", preset.border);
    document.body.style.backgroundColor = bg;
  } else {
    formEl.setAttribute("data-tema", "claro");
    document.body.style.backgroundColor = "#ffffff";
  }
}

function App() {
  const [vista, setVista] = useState(getVista);

  useEffect(() => {
    const onTema = (e) => applyTema(e.detail);
    window.addEventListener("turno-ya:tema", onTema);
    return () => window.removeEventListener("turno-ya:tema", onTema);
  }, []);

  useEffect(() => {
    if (vista === "reserva") applyTema(getConfig());
    else document.body.style.removeProperty("background-color");
  }, [vista]);

  useEffect(() => {
    const onHash = () => setVista(getVista());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (vista === "admin") return <AdminPanel />;
  return <div id="turno-ya-form"><ReservaWhatsApp /></div>;
}

export default App;
