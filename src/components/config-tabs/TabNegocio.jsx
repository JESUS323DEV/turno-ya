import { useState } from "react";
import { User, UserCheck, Phone, Mail, Users, Calendar, Clock, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { PERFILES } from "../../config/perfiles";
import { TEMAS } from "../../config/temas";
import "../../styles/config-tabs/tabNegocio.css";

const TEMAS_PREVIEW = TEMAS.filter(t => t.id !== "personalizado");

function getPreviewBg(theme) {
  if (theme.bgImage) return { backgroundImage: `url(${theme.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" };
  return { background: theme.gradient || theme.bg || "transparent" };
}

export default function TabNegocio({ draft, setField }) {
  const [previewHistory, setPreviewHistory] = useState([0]);
  const [historyPos, setHistoryPos] = useState(0);
  const currentTheme = TEMAS_PREVIEW[previewHistory[historyPos]];

  const goNext = () => {
    if (historyPos < previewHistory.length - 1) {
      setHistoryPos(p => p + 1);
      return;
    }
    const len = TEMAS_PREVIEW.length;
    let nextIdx;
    do { nextIdx = Math.floor(Math.random() * len); }
    while (nextIdx === previewHistory[historyPos] && len > 1);
    setPreviewHistory(h => [...h, nextIdx]);
    setHistoryPos(p => p + 1);
  };

  const goPrev = () => {
    if (historyPos > 0) setHistoryPos(p => p - 1);
  };
  return (
    <div className="acc-body">

      {/* ── Visibilidad ── */}
      <div className="cfg-card">
        <div className="cfg-card-desktop cfg-card-mobile">
          <div className="cont-header-titles">
            <h2 className="cfg-card-label">Visibilidad</h2>
            <p className="cfg-card-subtitle">Campos del formulario</p>
          </div>
          <div className="cfg-card-cont">
            {[
              { key: "nombre", label: "Nombre", icon: <User size={15} /> },
              { key: "apellidos", label: "Apellidos", icon: <UserCheck size={15} /> },
              { key: "telefono", label: "Teléfono", icon: <Phone size={15} /> },
              { key: "email", label: "Email", icon: <Mail size={15} /> },
              { key: "personas", label: "Personas", icon: <Users size={15} /> },
              { key: "fecha", label: "Fecha", icon: <Calendar size={15} /> },
              { key: "hora", label: "Hora", icon: <Clock size={15} /> },
              { key: "mensaje", label: "Mensaje", icon: <MessageSquare size={15} /> },
            ].map(({ key, label, icon }) => (
              <div key={key} className="cfg-toggle-row">
                <span className="cfg-toggle-label">{icon} {label}</span>
                <label className="cfg-toggle">
                  <input type="checkbox"
                    checked={draft.camposActivos?.[key] ?? true}
                    onChange={(e) => setField("camposActivos", { ...draft.camposActivos, [key]: e.target.checked })} />
                  <span className="cfg-toggle-track" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Funciones ── */}
      <div className="cfg-card">
        <div className="cfg-card-desktop cfg-card-mobile">
          <h2 className="cfg-card-label">Funciones</h2>
          <div className="cfg-toggle-row">
            <span className="cfg-toggle-label1">Mostrar nombre del negocio</span>
            <label className="cfg-toggle">
              <input type="checkbox" checked={draft.mostrarNombre ?? true}
                onChange={(e) => setField("mostrarNombre", e.target.checked)} />
              <span className="cfg-toggle-track" />
            </label>
          </div>
          <div className="cfg-toggle-row">
            <span className="cfg-toggle-label1">Panel de ayuda</span>
            <label className="cfg-toggle">
              <input type="checkbox" checked={draft.mostrarPanelAyuda ?? true}
                onChange={(e) => setField("mostrarPanelAyuda", e.target.checked)} />
              <span className="cfg-toggle-track" />
            </label>
          </div>
          <div className="cfg-toggle-row">
            <span className="cfg-toggle-label1">Google Calendar</span>
            <label className="cfg-toggle">
              <input type="checkbox" checked={draft.googleCalendarLink ?? false}
                onChange={(e) => setField("googleCalendarLink", e.target.checked)} />
              <span className="cfg-toggle-track" />
            </label>
          </div>
        </div>
      </div>

      {/* ── Configuración del negocio ── */}
      <div className="cfg-card">
        <div className="cfg-card-desktop cfg-card-mobile">

          <div className="cont-header-titles">
            <h2 className="cfg-card-label">Configuración del negocio</h2>
            <p className="cfg-card-subtitle">Personaliza la información básica que verán tus clientes </p>
          </div>

          <div className="cfg-negocio-wrap">


            <div className="cont-cfg-label">
              <label className="cfg-label">
                <span>Nombre del negocio</span>
                <input className="cfg-input" type="text" value={draft.nombre} maxLength={15}
                  onChange={(e) => setField("nombre", e.target.value)} />
                <div className="cfg-counter">
                  <span>Recomendado un nombre claro y reconocible</span>
                  <span> {draft.nombre.length} / 15</span>
                </div>
              </label>
            </div>


            <div className="cont-cfg-label">
              <label className="cfg-label">
                <span>Tamaño del nombre</span>
                <div className="neg-size-selector">
                  {["xs", "sm", "md"].map((size) => (
                    <button key={size} type="button"
                      className={`neg-size-btn ${(draft.nombreSize ?? "md") === size ? "neg-size-btn--active" : ""}`}
                      onClick={() => setField("nombreSize", size)}>
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <div className="cont-cfg-label">
              <label className="cfg-label">
                <span>Color del nombre</span>
                <div className="cfg-color-row">
                  <input className="cfg-input-color" type="color" value={draft.colorNegocio}
                    onChange={(e) => setField("colorNegocio", e.target.value)} />
                  <span className="cfg-color-preview" style={{ color: draft.colorNegocio }}>
                    {draft.nombre || "Vista previa"}
                  </span>
                </div>
              </label>
            </div>

            <div className="cont-cfg-label">
              <label className="cfg-label">
                <span>Logo (URL de imagen)</span>
                <input className="cfg-input" type="url" placeholder="https://... (jpg, png, webp)"
                  value={draft.logoUrl}
                  onChange={(e) => setField("logoUrl", e.target.value)} />
                <span className="cfg-hint">Recomendado: imagen cuadrada sin márgenes, mínimo 200×200px.</span>
              </label>
            </div>

            <label className="cfg-label">
              <span>Descripción</span>
              <textarea className="cfg-input cfg-textarea"
                placeholder="Restaurante peruano en el centro de Madrid"
                maxLength={155} value={draft.descripcion} rows={3}
                onChange={(e) => setField("descripcion", e.target.value)} />
              <span className="cfg-counter">{draft.descripcion.length} / 155</span>
            </label>

          </div>

          {/* ── preview ── */}
          <div className="neg-identity-preview" style={getPreviewBg(currentTheme)}>
            <div className="neg-preview-row">
              <button type="button"
                className={`neg-preview-arrow neg-preview-arrow--${currentTheme.base}`}
                onClick={goPrev} disabled={historyPos === 0}>
                <ChevronLeft size={14} />
              </button>
              <div className="neg-preview-body">
                {draft.logoUrl && <img src={draft.logoUrl} alt="" className="neg-preview-logo" />}
                <div className="neg-preview-text">
                  <span className="neg-preview-nombre" style={{ color: draft.colorNegocio }}>
                    {draft.nombre || "Nombre del negocio"}
                  </span>
                  {draft.descripcion && (
                    <span className="neg-preview-desc" style={{ color: currentTheme.textDesc }}>
                      {draft.descripcion}
                    </span>
                  )}
                </div>
              </div>
              <button type="button"
                className={`neg-preview-arrow neg-preview-arrow--${currentTheme.base}`}
                onClick={goNext}>
                <ChevronRight size={14} />
              </button>
            </div>
            <span className={`neg-preview-theme-label neg-preview-theme-label--${currentTheme.base}`}>
             Tema: {currentTheme.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Formulario ── */}
      <div className="cfg-card">
        <div className="cfg-card-desktop cfg-card-mobile">
          <h2 className="cfg-card-label">Formulario</h2>
          <label className="cfg-label">
            <span>Título del formulario</span>
            <input className="cfg-input" type="text" maxLength={21}
              value={draft.tituloFormulario}
              onChange={(e) => setField("tituloFormulario", e.target.value)} />
            <span className="cfg-counter">{draft.tituloFormulario.length} / 21</span>
          </label>
          <label className="cfg-label">
            <span>Texto del botón de envío</span>
            <input className="cfg-input" type="text" maxLength={15}
              value={draft.textoBtnReservar}
              onChange={(e) => setField("textoBtnReservar", e.target.value)} />
            <span className="cfg-counter">{draft.textoBtnReservar.length} / 15</span>
          </label>
        </div>
      </div>



      {/* ── Enlaces del negocio ── */}
      <div className="cfg-card">
        <div className="cfg-card-desktop cfg-card-mobile">
          <h2 className="cfg-card-label">Enlaces del negocio</h2>
          <label className="cfg-label">
            <span>Link 1 (web, Instagram, Facebook...)</span>
            <input className="cfg-input" type="url" placeholder="https://..."
              value={draft.links?.[0] ?? ""}
              onChange={(e) => setField("links", [e.target.value, draft.links?.[1] ?? ""])} />
          </label>
          <label className="cfg-label">
            <span>Link 2</span>
            <input className="cfg-input" type="url" placeholder="https://..."
              value={draft.links?.[1] ?? ""}
              onChange={(e) => setField("links", [draft.links?.[0] ?? "", e.target.value])} />
          </label>
        </div>
      </div>

      {/* ── Mensaje de WhatsApp (solo modo WA) ── */}
      {draft.modoEnvio !== "email" && (
        <div className="cfg-card">
          <div className="cfg-card-desktop cfg-card-mobile">
            <h2 className="cfg-card-label">Mensaje de WhatsApp</h2>
            <div className="cfg-tema-selector">
              {PERFILES.map((p) => (
                <button key={p.id} type="button"
                  className={`cfg-tema-btn ${draft.perfil === p.id ? "cfg-tema-btn--active" : ""}`}
                  onClick={() => {
                    setField("perfil", p.id);
                    if (p.encabezado) setField("encabezadoMensaje", p.encabezado);
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
            <label className="cfg-label">
              <span>Título del mensaje</span>
              <input className="cfg-input" type="text" maxLength={60}
                value={draft.encabezadoMensaje}
                onChange={(e) => { setField("encabezadoMensaje", e.target.value); setField("perfil", "personalizado"); }} />
              <span className="cfg-counter">{draft.encabezadoMensaje.length} / 60</span>
            </label>
            <label className="cfg-label">
              <span>Texto de cierre</span>
              <input className="cfg-input" type="text" maxLength={60}
                value={draft.textoPie ?? ""}
                onChange={(e) => setField("textoPie", e.target.value)} />
              <span className="cfg-counter">{(draft.textoPie ?? "").length} / 60</span>
            </label>
          </div>
        </div>
      )}

    </div>
  );
}
