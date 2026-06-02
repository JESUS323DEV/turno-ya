import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import FormFinal from "./components/FormFinal";
import { getConfig } from "./config/negocio";
import { TEMAS } from "./config/temas";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function fetchConfigPublica(slug) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/config-publica`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ slug }),
    });
    const json = await res.json();
    if (!res.ok) return null;
    return json.config ?? null;
  } catch {
    return null;
  }
}

/* ── CSS vars base inyectados en <head> (sin contaminar el host con body/root resets) ── */
function injectWidgetStyles() {
  if (document.getElementById("reservaq-styles")) return;
  const s = document.createElement("style");
  s.id = "reservaq-styles";
  s.textContent = `
    #reservaq-form {
      --text: #6b6375; --text-h: #08060d; --bg: #fff; --border: #e5e4e7;
      --code-bg: #f4f3ec; --accent: #aa3bff; --accent-bg: rgba(170,59,255,.1);
      --accent-border: rgba(170,59,255,.5); --btn-text: #fff;
      --sans: 'Inter', system-ui, sans-serif;
      --heading: 'Inter', system-ui, sans-serif;
      --mono: ui-monospace, Consolas, monospace;
      font: 16px/145% var(--sans); letter-spacing: .18px;
      color: var(--text); -webkit-font-smoothing: antialiased;
    }
    @media (prefers-color-scheme: dark) {
      #reservaq-form:not([data-tema="claro"]) {
        --text: #9ca3af; --text-h: #f3f4f6; --bg: #16171d; --border: #2e303a;
        --code-bg: #1f2028; --accent: #c084fc;
        --accent-bg: rgba(192,132,252,.15); --accent-border: rgba(192,132,252,.5);
      }
    }
    [data-tema="claro"]  { --text:#6b6375; --text-h:#08060d; --bg:#fff; --border:#e5e4e7; color-scheme:light; }
    [data-tema="oscuro"] { --text:#9ca3af; --text-h:#f3f4f6; --bg:#16171d; --border:#2e303a;
      --code-bg:#1f2028; --accent:#c084fc; --accent-bg:rgba(192,132,252,.15); --accent-border:rgba(192,132,252,.5); }
  `;
  document.head.appendChild(s);
}

/* ── Helpers de tema (igual que App.jsx) ── */
function _isDark(hex) {
  const h = hex.slice(0, 7);
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
function _rgba(hex, a) {
  const h = hex.slice(0, 7);
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ── Aplica el tema de la config al elemento #reservaq-form ── */
function applyTema({ tema, colorFondo, colorAcento, colorBorde } = {}) {
  const VARS = ["--bg","--accent","--accent-bg","--accent-border","--border","--border-input","--text","--text-h","--btn-text"];
  const el = document.getElementById("reservaq-form");
  if (!el) return;
  VARS.forEach(v => el.style.removeProperty(v));
  el.removeAttribute("data-tema");

  const preset = TEMAS.find(t => t.id === tema);

  if (tema === "personalizado") {
    el.setAttribute("data-tema", "claro");
    const bg = colorFondo || "#ffffff";
    el.style.setProperty("--bg", bg);
    if (colorAcento) {
      el.style.setProperty("--accent", colorAcento);
      el.style.setProperty("--accent-bg", _rgba(colorAcento, 0.12));
      el.style.setProperty("--accent-border", _rgba(colorAcento, 0.5));
      el.style.setProperty("--btn-text", _isDark(colorAcento) ? "#fff" : "#111");
    }
    if (colorBorde) el.style.setProperty("--border-input", colorBorde);
    if (_isDark(bg)) { el.style.setProperty("--text", "#d1d5db"); el.style.setProperty("--text-h", "#f9fafb"); }
  } else if (preset) {
    el.setAttribute("data-tema", preset.base);
    if (preset.accent) {
      el.style.setProperty("--accent", preset.accent);
      el.style.setProperty("--accent-bg", _rgba(preset.accent, 0.12));
      el.style.setProperty("--accent-border", _rgba(preset.accent, 0.5));
      el.style.setProperty("--btn-text", _isDark(preset.accent) ? "#fff" : "#111");
    }
    const bg = preset.bg || (preset.base === "oscuro" ? "#16171d" : "#ffffff");
    el.style.setProperty("--bg", bg);
    if (preset.border) el.style.setProperty("--border", preset.border);
  } else {
    el.setAttribute("data-tema", "claro");
  }
}

/* ── Componente raíz del widget ── */
function WidgetRoot() {
  useEffect(() => { applyTema(getConfig()); }, []);
  return <div id="reservaq-form"><FormFinal /></div>;
}

/* ── Auto-init: soporta data-slug (nuevo) y data-config (legado) ── */
(async function () {
  const el = document.getElementById("reservaq");
  if (!el) return;

  injectWidgetStyles();

  const slug = el.getAttribute("data-slug");
  const rawConfig = el.getAttribute("data-config");

  if (slug) {
    // Nuevo flujo: mostrar skeleton mientras carga la config del servidor
    el.innerHTML = `<div id="reservaq-form" style="min-height:180px;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#9ca3af;font-size:14px">Cargando...</div>`;
    const config = await fetchConfigPublica(slug);
    if (config) {
      window.__RESERVAQ_CONFIG__ = { ...config, slug };
    } else {
      console.warn("[Reservaq] No se pudo cargar la config para el slug:", slug);
    }
    el.innerHTML = "";
  } else if (rawConfig) {
    // Flujo legado: config embebida en el HTML
    try {
      window.__RESERVAQ_CONFIG__ = JSON.parse(rawConfig);
    } catch {
      console.warn("[Reservaq] data-config inválido, usando config por defecto.");
    }
  } else {
    console.warn("[Reservaq] Añade data-slug al elemento #reservaq.");
    return;
  }

  createRoot(el).render(
    <StrictMode>
      <WidgetRoot />
    </StrictMode>
  );
})();
