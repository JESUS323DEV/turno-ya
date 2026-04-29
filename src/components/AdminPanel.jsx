import { useState } from "react";
import { useAdminConfig } from "../hooks/useAdminConfig";
import ReservasPanel from "./ReservasPanel";
import ConfigPanel from "./ConfigPanel";
import "../styles/admin.css";
import "../styles/panel.css";

export default function AdminPanel() {
  const adminConfig = useAdminConfig();
  const { pin, setPin, autenticado, pinError, verificarPin } = adminConfig;
  const [seccion, setSeccion] = useState(null);

  // ── Selector de sección ────────────────────────────────────────────────────
  if (!seccion) {
    return (
      <section className="admin-section">
        <div className="admin-pin-form">
          <h2 className="admin-title">¿A dónde quieres ir?</h2>
          <button className="admin-seccion-btn" onClick={() => setSeccion("reservas")}>
            <span className="admin-seccion-icon">📋</span>
            <span>Panel de reservas</span>
          </button>
          <button className="admin-seccion-btn" onClick={() => setSeccion("config")}>
            <span className="admin-seccion-icon">⚙️</span>
            <span>Configuración</span>
          </button>
        </div>
      </section>
    );
  }

  // ── PIN ────────────────────────────────────────────────────────────────────
  if (!autenticado) {
    return (
      <section className="admin-section">
        <form className="admin-pin-form" onSubmit={verificarPin}>
          <button type="button" className="admin-seccion-back" onClick={() => setSeccion(null)}>← Volver</button>
          <h2 className="admin-title">{seccion === "reservas" ? "Panel de reservas" : "Configuración"}</h2>
          <p className="admin-subtitle">Ingresa el PIN para continuar</p>
          <input
            className={`admin-input ${pinError ? "input-bad" : ""}`}
            type="password"
            inputMode="numeric"
            maxLength={8}
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
          />
          {pinError && <p className="admin-error">{pinError}</p>}
          <button className="admin-btn-primary" type="submit">Entrar</button>
        </form>
      </section>
    );
  }

  // ── Paneles autenticados ───────────────────────────────────────────────────
  if (seccion === "reservas") {
    return <ReservasPanel pin={pin} onBack={() => setSeccion(null)} />;
  }

  return <ConfigPanel config={adminConfig} onBack={() => setSeccion(null)} />;
}
