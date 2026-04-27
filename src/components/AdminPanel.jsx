// ─── Imports ────────────────────────────────────────────────────────────────
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import iconWa from "../assets/icon-whatsapp.png";
import { useAdminConfig, DIAS } from "../hooks/useAdminConfig";
import ReservaWhatsApp from "./ReservaWhatsApp";
import { TEMAS } from "../config/temas";
import { PERFILES } from "../config/perfiles";
import "../styles/admin.css";

// ─── Componente principal ────────────────────────────────────────────────────
export default function AdminPanel() {

  // ─── Hook de configuración ─────────────────────────────────────────────────
  const {
    pin, setPin,
    autenticado,
    pinError,
    verificarPin,
    draft,
    setField,
    setDia,
    setTurno,
    addTurno,
    removeTurno,
    nuevaFecha, setNuevaFecha,
    addFechaBloqueada,
    removeFechaBloqueada,
    guardar,
    guardado,
    errorGuardado,
    exportarWidget,
    addPregunta, removePregunta, setPregunta,
    addTemaGuardado, removeTemaGuardado,
    getConfigFinal,
  } = useAdminConfig();

  // ─── Estado local de UI ────────────────────────────────────────────────────
  const [copiado, setCopiado] = useState(false);
  const [seccion, setSeccion] = useState(null);
  const [tab, setTab] = useState("panel");
  const [modalCustom, setModalCustom] = useState(false);
  const [nombreTema, setNombreTema] = useState("");
  const [confirmarEliminarPregunta, setConfirmarEliminarPregunta] = useState(null);
  const [filtroPanel, setFiltroPanel] = useState("todas");
  const [modalMensaje, setModalMensaje] = useState(null);

  // ─── Datos mock (sustituir por Supabase cuando esté conectado) ─────────────
  const [reservasMock, setReservasMock] = useState([
    { id: 1, nombre: "María García",    telefono: "612345678", fecha: "2026-04-20", hora: "13:00", personas: 2, servicio: "Menú del día", estado: "pendiente", mensaje: "Hola, somos dos personas, una de ellas es celíaca y necesita menú sin gluten. También me gustaría una mesa cerca de la ventana si es posible. Muchas gracias!" },
    { id: 2, nombre: "Carlos López",    telefono: "698765432", fecha: "2026-04-20", hora: "14:30", personas: 4, servicio: "",             estado: "confirmada" },
    { id: 3, nombre: "Ana Martínez",    telefono: "677123456", fecha: "2026-04-21", hora: "20:00", personas: 3, servicio: "",             estado: "pendiente" },
    { id: 4, nombre: "Pedro Sánchez",   telefono: "655987654", fecha: "2026-04-19", hora: "13:30", personas: 2, servicio: "Menú del día", estado: "cancelada" },
    { id: 5, nombre: "Laura Fernández", telefono: "644321987", fecha: "2026-04-22", hora: "21:00", personas: 5, servicio: "",             estado: "pendiente" },
    { id: 6, nombre: "Sofía Ruiz",      telefono: "633112233", fecha: "2026-04-19", hora: "14:00", personas: 3, servicio: "",             estado: "confirmada" },
    { id: 7, nombre: "Javier Moreno",   telefono: "611998877", fecha: "2026-04-18", hora: "13:00", personas: 2, servicio: "Menú del día", estado: "confirmada" },
    { id: 8, nombre: "Elena Castro",    telefono: "699445566", fecha: "2026-04-18", hora: "14:30", personas: 6, servicio: "",             estado: "cancelada" },
  ]);

  // ─── Pestañas según sección activa ────────────────────────────────────────
  const TABS = seccion === "reservas"
    ? { panel: "Reservas", historial: "Historial" }
    : { negocio: "Negocio", horarios: "Horarios", reservas: "Config", servicios: "Preguntas", ajustes: "Ajustes", preview: "Vista previa" };

  // ─── Fechas y filtros ──────────────────────────────────────────────────────
  const hoyStr = new Date().toISOString().split("T")[0];
  const hoyFormateado = hoyStr.split("-").reverse().join("-");
  const hoy = hoyStr;

  const reservasFiltradas = reservasMock.filter((r) => {
    if (r.fecha !== hoyStr) return false;
    if (filtroPanel === "pendientes") return r.estado === "pendiente";
    if (filtroPanel === "confirmadas") return r.estado === "confirmada";
    return r.estado !== "cancelada";
  });

  const canceladasHoy = reservasMock.filter(r => r.fecha === hoyStr && r.estado === "cancelada");
  const reservasHoy = reservasMock.filter(r => r.fecha === hoyStr);
  const reservasHistorial = reservasMock.filter(r => r.fecha < hoyStr && (r.estado === "confirmada" || r.estado === "cancelada"));
  const historialPorFecha = reservasHistorial.reduce((acc, r) => {
    if (!acc[r.fecha]) acc[r.fecha] = [];
    acc[r.fecha].push(r);
    return acc;
  }, {});
  const fechasHistorial = Object.keys(historialPorFecha).sort((a, b) => b.localeCompare(a));

  // ─── Acciones sobre reservas ───────────────────────────────────────────────
  const cambiarEstado = (id, estado) => {
    setReservasMock((prev) => prev.map((r) => r.id === id ? { ...r, estado } : r));
  };

  const eliminarReserva = (id) => {
    setReservasMock((prev) => prev.filter((r) => r.id !== id));
  };

  const copiarWidget = () => {
    const json = exportarWidget();
    const snippet = `<div id="turno-ya" data-config='${json}'></div>\n<link rel="stylesheet" href="https://tudominio.com/turno-ya.css">\n<script src="https://tudominio.com/turno-ya.js"></script>`;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  // ─── Pantalla de selección de sección ─────────────────────────────────────
  if (!seccion) {
    return (
      <section className="admin-section">
        <div className="admin-pin-form">
          <h2 className="admin-title">¿A dónde quieres ir?</h2>
          <button className="admin-seccion-btn" onClick={() => { setSeccion("reservas"); setTab("panel"); }}>
            <span className="admin-seccion-icon">📋</span>
            <span>Panel de reservas</span>
          </button>
          <button className="admin-seccion-btn" onClick={() => { setSeccion("config"); setTab("negocio"); }}>
            <span className="admin-seccion-icon">⚙️</span>
            <span>Configuración</span>
          </button>
        </div>
      </section>
    );
  }

  // ─── Pantalla de PIN ───────────────────────────────────────────────────────
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

  // ─── Panel principal (autenticado) ─────────────────────────────────────────
  return (
    <section className="admin-section">
      <form className="admin-form" onSubmit={guardar}>

        {/* Cabecera con título y fecha */}
        <div className="admin-header">
          <h2 className="admin-title">{seccion === "reservas" ? "Panel de reservas" : "Configuración"}</h2>
          {seccion === "reservas" && <p className="admin-fecha-hoy">{hoyFormateado}</p>}
        </div>

        {/* Pestañas de navegación */}
        <div className="admin-tabs">
          {Object.entries(TABS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`admin-tab ${tab === key ? "admin-tab--active" : ""}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: PANEL DE RESERVAS ── */}
        {tab === "panel" && (
          <div className="panel-reservas">

            {/* Stats: pendientes y confirmadas de hoy */}
            <div className="panel-stats">
              <button type="button" className={`panel-stat panel-stat--pendientes ${filtroPanel === "pendientes" ? "panel-stat--active" : ""}`}
                onClick={() => setFiltroPanel("pendientes")}>
                <span className="panel-stat-num">{reservasMock.filter(r => r.fecha === hoyStr && r.estado === "pendiente").length}</span>
                <span className="panel-stat-label">Pendientes</span>
              </button>
              <button type="button" className={`panel-stat panel-stat--confirmadas ${filtroPanel === "confirmadas" ? "panel-stat--active" : ""}`}
                onClick={() => setFiltroPanel("confirmadas")}>
                <span className="panel-stat-num">{reservasMock.filter(r => r.fecha === hoyStr && r.estado === "confirmada").length}</span>
                <span className="panel-stat-label">Confirmadas</span>
              </button>
            </div>

            {/* Lista de reservas activas (pendientes / confirmadas) */}
            <p className="panel-seccion-titulo">Confirmadas · {hoyFormateado}</p>
            {reservasFiltradas.length === 0 ? (
              <p className="admin-hint" style={{ textAlign: "center", padding: "2rem 0" }}>No hay reservas.</p>
            ) : (
              <div className="panel-lista">
                {reservasFiltradas.map((r) => (
                  <div key={r.id} className={`panel-card panel-card--${r.estado}`}>
                    <div className="panel-card-info">
                      <div className="panel-card-nombre-row">
                        <span className="panel-card-nombre">{r.nombre}</span>
                        <span className={`panel-badge panel-badge--${r.estado}`}>
                          {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                        </span>
                      </div>
                      <span className="panel-card-meta">
                        {r.fecha.split("-").reverse().join("-")} · {r.hora} · {r.personas} {r.personas === 1 ? "persona" : "personas"}
                        {r.servicio ? ` · ${r.servicio}` : ""}
                      </span>
                      <div className="panel-card-tel">
                        <a href={`tel:${r.telefono}`}>{r.telefono}</a>
                        <a href={`https://wa.me/${r.telefono.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                          <img src={iconWa} alt="WhatsApp" className="panel-wa-icon" />
                        </a>
                      </div>
                      {r.mensaje && <span className="panel-card-mensaje">💬 {r.mensaje}</span>}
                    </div>
                    {r.estado === "pendiente" && (
                      <div className="panel-card-actions">
                        <button type="button" className="panel-btn-confirmar" onClick={() => cambiarEstado(r.id, "confirmada")}>Confirmar</button>
                        <button type="button" className="panel-btn-cancelar" onClick={() => cambiarEstado(r.id, "cancelada")}>Cancelar</button>
                      </div>
                    )}
                    {r.estado === "cancelada" && (
                      <div className="panel-card-actions">
                        <button type="button" className="panel-btn-eliminar" onClick={() => eliminarReserva(r.id)}>✕ Eliminar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Canceladas de hoy */}
            {canceladasHoy.length > 0 && (<>
              <p className="panel-seccion-titulo">Canceladas · {hoyFormateado}</p>
              <div className="panel-lista">
                {canceladasHoy.map((r) => (
                  <div key={r.id} className="panel-card panel-card--cancelada">
                    <div className="panel-card-info">
                      <div className="panel-card-nombre-row">
                        <span className="panel-card-nombre">{r.nombre}</span>
                        <span className="panel-badge panel-badge--cancelada">Cancelada</span>
                      </div>
                      <span className="panel-card-meta">
                        {r.hora} · {r.personas} {r.personas === 1 ? "persona" : "personas"}
                        {r.servicio ? ` · ${r.servicio}` : ""}
                      </span>
                      <div className="panel-card-tel">
                        <a href={`tel:${r.telefono}`}>{r.telefono}</a>
                        <a href={`https://wa.me/${r.telefono.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                          <img src={iconWa} alt="WhatsApp" className="panel-wa-icon" />
                        </a>
                      </div>
                    </div>
                    <div className="panel-card-actions">
                      <button type="button" className="panel-btn-eliminar" onClick={() => eliminarReserva(r.id)}>✕ Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </>)}
          </div>
        )}

        {/* ── TAB: HISTORIAL ── */}
        {tab === "historial" && (
          <div className="panel-reservas">

            {/* Reservas de hoy (todas) */}
            <p className="panel-seccion-titulo">Hoy · {hoyFormateado}</p>
            {reservasHoy.length === 0 ? (
              <p className="admin-hint" style={{ textAlign: "center" }}>Sin reservas hoy.</p>
            ) : (
              <div className="panel-lista">
                {reservasHoy.map((r) => (
                  <div key={r.id} className={`panel-card panel-card--${r.estado}`}>
                    <div className="panel-card-info">
                      <div className="panel-card-nombre-row">
                        <span className="panel-card-nombre">{r.nombre}</span>
                        <span className={`panel-badge panel-badge--${r.estado}`}>
                          {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                        </span>
                      </div>
                      <span className="panel-card-meta">
                        {r.hora} · {r.personas} {r.personas === 1 ? "persona" : "personas"}
                        {r.servicio ? ` · ${r.servicio}` : ""}
                      </span>
                      <div className="panel-card-tel">
                        <a href={`tel:${r.telefono}`}>{r.telefono}</a>
                        <a href={`https://wa.me/${r.telefono.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                          <img src={iconWa} alt="WhatsApp" className="panel-wa-icon" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Días anteriores agrupados por fecha */}
            {fechasHistorial.map((fecha) => (
              <div key={fecha}>
                <p className="panel-seccion-titulo">Historial · {fecha.split("-").reverse().join("-")}</p>
                <div className="panel-lista">
                  {historialPorFecha[fecha].map((r) => (
                    <div key={r.id} className={`panel-card panel-card--${r.estado}`}>
                      <div className="panel-card-info">
                        <div className="panel-card-nombre-row">
                          <span className="panel-card-nombre">{r.nombre}</span>
                          <span className={`panel-badge panel-badge--${r.estado}`}>
                            {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                          </span>
                        </div>
                        <span className="panel-card-meta">
                          {r.hora} · {r.personas} {r.personas === 1 ? "persona" : "personas"}
                          {r.servicio ? ` · ${r.servicio}` : ""}
                        </span>
                        <div className="panel-card-tel">
                          <a href={`tel:${r.telefono}`}>{r.telefono}</a>
                          <a href={`https://wa.me/${r.telefono.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                            <img src={iconWa} alt="WhatsApp" className="panel-wa-icon" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {fechasHistorial.length === 0 && (
              <p className="admin-hint" style={{ textAlign: "center" }}>Sin historial de días anteriores.</p>
            )}
          </div>
        )}

        {/* ── TAB: NEGOCIO ── */}
        {tab === "negocio" && (<>

          {/* Perfil del formulario y campos activos */}
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Tipo de mensaje</legend>
            <p className="admin-hint">Elige un encabezado rápido o escríbelo a tu gusto.</p>
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

            <label className="admin-label" style={{ marginTop: "12px" }}>
              <span>Título del mensaje de WhatsApp</span>
              <input className="admin-input" type="text" maxLength={60}
                value={draft.encabezadoMensaje}
                onChange={(e) => { setField("encabezadoMensaje", e.target.value); setField("perfil", "personalizado"); }} />
              <span className="admin-counter">{draft.encabezadoMensaje.length} / 60</span>
            </label>

            <p className="admin-hint" style={{ marginTop: "12px" }}>Ajusta los campos a tu gusto.</p>
            {[
              { key: "nombre",    label: "Nombre" },
              { key: "apellidos", label: "Apellidos" },
              { key: "telefono",  label: "Teléfono" },
              { key: "email",     label: "Email" },
              { key: "personas",  label: "Personas" },
              { key: "fecha",     label: "Fecha" },
              { key: "hora",      label: "Hora" },
              { key: "mensaje",   label: "Mensaje" },
            ].map(({ key, label }) => (
              <div key={key} className="admin-dia-header">
                <span className="admin-dia-nombre">{label}</span>
                <label className="admin-toggle">
                  <input type="checkbox"
                    checked={draft.camposActivos?.[key] ?? true}
                    onChange={(e) => setField("camposActivos", { ...draft.camposActivos, [key]: e.target.checked })} />
                  <span>{draft.camposActivos?.[key] ?? true ? "Activo" : "Inactivo"}</span>
                </label>
              </div>
            ))}
          </fieldset>

          {/* Datos del negocio */}
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Datos del negocio</legend>

            <label className="admin-label">
              <span>Nombre del negocio</span>
              <input className="admin-input" type="text" value={draft.nombre}
                maxLength={20}
                onChange={(e) => setField("nombre", e.target.value)} />
              <span className="admin-counter">{draft.nombre.length} / 20</span>
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
              <span>Descripción</span>
              <textarea className="admin-input admin-textarea"
                placeholder="Restaurante peruano en el centro de Madrid"
                maxLength={155} value={draft.descripcion}
                rows={3}
                onChange={(e) => setField("descripcion", e.target.value)} />
              <span className="admin-counter">{draft.descripcion.length} / 155</span>
            </label>

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

            {/* Enlace de teléfono */}
            <div className="admin-dia-header">
              <span className="admin-dia-nombre">Mostrar enlace de teléfono</span>
              <label className="admin-toggle">
                <input type="checkbox"
                  checked={draft.mostrarTelefono ?? true}
                  onChange={(e) => setField("mostrarTelefono", e.target.checked)} />
                <span>{draft.mostrarTelefono ?? true ? "Activo" : "Inactivo"}</span>
              </label>
            </div>
            {(draft.mostrarTelefono ?? true) && (
              <label className="admin-label">
                <span>Texto del enlace de teléfono</span>
                <input className="admin-input" type="text" maxLength={36}
                  value={draft.textoTelefono}
                  onChange={(e) => setField("textoTelefono", e.target.value)} />
                <span className="admin-counter">{draft.textoTelefono.length} / 36</span>
              </label>
            )}

            <label className="admin-label">
              <span>Logo (URL de imagen)</span>
              <input className="admin-input" type="url"
                placeholder="https://... (jpg, png, webp)"
                value={draft.logoUrl}
                onChange={(e) => setField("logoUrl", e.target.value)} />
              {draft.logoUrl && <img src={draft.logoUrl} alt="Logo preview" className="admin-logo-preview" />}
            </label>

            <label className="admin-label">
              <span>Modo de envío de reservas</span>
              <div className="admin-tema-selector">
                <button type="button"
                  className={`admin-tema-btn ${draft.modoEnvio !== "email" ? "admin-tema-btn--active" : ""}`}
                  onClick={() => setField("modoEnvio", "whatsapp")}>
                  WhatsApp
                </button>
                <button type="button"
                  className={`admin-tema-btn ${draft.modoEnvio === "email" ? "admin-tema-btn--active" : ""}`}
                  onClick={() => {
                    setField("modoEnvio", "email");
                    setField("camposActivos", { ...draft.camposActivos, email: true });
                  }}>
                  Email
                </button>
              </div>
            </label>

            {draft.modoEnvio === "email" ? (
              <label className="admin-label">
                <span>Email del negocio (recibirás las reservas aquí)</span>
                <input className="admin-input" type="email" placeholder="tu@email.com"
                  value={draft.emailNegocio ?? ""}
                  onChange={(e) => setField("emailNegocio", e.target.value)} />
              </label>
            ) : (
              <label className="admin-label">
                <span>WhatsApp (sin + ni espacios)</span>
                <input className="admin-input" type="tel" placeholder="34600000000"
                  maxLength={15} value={draft.whatsapp}
                  onChange={(e) => setField("whatsapp", e.target.value.replace(/[^\d]/g, ""))} />
                <span className="admin-counter">{draft.whatsapp.length} / 15</span>
              </label>
            )}

            <label className="admin-label">
              <span>Teléfono de contacto</span>
              <input className="admin-input" type="tel" placeholder="+34600000000"
                maxLength={16} value={draft.telefono}
                onChange={(e) => setField("telefono", e.target.value)} />
              <span className="admin-counter">{draft.telefono.length} / 16</span>
            </label>

            {/* Selector de tema visual */}
            <label className="admin-label">
              <span>Tema de la app</span>
              <div className="admin-tema-selector">
                {TEMAS.map(({ id, label }) => (
                  <button key={id} type="button"
                    className={`admin-tema-btn ${draft.tema === id ? "admin-tema-btn--active" : ""}`}
                    onClick={() => {
                      if (id === "personalizado") {
                        setModalCustom(true);
                      } else {
                        setField("tema", id);
                        window.dispatchEvent(new CustomEvent("turno-ya:tema", { detail: { tema: id, colorFondo: draft.colorFondo, colorAcento: draft.colorAcento, colorBorde: draft.colorBorde } }));
                      }
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </label>

            {/* Modal de tema personalizado */}
            {modalCustom && (
              <div className="admin-modal-overlay" onClick={() => setModalCustom(false)}>
                <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="admin-modal-header">
                    <span className="admin-modal-title">Tema personalizado</span>
                    <button type="button" className="admin-modal-close" onClick={() => setModalCustom(false)}>✕</button>
                  </div>
                  <div className="admin-modal-body">

                    {/* Favoritos guardados */}
                    {draft.temasGuardados.length > 0 && (
                      <div className="admin-favoritos">
                        <span className="admin-favoritos-label">Favoritos</span>
                        {draft.temasGuardados.map((t) => (
                          <div key={t.id} className="admin-favorito-item">
                            <button type="button" className="admin-favorito-btn" onClick={() => {
                              setField("colorFondo", t.colorFondo);
                              setField("colorAcento", t.colorAcento);
                              setField("colorBorde", t.colorBorde);
                              setField("tema", "personalizado");
                              window.dispatchEvent(new CustomEvent("turno-ya:tema", { detail: { tema: "personalizado", colorFondo: t.colorFondo, colorAcento: t.colorAcento, colorBorde: t.colorBorde } }));
                            }}>
                              <span className="admin-favorito-dots">
                                <span style={{ background: t.colorFondo, border: `2px solid ${t.colorBorde}` }} />
                                <span style={{ background: t.colorAcento }} />
                              </span>
                              <span className="admin-favorito-nombre">{t.nombre}</span>
                            </button>
                            <button type="button" className="admin-btn-remove" onClick={() => removeTemaGuardado(t.id)}>✕</button>
                          </div>
                        ))}
                        <hr className="admin-modal-sep" />
                      </div>
                    )}

                    {/* Color pickers */}
                    <label className="admin-label">
                      <span>Color de fondo</span>
                      <div className="admin-color-row">
                        <input type="color" className="admin-input-color" value={draft.colorFondo}
                          onChange={(e) => {
                            setField("colorFondo", e.target.value);
                            setField("tema", "personalizado");
                            window.dispatchEvent(new CustomEvent("turno-ya:tema", { detail: { tema: "personalizado", colorFondo: e.target.value, colorAcento: draft.colorAcento, colorBorde: draft.colorBorde } }));
                          }} />
                        <span className="admin-color-hex">{draft.colorFondo}</span>
                      </div>
                    </label>
                    <label className="admin-label">
                      <span>Color principal</span>
                      <div className="admin-color-row">
                        <input type="color" className="admin-input-color" value={draft.colorAcento}
                          onChange={(e) => {
                            setField("colorAcento", e.target.value);
                            setField("tema", "personalizado");
                            window.dispatchEvent(new CustomEvent("turno-ya:tema", { detail: { tema: "personalizado", colorFondo: draft.colorFondo, colorAcento: e.target.value, colorBorde: draft.colorBorde } }));
                          }} />
                        <span className="admin-color-hex">{draft.colorAcento}</span>
                      </div>
                    </label>
                    <label className="admin-label">
                      <span>Color de bordes</span>
                      <div className="admin-color-row">
                        <input type="color" className="admin-input-color" value={draft.colorBorde}
                          onChange={(e) => {
                            setField("colorBorde", e.target.value);
                            setField("tema", "personalizado");
                            window.dispatchEvent(new CustomEvent("turno-ya:tema", { detail: { tema: "personalizado", colorFondo: draft.colorFondo, colorAcento: draft.colorAcento, colorBorde: e.target.value } }));
                          }} />
                        <span className="admin-color-hex">{draft.colorBorde}</span>
                      </div>
                    </label>

                    {/* Guardar favorito */}
                    <div className="admin-favorito-save">
                      <input className="admin-input" type="text" placeholder="Nombre del favorito"
                        maxLength={30} value={nombreTema} onChange={(e) => setNombreTema(e.target.value)} />
                      <button type="button" className="admin-btn-add-fecha" disabled={!nombreTema.trim()}
                        onClick={() => {
                          addTemaGuardado(nombreTema.trim());
                          setNombreTema("");
                        }}>
                        Guardar
                      </button>
                    </div>
                  </div>

                  <button type="button" className="admin-btn-primary" onClick={() => {
                    setField("tema", "personalizado");
                    setModalCustom(false);
                  }}>Aplicar</button>
                </div>
              </div>
            )}
          </fieldset>
        </>)}

        {/* ── TAB: HORARIOS ── */}
        {tab === "horarios" && (<>

          {/* Horario semanal por día */}
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Horarios semanales</legend>
            {Object.entries(draft.horarios).map(([day, { abierto, turnos }]) => (
              <div key={day} className="admin-dia">
                <div className="admin-dia-header">
                  <span className="admin-dia-nombre">{DIAS[day]}</span>
                  <label className="admin-toggle">
                    <input type="checkbox" checked={abierto}
                      onChange={(e) => setDia(day, { abierto: e.target.checked })} />
                    <span>{abierto ? "Abierto" : "Cerrado"}</span>
                  </label>
                </div>
                {abierto && (
                  <div className="admin-turnos">
                    {turnos.map((turno, i) => (
                      <div key={i} className="admin-turno">
                        <input className="admin-input admin-input-time" type="time" value={turno.start}
                          onChange={(e) => setTurno(day, i, "start", e.target.value)} />
                        <span className="admin-turno-sep">—</span>
                        <input className="admin-input admin-input-time" type="time" value={turno.end}
                          onChange={(e) => setTurno(day, i, "end", e.target.value)} />
                        {turnos.length > 1 && (
                          <button type="button" className="admin-btn-remove" onClick={() => removeTurno(day, i)}>✕</button>
                        )}
                      </div>
                    ))}
                    {turnos.length < 2 && (
                      <button type="button" className="admin-btn-add" onClick={() => addTurno(day)}>+ Agregar turno</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </fieldset>

          {/* Fechas bloqueadas puntuales */}
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Fechas bloqueadas</legend>
            <p className="admin-hint">Vacaciones, festivos o días puntuales cerrados.</p>
            <div className="admin-fecha-add">
              <input className="admin-input" type="date" value={nuevaFecha}
                min={hoy} onChange={(e) => setNuevaFecha(e.target.value)} />
              <button type="button" className="admin-btn-add-fecha" onClick={addFechaBloqueada}>Bloquear</button>
            </div>
            {draft.fechasBloqueadas.length === 0 ? (
              <p className="admin-hint">No hay fechas bloqueadas.</p>
            ) : (
              <ul className="admin-fechas-list">
                {draft.fechasBloqueadas.map((fecha) => (
                  <li key={fecha} className="admin-fecha-item">
                    <span>{fecha}</span>
                    <button type="button" className="admin-btn-remove" onClick={() => removeFechaBloqueada(fecha)}>✕</button>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>

          {/* Cierre temporal de hoy */}
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Cierre temporal</legend>
            <p className="admin-hint">Cierra el negocio hoy sin modificar el horario semanal. Se reabre automáticamente mañana.</p>
            <div className="admin-cierre-row">
              <span className="admin-cierre-estado">
                {draft.cierreTemporalFecha === hoy ? "🔴 Hoy cerrado" : "🟢 Hoy abierto"}
              </span>
              <button type="button"
                className={draft.cierreTemporalFecha === hoy ? "admin-btn-reabrir" : "admin-btn-cerrar"}
                onClick={() => setField("cierreTemporalFecha", draft.cierreTemporalFecha === hoy ? "" : hoy)}>
                {draft.cierreTemporalFecha === hoy ? "Reabrir hoy" : "Cerrar hoy"}
              </button>
            </div>
          </fieldset>
        </>)}

        {/* ── TAB: CONFIG DE RESERVAS ── */}
        {tab === "reservas" && (<>
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Configuración de reservas</legend>

            <label className="admin-label">
              <span>Duración de cada reserva (minutos)</span>
              <select className="admin-input" value={draft.slotInterval}
                onChange={(e) => setField("slotInterval", Number(e.target.value))}>
                <option value={15}>15 min</option>
                <option value={20}>20 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hora</option>
                <option value={90}>1 hora 30 min</option>
                <option value={120}>2 horas</option>
              </select>
              <span className="admin-hint">Duración de cada franja horaria disponible.</span>
            </label>

            <label className="admin-label">
              <span>Antelación mínima para reservar (horas)</span>
              <input className="admin-input" type="number" min="0" max="72"
                value={draft.antelacionMinHoras}
                onChange={(e) => setField("antelacionMinHoras", Number(e.target.value))} />
              <span className="admin-hint">Horas mínimas de antelación. 0 = reserva inmediata.</span>
            </label>

            <label className="admin-label">
              <span>Antelación máxima para reservar (días)</span>
              <input className="admin-input" type="number" min="1" max="365"
                value={draft.antelacionMaxDias}
                onChange={(e) => setField("antelacionMaxDias", Number(e.target.value))} />
              <span className="admin-hint">Días máximos que el cliente puede reservar con antelación.</span>
            </label>

            <label className="admin-label">
              <span>Mínimo de personas por reserva</span>
              <input className="admin-input" type="number" min="1" max="99"
                value={draft.minPersonas}
                onChange={(e) => setField("minPersonas", Number(e.target.value))} />
              <span className="admin-hint">Número mínimo de personas por reserva.</span>
            </label>

            <label className="admin-label">
              <span>Máximo de personas por reserva</span>
              <input className="admin-input" type="number" min="1" max="100"
                value={draft.maxPersonas}
                onChange={(e) => setField("maxPersonas", Number(e.target.value))} />
              <span className="admin-hint">Número máximo de personas por reserva.</span>
            </label>

            <label className="admin-label">
              <span>Aforo máximo por horario</span>
              <input className="admin-input" type="number" min="0" max="999"
                value={draft.aforoPorSlot}
                onChange={(e) => setField("aforoPorSlot", Number(e.target.value))} />
              <span className="admin-hint">0 = sin límite. Requiere panel de reservas para funcionar.</span>
            </label>

            <div className="admin-dia-header">
              <span className="admin-dia-nombre">Link de Google Calendar en el mensaje</span>
              <label className="admin-toggle">
                <input type="checkbox"
                  checked={draft.googleCalendarLink ?? false}
                  onChange={(e) => setField("googleCalendarLink", e.target.checked)} />
                <span>{draft.googleCalendarLink ? "Activo" : "Inactivo"}</span>
              </label>
            </div>
            <span className="admin-hint">Al activarlo, el mensaje de WhatsApp incluye un link para añadir la cita a Google Calendar.</span>
          </fieldset>
        </>)}

        {/* ── TAB: PREGUNTAS ── */}
        {tab === "servicios" && (<>

          {/* Preguntas personalizadas */}
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Preguntas personalizadas</legend>
            <p className="admin-hint">Campos extra que verá el cliente al reservar.</p>
            {draft.preguntasExtra.map((p, i) => (
              p.guardado ? (
                <div key={p.id} className="admin-servicio-card">
                  <div className="admin-servicio-info">
                    <span className="admin-servicio-nombre">{p.label}</span>
                    <span className="admin-servicio-horario">
                      {p.tipo === "seleccion" ? "Opciones" : "Texto libre"}
                      {p.requerida ? " · Obligatoria" : ""}
                    </span>
                  </div>
                  <div className="admin-servicio-card-actions">
                    <span className="admin-servicio-activo" title="Activo">●</span>
                    {confirmarEliminarPregunta === i ? (
                      <>
                        <span className="admin-servicio-confirmar">¿Eliminar?</span>
                        <button type="button" className="admin-btn-remove" onClick={() => { removePregunta(i); setConfirmarEliminarPregunta(null); }}>Sí</button>
                        <button type="button" className="admin-btn-add-fecha" onClick={() => setConfirmarEliminarPregunta(null)}>No</button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="admin-btn-secondary-sm" onClick={() => setPregunta(i, "guardado", false)}>Editar</button>
                        <button type="button" className="admin-btn-remove" onClick={() => setConfirmarEliminarPregunta(i)}>✕</button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div key={p.id} className="admin-pregunta">
                  <input className="admin-input" type="text" placeholder="Pregunta (ej: ¿Tienes alergias?)"
                    maxLength={120} value={p.label} onChange={(e) => setPregunta(i, "label", e.target.value)} />
                  <div className="admin-pregunta-row">
                    <select className="admin-input admin-input-tipo" value={p.tipo}
                      onChange={(e) => setPregunta(i, "tipo", e.target.value)}>
                      <option value="texto">Texto libre</option>
                      <option value="seleccion">Opciones</option>
                    </select>
                    {p.tipo === "texto" && (
                      <select className="admin-input admin-input-tipo" value={p.campoTipo ?? "input"}
                        onChange={(e) => setPregunta(i, "campoTipo", e.target.value)}>
                        <option value="input">Campo corto</option>
                        <option value="textarea">Texto largo</option>
                      </select>
                    )}
                    <label className="admin-check-label">
                      <input type="checkbox" checked={!!p.requerida}
                        onChange={(e) => setPregunta(i, "requerida", e.target.checked)} />
                      Obligatoria
                    </label>
                  </div>
                  {p.tipo === "seleccion" && (
                    <input className="admin-input" type="text"
                      placeholder="Opciones separadas por coma (ej: Interior, Exterior)"
                      key={p.id}
                      defaultValue={p.opciones?.filter(Boolean).join(", ") ?? ""}
                      onBlur={(e) => setPregunta(i, "opciones", e.target.value.split(",").map((o) => o.trim()).filter(Boolean))} />
                  )}
                  <div className="admin-pregunta-btns">
                    <button type="button" className="admin-btn-add-fecha"
                      disabled={!p.label.trim()}
                      onClick={() => setPregunta(i, "guardado", true)}>
                      Guardar pregunta
                    </button>
                    <button type="button" className="admin-btn-secondary-sm" onClick={() => removePregunta(i)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )
            ))}
            <button type="button" className="admin-btn-add" onClick={addPregunta}>+ Añadir pregunta</button>
          </fieldset>
        </>)}

        {/* ── TAB: AJUSTES ── */}
        {tab === "ajustes" && (<>

          {/* PIN de acceso */}
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Seguridad</legend>
            <label className="admin-label">
              <span>Cambiar PIN de acceso</span>
              <input className="admin-input" type="password" inputMode="numeric"
                maxLength={8} placeholder="Nuevo PIN" value={draft.pinAdmin}
                onChange={(e) => setField("pinAdmin", e.target.value)} />
              <span className="admin-counter">{draft.pinAdmin.length} / 8</span>
            </label>
          </fieldset>

          {/* QR del formulario */}
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">QR del formulario</legend>
            <p className="admin-hint">Imprímelo o compártelo para que tus clientes accedan directamente.</p>
            <div className="admin-qr-wrapper">
              <QRCodeSVG id="turno-ya-qr"
                value={window.location.href.replace("#admin", "").replace("#", "") || window.location.origin}
                size={180} level="M" />
            </div>
            <button type="button" className="admin-btn-secondary" onClick={() => {
              const svg = document.getElementById("turno-ya-qr");
              const canvas = document.createElement("canvas");
              canvas.width = 180; canvas.height = 180;
              const img = new Image();
              img.onload = () => { canvas.getContext("2d").drawImage(img, 0, 0); const a = document.createElement("a"); a.download = "qr-reservas.png"; a.href = canvas.toDataURL(); a.click(); };
              img.src = "data:image/svg+xml;base64," + btoa(new XMLSerializer().serializeToString(svg));
            }}>
              Descargar QR
            </button>
          </fieldset>

          {/* Widget embebible */}
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Widget</legend>
            <button className="admin-btn-export" type="button" onClick={copiarWidget}>
              {copiado ? "✓ Copiado" : "Copiar código del widget"}
            </button>
          </fieldset>

          {/* Caché */}
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Caché</legend>
            <p className="admin-hint">Si la app no refleja los últimos cambios, límpia la caché.</p>
            <button className="admin-btn-secondary" type="button"
              onClick={() => { localStorage.clear(); window.location.reload(); }}>
              Limpiar caché
            </button>
          </fieldset>
        </>)}

        {/* ── TAB: VISTA PREVIA ── */}
        {tab === "preview" && (
          <div className="admin-preview-wrapper">
            <p className="admin-hint">Así ve el cliente el formulario.</p>
            <div className="admin-preview-phone">
              <ReservaWhatsApp configOverride={getConfigFinal()} />
            </div>
          </div>
        )}

        {/* Botón guardar (oculto en vista previa y en panel de reservas) */}
        {tab !== "preview" && seccion !== "reservas" && (<>
          <button className="admin-btn-primary" type="submit">
            {guardado ? "✓ Guardado" : "Guardar cambios"}
          </button>
          {errorGuardado && <p className="admin-error">{errorGuardado}</p>}
        </>)}

      </form>

      {/* Modal de mensaje del cliente */}
      {modalMensaje && (
        <div className="admin-modal-overlay" onClick={() => setModalMensaje(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">Mensaje del cliente</span>
              <button type="button" className="admin-modal-close" onClick={() => setModalMensaje(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text)" }}>💬 {modalMensaje}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
