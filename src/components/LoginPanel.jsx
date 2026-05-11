import { useState } from "react";
import { Calendar, ClipboardList, Settings } from "lucide-react";
import { useAdminConfig } from "../hooks/useAdminConfig";
import { getPanelVars } from "../config/temasPanel";
import ReservasPanel from "./ReservasPanel";
import ConfigPanel from "./ConfigPanel";
import "../styles/loginPanel.css";
import "../styles/configPanel.css";
import "../styles/reservasPanel.css";
import "../styles/responsiveConfigPanel.css";
import "../styles/responsiveReservasPanel.css";

export default function LoginPanel() {
  const adminConfig = useAdminConfig();
  const { pin, setPin, autenticado, pinError, verificarPin } = adminConfig;
  const [seccion, setSeccion] = useState(null);

  const temaPanel = localStorage.getItem("turno-ya-tema-panel") || "claro";
  const panelVars = getPanelVars(temaPanel);

  // ── 1. PIN (siempre primero) ───────────────────────────────────────────────
  if (!autenticado) {
    return (
      <section className="cfg-section login-section" style={panelVars}>
        <form className="login-card" onSubmit={verificarPin}>
          <div className="login-logo"><Calendar size={40} strokeWidth={1.5} /></div>
          <h2 className="login-title">TurnoYa</h2>
          <p className="login-sub">Panel de administración</p>
          <div className="login-field">
            <input
              className={`cfg-input login-input ${pinError ? "input-bad" : ""}`}
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="Introduce tu PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
            {pinError && <p className="cfg-error">{pinError}</p>}
          </div>
          <button className="cfg-btn-primary login-btn" type="submit">
            Entrar
          </button>
        </form>
      </section>
    );
  }

  // ── 2. Selector de sección (ya autenticado) ────────────────────────────────
  if (!seccion) {
    return (
      <section className="cfg-section login-section" style={panelVars}>
        <div className="login-card">
          <div className="login-logo"><Calendar size={40} strokeWidth={1.5} /></div>
          <h2 className="login-title">TurnoYa</h2>
          <p className="login-sub">¿A dónde quieres ir?</p>
          <div className="login-selector-btns">
            <button className="login-selector-btn" onClick={() => setSeccion("reservas")}>
              <span className="login-selector-icon"><ClipboardList size={26} strokeWidth={1.5} /></span>
              <div>
                <div className="login-selector-label">Panel de reservas</div>
                <div className="login-selector-desc">Ver y gestionar reservas</div>
              </div>
            </button>
            <button className="login-selector-btn" onClick={() => setSeccion("config")}>
              <span className="login-selector-icon"><Settings size={26} strokeWidth={1.5} /></span>
              <div>
                <div className="login-selector-label">Configuración</div>
                <div className="login-selector-desc">Horarios, tema, mensajes</div>
              </div>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── 3. Paneles (autenticado + sección elegida) ─────────────────────────────
  if (seccion === "reservas") {
    return <ReservasPanel pin={pin} onBack={() => setSeccion(null)} />;
  }

  return <ConfigPanel config={adminConfig} onBack={() => setSeccion(null)} />;
}
