import { useState } from "react";
import { getPanelVars } from "../../config/temasPanel";
import { ArrowLeft, Settings, FlaskConical, ScrollText, User } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SLUG } from "../../lib/supabase";
import "../../styles/config-tabs/tabCuenta.css";

export default function TabCuenta({ draft, setField, guardar, guardado, errorGuardado, temaPanel, onClose }) {
  const [copiado, setCopiado] = useState(false);

  const copiarWidget = () => {
    const snippet = `<div id="reservaq" data-slug="${SLUG}"></div>\n<link rel="stylesheet" href="https://app.reservaq.com/reservaq.css">\n<script src="https://app.reservaq.com/reservaq.js"></script>`;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  const descargarQR = () => {
    const svg = document.getElementById("reservaq-qr");
    const canvas = document.createElement("canvas");
    canvas.width = 160; canvas.height = 160;
    const img = new Image();
    img.onload = () => {
      canvas.getContext("2d").drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = "qr-reservas.png";
      a.href = canvas.toDataURL();
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(new XMLSerializer().serializeToString(svg));
  };

  return (
    <section className="cfg-cuenta-page" style={getPanelVars(temaPanel)}>
      <div className="cfg-cuenta-inner">

        <div className="cfg-cuenta-topbar">
          <button type="button" className="cfg-cuenta-back" onClick={onClose}>
            <ArrowLeft size={17} />
            <span>Volver</span>
          </button>
          <div className="cfg-cuenta-avatar">
            {draft.logoUrl
              ? <img src={draft.logoUrl} alt="" className="cfg-mobile-avatar-img" />
              : <User size={15} />
            }
          </div>
        </div>

        <div className="cfg-cuenta-head">
          <h2 className="cfg-cuenta-title">Cuenta</h2>
          <p className="cfg-cuenta-subtitle">Gestiona el destino de reservas, contacto y seguridad.</p>
        </div>

        {/* ── 1. Destino de reservas ── */}
        <div className="cfg-cuenta-section">
          <span className="cfg-cuenta-section-label">Destino de reservas</span>
          <div className="cfg-card cfg-card-mobile">
            <label className="cfg-label">
              <span>Modo de envío</span>
              <div className="cfg-tema-selector">
                <button type="button"
                  className={`cfg-tema-btn ${draft.modoEnvio !== "email" ? "cfg-tema-btn--active" : ""}`}
                  onClick={() => setField("modoEnvio", "whatsapp")}>
                  WhatsApp
                </button>
                <button type="button"
                  className={`cfg-tema-btn ${draft.modoEnvio === "email" ? "cfg-tema-btn--active" : ""}`}
                  onClick={() => {
                    setField("modoEnvio", "email");
                    setField("camposActivos", { ...draft.camposActivos, email: true });
                  }}>
                  Email
                </button>
              </div>
            </label>
            {draft.modoEnvio === "email" ? (
              <>
                <label className="cfg-label">
                  <span>Email donde recibes las reservas</span>
                  <input className="cfg-input" type="email" placeholder="tu@email.com"
                    value={draft.emailNegocio ?? ""}
                    onChange={(e) => setField("emailNegocio", e.target.value)} />
                </label>
                <div className="cfg-toggle-row">
                  <span className="cfg-toggle-label1">Enviar confirmación al cliente</span>
                  <label className="cfg-toggle">
                    <input type="checkbox" checked={draft.emailConfirmacion ?? false}
                      onChange={(e) => setField("emailConfirmacion", e.target.checked)} />
                    <span className="cfg-toggle-track" />
                  </label>
                </div>
                <label className="cfg-label">
                  <span>Tipo de formulario</span>
                  <div className="cfg-tema-selector">
                    <button type="button"
                      className={`cfg-tema-btn ${(draft.perfilEmail ?? "reserva") === "reserva" ? "cfg-tema-btn--active" : ""}`}
                      onClick={() => setField("perfilEmail", "reserva")}>
                      Reserva
                    </button>
                    <button type="button"
                      className={`cfg-tema-btn ${(draft.perfilEmail ?? "reserva") === "consulta" ? "cfg-tema-btn--active" : ""}`}
                      onClick={() => setField("perfilEmail", "consulta")}>
                      Consulta
                    </button>
                  </div>
                </label>
              </>
            ) : (
              <label className="cfg-label">
                <span>Número de WhatsApp (sin + ni espacios)</span>
                <input className="cfg-input" type="tel" placeholder="34600000000"
                  maxLength={15} value={draft.whatsapp}
                  onChange={(e) => setField("whatsapp", e.target.value.replace(/[^\d]/g, ""))} />
                <span className="cfg-counter">{draft.whatsapp.length} / 15</span>
              </label>
            )}
          </div>
        </div>

        {/* ── 2. Datos de contacto ── */}
        <div className="cfg-cuenta-section">
          <span className="cfg-cuenta-section-label">Datos de contacto</span>
          <div className="cfg-card cfg-card-mobile">
            <label className="cfg-label">
              <span>Teléfono de contacto visible</span>
              <input className="cfg-input" type="tel" placeholder="+34600000000"
                disabled={!(draft.camposActivos?.telefono ?? true)}
                maxLength={16} value={draft.telefono}
                onChange={(e) => setField("telefono", e.target.value)} />
              <span className="cfg-counter">{draft.telefono.length} / 16</span>
            </label>
            <label className="cfg-label">
              <span>Texto del enlace de teléfono</span>
              <input className="cfg-input" type="text" maxLength={36}
                disabled={!(draft.mostrarTelefono ?? true)}
                value={draft.textoTelefono}
                onChange={(e) => setField("textoTelefono", e.target.value)} />
              <span className="cfg-counter">{draft.textoTelefono.length} / 36</span>
            </label>
            <div className="cfg-toggle-row">
              <span className="cfg-toggle-label1">Mostrar enlace de teléfono</span>
              <label className="cfg-toggle">
                <input type="checkbox" checked={draft.mostrarTelefono ?? true}
                  onChange={(e) => setField("mostrarTelefono", e.target.checked)} />
                <span className="cfg-toggle-track" />
              </label>
            </div>
          </div>
        </div>

        {/* ── 3. Seguridad ── */}
        <div className="cfg-cuenta-section">
          <span className="cfg-cuenta-section-label">Seguridad</span>
          <div className="cfg-card cfg-card-mobile">
            <label className="cfg-label">
              <span>Cambiar PIN de acceso</span>
              <input className="cfg-input" type="password" inputMode="numeric"
                maxLength={8} placeholder="Nuevo PIN" value={draft.pinAdmin}
                onChange={(e) => setField("pinAdmin", e.target.value)} />
              <span className="cfg-counter">{(draft.pinAdmin ?? "").length} / 8</span>
            </label>
          </div>
        </div>

        {/* ── 4. Herramientas ── */}
        <div className="cfg-cuenta-section">
          <span className="cfg-cuenta-section-label">Herramientas</span>
          <div className="cfg-card cfg-card-mobile">
            <p className="cfg-hint">Imprímelo o compártelo para que tus clientes accedan directamente.</p>
            <div className="cfg-qr-wrapper">
              <QRCodeSVG id="reservaq-qr"
                value={window.location.href.replace("#admin", "").replace("#", "") || window.location.origin}
                size={160} level="M" />
            </div>
            <button type="button" className="cfg-btn-secondary" onClick={descargarQR}>
              Descargar QR
            </button>
            <hr className="cfg-modal-sep" />
            <button className="cfg-btn-export" type="button" onClick={copiarWidget}>
              {copiado ? "✓ Copiado" : "Copiar código del widget"}
            </button>
            <hr className="cfg-modal-sep" />
            <p className="cfg-hint">Si la app no refleja los últimos cambios, limpia la caché.</p>
            <button className="cfg-btn-secondary" type="button"
              onClick={() => { localStorage.clear(); window.location.reload(); }}>
              Limpiar caché
            </button>
          </div>
        </div>

        <button className="cfg-btn-primary cfg-cuenta-save" type="button" onClick={guardar}>
          {guardado ? "✓ Guardado" : "Guardar cambios"}
        </button>
        {errorGuardado && <p className="cfg-error">{errorGuardado}</p>}

      </div>
    </section>
  );
}
