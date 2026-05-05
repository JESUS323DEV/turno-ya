export const TEMAS_PANEL = [
  { id: "claro", label: "Claro", vars: {
    "--bg": "#ffffff", "--text": "#6f6f6f", "--text-h": "#111827",
    "--border": "#e5e7eb", "--accent": "#2e2e2e",
    "--accent-bg": "rgba(130, 129, 129, 0.22)", "--btn-text": "#ffffff",
  }},
  { id: "oscuro", label: "Oscuro", vars: {
    "--bg": "#1a1a1a", "--text": "#9ca3af", "--text-h": "#f3f4f6",
    "--border": "#2e2e2e", "--accent": "#f59e0b",
    "--accent-bg": "rgba(245, 158, 11, 0.1)", "--btn-text": "#1a1a1a",
  }},
  { id: "sistema", label: "Sistema", vars: null },
];

export function getPanelVars(id) {
  if (id === "sistema") {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const fallback = TEMAS_PANEL.find(t => t.id === (dark ? "oscuro" : "claro"));
    return fallback?.vars ?? TEMAS_PANEL[0].vars;
  }
  return TEMAS_PANEL.find(t => t.id === id)?.vars ?? TEMAS_PANEL[0].vars;
}
