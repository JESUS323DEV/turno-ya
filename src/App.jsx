import { useEffect, useState } from "react";
import FormFinal from "./components/FormFinal";
import LoginPanel from "./components/LoginPanel";
import PrivacidadPage from "./components/PrivacidadPage";
import LegalPage from "./components/LegalPage";
import { getConfig } from "./config/negocio";
import { TEMAS } from "./config/temas";
import { getSubpage } from "./lib/supabase";

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

const FORM_VARS = ["--bg", "--bg-gradient", "--accent", "--accent-bg", "--accent-border", "--border", "--border-input", "--text", "--text-h", "--btn-text", "--text-desc"];

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
  formEl.style.removeProperty("background-image");
  formEl.style.removeProperty("background-size");
  formEl.style.removeProperty("background-position");
  formEl.style.removeProperty("background-repeat");
  formEl.style.removeProperty("background-color");
  formEl.style.removeProperty("background");
  document.body.style.removeProperty("background-image");
  document.body.style.removeProperty("background-size");
  document.body.style.removeProperty("background-repeat");
  document.body.style.removeProperty("background-position");

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
    if (preset.bgSolid) formEl.style.setProperty("--bg-solid", preset.bgSolid);
    else formEl.style.removeProperty("--bg-solid");
    if (preset.border) formEl.style.setProperty("--border", preset.border);
    if (preset.textDesc) formEl.style.setProperty("--text-desc", preset.textDesc);
    if (preset.bgImage) {
      document.body.style.backgroundImage = `url("${preset.bgImage}")`;
      document.body.style.backgroundSize = " auto 100% ";
      document.body.style.backgroundPosition = "center top";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundImage = `
  linear-gradient(rgba(0,0,0,0.10), rgba(0, 0, 0, 0.1)),
  url("${preset.bgImage}")
`;
      formEl.style.setProperty("background-color", "transparent");
    }
    if (preset.gradient) {
      document.body.style.backgroundImage = preset.gradient;
    }
    document.body.style.backgroundColor = bg;
  } else {
    formEl.setAttribute("data-tema", "claro");
    document.body.style.backgroundColor = "#ffffff";
  }
}

function App() {
  const subpage = getSubpage();
  const [vista, setVista] = useState(getVista);

  useEffect(() => {
    const onTema = (e) => { if (vista === "reserva") applyTema(e.detail); };
    window.addEventListener("turno-ya:tema", onTema);
    return () => window.removeEventListener("turno-ya:tema", onTema);
  }, [vista]);

  useEffect(() => {
    if (vista === "reserva") applyTema(getConfig());
    else document.body.style.removeProperty("background-color");
  }, [vista]);

  useEffect(() => {
    const onHash = () => setVista(getVista());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (subpage === "privacidad") return <PrivacidadPage />;
  if (subpage === "legal") return <LegalPage />;
  if (vista === "admin") return <LoginPanel />;
  return <div id="turno-ya-form"><FormFinal /></div>;
}

export default App;
