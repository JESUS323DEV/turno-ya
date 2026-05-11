import { User, UserCheck, Phone, Mail, Users, Calendar, Clock, MessageSquare } from "lucide-react";
import { PERFILES } from "../../config/perfiles";

export default function TabNegocio({ draft, setField }) {
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
          <div className="cfg-card-cont">
            <p className="cfg-card-subtitle">Funciones</p>
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
      </div>

      {/* ── Configuración del negocio ── */}
      <div className="cfg-card">
        <div className="cfg-card-desktop cfg-card-mobile">
          <h2 className="cfg-card-label">Configuración del negocio</h2>
          <label className="admin-label">
            <span>Nombre del negocio</span>
            <input className="admin-input" type="text" value={draft.nombre} maxLength={20}
              onChange={(e) => setField("nombre", e.target.value)} />
            <span className="admin-counter">{draft.nombre.length} / 20</span>
          </label>
          <label className="admin-label">
            <span>Descripción</span>
            <textarea className="admin-input admin-textarea"
              placeholder="Restaurante peruano en el centro de Madrid"
              maxLength={155} value={draft.descripcion} rows={3}
              onChange={(e) => setField("descripcion", e.target.value)} />
            <span className="admin-counter">{draft.descripcion.length} / 155</span>
          </label>
          <label className="admin-label">
            <span>Color del nombre</span>
            <div className="admin-color-row">
              <input className="admin-input-color" type="color" value={draft.colorNegocio}
                onChange={(e) => setField("colorNegocio", e.target.value)} />
              <span className="admin-color-preview" style={{ color: draft.colorNegocio }}>
                {draft.nombre || "Vista previa"}
              </span>
            </div>
          </label>
          <label className="admin-label">
            <span>Logo (URL de imagen)</span>
            <input className="admin-input" type="url" placeholder="https://... (jpg, png, webp)"
              value={draft.logoUrl}
              onChange={(e) => setField("logoUrl", e.target.value)} />
            {draft.logoUrl && <img src={draft.logoUrl} alt="Logo preview" className="admin-logo-preview" />}
          </label>
        </div>
      </div>

      {/* ── Formulario ── */}
      <div className="cfg-card">
        <div className="cfg-card-desktop cfg-card-mobile">
          <h2 className="cfg-card-label">Formulario</h2>
          <label className="admin-label">
            <span>Título del formulario</span>
            <input className="admin-input" type="text" maxLength={21}
              value={draft.tituloFormulario}
              onChange={(e) => setField("tituloFormulario", e.target.value)} />
            <span className="admin-counter">{draft.tituloFormulario.length} / 21</span>
          </label>
          <label className="admin-label">
            <span>Texto del botón de envío</span>
            <input className="admin-input" type="text" maxLength={15}
              value={draft.textoBtnReservar}
              onChange={(e) => setField("textoBtnReservar", e.target.value)} />
            <span className="admin-counter">{draft.textoBtnReservar.length} / 15</span>
          </label>
        </div>
      </div>

      {/* ── Enlaces del negocio ── */}
      <div className="cfg-card">
        <div className="cfg-card-desktop cfg-card-mobile">
          <h2 className="cfg-card-label">Enlaces del negocio</h2>
          <label className="admin-label">
            <span>Link 1 (web, Instagram, Facebook...)</span>
            <input className="admin-input" type="url" placeholder="https://..."
              value={draft.links?.[0] ?? ""}
              onChange={(e) => setField("links", [e.target.value, draft.links?.[1] ?? ""])} />
          </label>
          <label className="admin-label">
            <span>Link 2</span>
            <input className="admin-input" type="url" placeholder="https://..."
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
            <div className="admin-tema-selector">
              {PERFILES.map((p) => (
                <button key={p.id} type="button"
                  className={`admin-tema-btn ${draft.perfil === p.id ? "admin-tema-btn--active" : ""}`}
                  onClick={() => {
                    setField("perfil", p.id);
                    if (p.encabezado) setField("encabezadoMensaje", p.encabezado);
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
            <label className="admin-label">
              <span>Título del mensaje</span>
              <input className="admin-input" type="text" maxLength={60}
                value={draft.encabezadoMensaje}
                onChange={(e) => { setField("encabezadoMensaje", e.target.value); setField("perfil", "personalizado"); }} />
              <span className="admin-counter">{draft.encabezadoMensaje.length} / 60</span>
            </label>
            <label className="admin-label">
              <span>Texto de cierre</span>
              <input className="admin-input" type="text" maxLength={60}
                value={draft.textoPie ?? ""}
                onChange={(e) => setField("textoPie", e.target.value)} />
              <span className="admin-counter">{(draft.textoPie ?? "").length} / 60</span>
            </label>
          </div>
        </div>
      )}

    </div>
  );
}
