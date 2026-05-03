import { useState } from "react";
import { Calendar, ClipboardList, Settings } from "lucide-react";
import { useAdminConfig } from "../hooks/useAdminConfig";
import ReservasPanel from "./ReservasPanel";
import ConfigPanel from "./ConfigPanel";
import "../styles/config.css";
import "../styles/reservas.css";

export default function AdminPanel() {
  const adminConfig = useAdminConfig();
  const { pin, setPin, autenticado, pinError, verificarPin } = adminConfig;
  const [seccion, setSeccion] = useState(null);

  // ── 1. PIN (siempre primero) ───────────────────────────────────────────────
  if (!autenticado) {
    return (
      <section className="admin-section admin-login-section">
        <form className="admin-login-card" onSubmit={verificarPin}>
          <div className="admin-login-logo"><Calendar size={40} strokeWidth={1.5} /></div>
          <h2 className="admin-login-title">TurnoYa</h2>
          <p className="admin-login-sub">Panel de administración</p>
          <div className="admin-login-field">
            <input
              className={`admin-input admin-login-input ${pinError ? "input-bad" : ""}`}
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="Introduce tu PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
            {pinError && <p className="admin-error">{pinError}</p>}
          </div>
          <button className="admin-btn-primary admin-login-btn" type="submit">
            Entrar
          </button>
        </form>
      </section>
    );
  }

  // ── 2. Selector de sección (ya autenticado) ────────────────────────────────
  if (!seccion) {
    return (
      <section className="admin-section admin-login-section">
        <div className="admin-login-card">
          <div className="admin-login-logo"><Calendar size={40} strokeWidth={1.5} /></div>
          <h2 className="admin-login-title">TurnoYa</h2>
          <p className="admin-login-sub">¿A dónde quieres ir?</p>
          <div className="admin-selector-btns">
            <button className="admin-selector-btn" onClick={() => setSeccion("reservas")}>
              <span className="admin-selector-icon"><ClipboardList size={26} strokeWidth={1.5} /></span>
              <div>
                <div className="admin-selector-label">Panel de reservas</div>
                <div className="admin-selector-desc">Ver y gestionar reservas</div>
              </div>
            </button>
            <button className="admin-selector-btn" onClick={() => setSeccion("config")}>
              <span className="admin-selector-icon"><Settings size={26} strokeWidth={1.5} /></span>
              <div>
                <div className="admin-selector-label">Configuración</div>
                <div className="admin-selector-desc">Horarios, tema, mensajes</div>
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
