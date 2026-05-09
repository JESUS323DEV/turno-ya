import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, Lock, LogOut, Settings, FlaskConical, ScrollText, Store, Clock, Settings2, HelpCircle, SlidersHorizontal, Eye, Calendar, CalendarX, User, UserCheck, Phone, Mail, Users, MessageSquare, Trash2, Pencil, FileText, Sun, Moon, Image as ImageIcon, LayoutGrid, Check, Star } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { DIAS } from "../hooks/useAdminConfig";
import ReservaWhatsApp from "./ReservaWhatsApp";
import { TEMAS } from "../config/temas";
import { TEMAS_PANEL, getPanelVars } from "../config/temasPanel";
import { PERFILES } from "../config/perfiles";
/* ── Helpers para el preview de tema del formulario ── */
function _hr(hex, a) {
  const h = hex.slice(0, 7);
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function getFormVars(tema, colorFondo, colorAcento, colorBorde, TEMAS) {
  const preset = TEMAS.find(t => t.id === tema);
  if (tema === "personalizado") {
    const bg = colorFondo || "#ffffff";
    const vars = { "--bg": bg };
    if (colorAcento) { vars["--accent"] = colorAcento; vars["--accent-bg"] = _hr(colorAcento, 0.12); vars["--accent-border"] = _hr(colorAcento, 0.5); }
    if (colorBorde) vars["--border-input"] = colorBorde;
    return { dataTema: "claro", vars };
  }
  if (!preset) return { dataTema: "claro", vars: {}, gradient: null, bgImage: null };
  const vars = {};
  if (preset.bg) vars["--bg"] = preset.bg;
  if (preset.border) vars["--border"] = preset.border;
  if (preset.accent) { vars["--accent"] = preset.accent; vars["--accent-bg"] = _hr(preset.accent, 0.12); vars["--accent-border"] = _hr(preset.accent, 0.5); }
  return { dataTema: preset.base, vars, gradient: preset.gradient || null, bgImage: preset.bgImage || null };
}

export default function ConfigPanel({ config, onBack }) {
  const {
    draft, setField, setDia, setTurno, addTurno, removeTurno,
    nuevaFecha, setNuevaFecha, addFechaBloqueada, removeFechaBloqueada,
    guardar, guardado, errorGuardado, exportarWidget,
    addPregunta, removePregunta, setPregunta,
    addTemaGuardado, removeTemaGuardado, getConfigFinal,
  } = config;

  /* ── Estado local ── */
  const [copiado, setCopiado] = useState(false);
  const [abierto, setAbierto] = useState("negocio");
  const [modalCustom, setModalCustom] = useState(false);
  const [nombreTema, setNombreTema] = useState("");
  const [confirmarEliminarPregunta, setConfirmarEliminarPregunta] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [temaPanel, setTemaPanel] = useState(() => localStorage.getItem("turno-ya-tema-panel") || "claro");
  const [cuentaOpen, setCuentaOpen] = useState(false);
  const [categoriaTema, setCategoriaTema] = useState("todos");
  const [verMasTemas, setVerMasTemas] = useState(false);
  const [headerH, setHeaderH] = useState(0);
  const avatarBtnRef = useRef(null);
  const stickyRef = useRef(null);

  /* ── Tema del panel ── */
  const closeMenu = () => { setMenuOpen(false); setMobileMenuOpen(false); };
  const openMenu = () => {
    if (avatarBtnRef.current) {
      const r = avatarBtnRef.current.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 6, left: r.left });
    }
    setMenuOpen(p => !p);
  };
  const aplicarTemaPanel = (id) => { setTemaPanel(id); localStorage.setItem("turno-ya-tema-panel", id); closeMenu(); };


  useEffect(() => {
    const bg = getPanelVars(temaPanel)["--bg"] || "";
    document.body.style.backgroundColor = bg;
    return () => { document.body.style.removeProperty("background-color"); };
  }, [temaPanel]);

  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const update = () => setHeaderH(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Refs ── */
  const tabnavRef = useRef(null);
  const scrollTabnav = (dir) => tabnavRef.current?.scrollBy({ left: dir * 120, behavior: "smooth" });

  /* ── Utils ── */
  const hoy = new Date().toISOString().split("T")[0];
  const toggle = (key) => setAbierto((prev) => (prev === key ? null : key));

  /* ── Copiar widget ── */
  const copiarWidget = () => {
    const json = exportarWidget();
    const snippet = `<div id="turno-ya" data-config='${json}'></div>\n<link rel="stylesheet" href="https://turnoya-demo.netlify.app/turno-ya.css">\n<script src="https://turnoya-demo.netlify.app/turno-ya.js"></script>`;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  /* ── Descargar QR ── */
  const descargarQR = () => {
    const svg = document.getElementById("turno-ya-qr");
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

  /* ══════════════════════════════════════════
     PÁGINA DE CUENTA (sub-vista completa)
  ══════════════════════════════════════════ */
  if (cuentaOpen) {
    return (
      <section className="admin-section cfg-cuenta-page" data-tema-panel={temaPanel}>
        <div className="cfg-cuenta-inner">

          {/* ── Topbar de cuenta ── */}
          <div className="cfg-cuenta-topbar">
            <button type="button" className="cfg-cuenta-back" onClick={() => setCuentaOpen(false)}>
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

          {/* ── Título de la página ── */}
          <div className="cfg-cuenta-head">
            <h2 className="cfg-cuenta-title">Cuenta</h2>
            <p className="cfg-cuenta-subtitle">Gestiona el destino de reservas, contacto y seguridad.</p>
          </div>

          {/* ── 1. Destino de reservas ── */}
          <div className="cfg-cuenta-section">
            <span className="cfg-cuenta-section-label">Destino de reservas</span>
            <div className="cfg-card cfg-card-mobile">

              {/* Selector WhatsApp / Email */}
              <label className="admin-label">
                <span>Modo de envío</span>
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

              {/* Número o email según el modo seleccionado */}
              {draft.modoEnvio === "email" ? (
                <label className="admin-label">
                  <span>Email donde recibes las reservas</span>
                  <input className="admin-input" type="email" placeholder="tu@email.com"
                    value={draft.emailNegocio ?? ""}
                    onChange={(e) => setField("emailNegocio", e.target.value)} />
                </label>
              ) : (
                <label className="admin-label">
                  <span>Número de WhatsApp (sin + ni espacios)</span>
                  <input className="admin-input" type="tel" placeholder="34600000000"
                    maxLength={15} value={draft.whatsapp}
                    onChange={(e) => setField("whatsapp", e.target.value.replace(/[^\d]/g, ""))} />
                  <span className="admin-counter">{draft.whatsapp.length} / 15</span>
                </label>
              )}

            </div>
          </div>

          {/* ── 2. Datos de contacto ── */}
          <div className="cfg-cuenta-section">
            <span className="cfg-cuenta-section-label">Datos de contacto</span>
            <div className="cfg-card cfg-card-mobile">

              {/* Teléfono visible en el formulario del cliente */}
              <label className="admin-label">
                <span>Teléfono de contacto visible</span>
                <input className="admin-input" type="tel" placeholder="+34600000000"
                  disabled={!(draft.camposActivos?.telefono ?? true)}
                  maxLength={16} value={draft.telefono}
                  onChange={(e) => setField("telefono", e.target.value)} />
                <span className="admin-counter">{draft.telefono.length} / 16</span>
              </label>

              {/* Texto del enlace de teléfono */}
              <label className="admin-label">
                <span>Texto del enlace de teléfono</span>
                <input className="admin-input" type="text" maxLength={36}
                  disabled={!(draft.mostrarTelefono ?? true)}
                  value={draft.textoTelefono}
                  onChange={(e) => setField("textoTelefono", e.target.value)} />
                <span className="admin-counter">{draft.textoTelefono.length} / 36</span>
              </label>

              {/* Toggle mostrar enlace de teléfono */}
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

              {/* PIN de acceso al panel de administración */}
              <label className="admin-label">
                <span>Cambiar PIN de acceso</span>
                <input className="admin-input" type="password" inputMode="numeric"
                  maxLength={8} placeholder="Nuevo PIN" value={draft.pinAdmin}
                  onChange={(e) => setField("pinAdmin", e.target.value)} />
                <span className="admin-counter">{draft.pinAdmin.length} / 8</span>
              </label>

            </div>
          </div>

          {/* ── 4. Herramientas ── */}
          <div className="cfg-cuenta-section">
            <span className="cfg-cuenta-section-label">Herramientas</span>
            <div className="cfg-card cfg-card-mobile">

              {/* QR del formulario */}
              <p className="admin-hint">Imprímelo o compártelo para que tus clientes accedan directamente.</p>
              <div className="admin-qr-wrapper">
                <QRCodeSVG id="turno-ya-qr"
                  value={window.location.href.replace("#admin", "").replace("#", "") || window.location.origin}
                  size={160} level="M" />
              </div>
              <button type="button" className="admin-btn-secondary" onClick={descargarQR}>
                Descargar QR
              </button>

              <hr className="admin-modal-sep" />

              {/* Widget embebible */}
              <button className="admin-btn-export" type="button" onClick={copiarWidget}>
                {copiado ? "✓ Copiado" : "Copiar código del widget"}
              </button>

              <hr className="admin-modal-sep" />

              {/* Limpiar caché local */}
              <p className="admin-hint">Si la app no refleja los últimos cambios, limpia la caché.</p>
              <button className="admin-btn-secondary" type="button"
                onClick={() => { localStorage.clear(); window.location.reload(); }}>
                Limpiar caché
              </button>

            </div>
          </div>

          {/* Botón guardar */}
          <button className="admin-btn-primary cfg-cuenta-save" type="button" onClick={guardar}>
            {guardado ? "✓ Guardado" : "Guardar cambios"}
          </button>
          {errorGuardado && <p className="admin-error">{errorGuardado}</p>}

        </div>
      </section>
    );
  }

  /* ══════════════════════════════════════════
     PANEL PRINCIPAL
  ══════════════════════════════════════════ */
  return (
    <>
      {menuOpen && createPortal(
        <>
          <div className="cfg-menu-overlay" onClick={closeMenu} />
          <div className="cfg-mobile-menu cfg-portal-menu"
            data-tema-panel={temaPanel}
            style={{ top: menuPos.top, left: menuPos.left }}>
            <div className="cfg-menu-header">
              <span className="cfg-menu-nombre">{draft.nombre || "TurnoYa"}</span>
              <span className="cfg-menu-email">{draft.emailNegocio || "—"}</span>
            </div>
            <hr className="cfg-menu-sep" />
            <div className="cfg-menu-items">
              <button type="button" className="cfg-menu-item"
                onClick={() => { setCuentaOpen(true); closeMenu(); }}>
                <Settings size={15} />Configuración de cuenta
              </button>
              <button type="button" className="cfg-menu-item" disabled>
                <FlaskConical size={15} />Vistas previas
              </button>
              <button type="button" className="cfg-menu-item" disabled>
                <ScrollText size={15} />Registro de cambios
              </button>
            </div>
            <hr className="cfg-menu-sep" />
            <div className="cfg-menu-section">
              <span className="cfg-menu-section-label">Tema</span>
              <div className="cfg-menu-tema-list">
                {TEMAS_PANEL.map(({ id, label }) => (
                  <button key={id} type="button"
                    className={`cfg-menu-tema-item ${temaPanel === id ? "cfg-menu-tema-item--active" : ""}`}
                    onClick={() => aplicarTemaPanel(id)}>
                    <span className="cfg-menu-tema-dot" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
      <section className="admin-section" data-tema-panel={temaPanel}>
        <div className="cfg-wrapper">

          {/* ── Sidebar desktop ── */}
          <aside className="cfg-sidebar">
            <div className="cfg-sidebar-logo">
              <div className="cfg-sidebar-avatar-wrap">
                <button ref={avatarBtnRef} type="button" className="cfg-mobile-avatar-btn" onClick={openMenu}>
                  {draft.logoUrl
                    ? <img src={draft.logoUrl} alt="" className="cfg-mobile-avatar-img" />
                    : <User size={16} />
                  }
                </button>
              </div>
              <span className="cfg-sidebar-nombre">{draft.nombre || "TurnoYa"}</span>
            </div>
            <nav className="cfg-sidebar-nav">
              {[
                { key: "negocio", icon: <Store size={17} />, label: "Negocio" },
                { key: "horarios", icon: <Clock size={17} />, label: "Horarios" },
                { key: "reservas", icon: <Settings2 size={17} />, label: "Configuración" },
                { key: "preguntas", icon: <HelpCircle size={17} />, label: "Preguntas" },
                { key: "preview", icon: <Eye size={17} />, label: "Apariencia" },
              ].map(({ key, icon, label }) => (
                <button key={key} type="button"
                  className={`cfg-sidebar-item ${abierto === key ? "cfg-sidebar-item--active" : ""}`}
                  onClick={() => setAbierto(key)}>
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <form className="admin-form cfg-main" onSubmit={guardar}>

            {/* ── Topbar desktop ── */}
            <div className="cfg-topbar">
              <button type="button" className="admin-seccion-back" onClick={onBack}>← Volver</button>
              <button className="admin-btn-primary" type="submit">
                {guardado ? "✓ Guardado" : "Guardar cambios"}
              </button>
            </div>

            {/* ── Header móvil + Tabnav (sticky) ── */}
            <div className="cfg-mobile-header-sticky" ref={stickyRef}>

              <div className="admin-header">

                <button type="button" className="cfg-mobile-back-btn" onClick={onBack}>
                  <ArrowLeft size={18} />
                  Volver
                </button>



                {/* Centro absoluto: avatar + nombre, siempre visible */}
                <div className="cfg-header-mid">
                  <div className="cfg-mobile-profile">
                    <button type="button" className="cfg-mobile-avatar-btn" onClick={() => setMobileMenuOpen(p => !p)}>
                      {draft.logoUrl
                        ? <img src={draft.logoUrl} alt="" className="cfg-mobile-avatar-img" />
                        : <User size={16} />
                      }
                    </button>
                    <span className="cfg-mobile-negocio">{draft.nombre || "TurnoYa"}</span>
                  </div>

                  {mobileMenuOpen && (
                    <>
                      <div className="cfg-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
                      <div className="cfg-mobile-menu">

                        <div className="cfg-menu-header">
                          <span className="cfg-menu-nombre">{draft.nombre || "TurnoYa"}</span>
                          <span className="cfg-menu-email">{draft.emailNegocio || "—"}</span>
                        </div>

                        <hr className="cfg-menu-sep" />

                        <div className="cfg-menu-items">
                          <button type="button" className="cfg-menu-item"
                            onClick={() => { setCuentaOpen(true); closeMenu(); }}>
                            <Settings size={15} />Configuración de cuenta
                          </button>
                          <button type="button" className="cfg-menu-item" disabled>
                            <FlaskConical size={15} />Vistas previas
                          </button>
                          <button type="button" className="cfg-menu-item" disabled>
                            <ScrollText size={15} />Registro de cambios
                          </button>
                        </div>

                        <hr className="cfg-menu-sep" />

                        <div className="cfg-menu-section">
                          <span className="cfg-menu-section-label">Tema</span>
                          <div className="cfg-menu-tema-list">
                            {TEMAS_PANEL.map(({ id, label }) => (
                              <button key={id} type="button"
                                className={`cfg-menu-tema-item ${temaPanel === id ? "cfg-menu-tema-item--active" : ""}`}
                                onClick={() => aplicarTemaPanel(id)}>
                                <span className="cfg-menu-tema-dot" />
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <hr className="cfg-menu-sep" />

                        <button type="button" className="cfg-menu-logout" disabled>
                          <LogOut size={15} />Cerrar sesión
                        </button>

                      </div>
                    </>
                  )}
                </div>

                <button type="submit" className="admin-btn-primary cfg-header-save-btn">
                  {guardado ? "✓ Guardado" : "Guardar"}
                </button>

              </div>

              {/* ── Tabnav móvil ── */}
              <div className="cfg-tabnav-wrap">
                <button type="button" className="cfg-tabnav-arrow" onClick={() => scrollTabnav(-1)}>
                  <ChevronLeft size={14} />
                </button>
                <nav className="cfg-tabnav" ref={tabnavRef}>
                  {[
                    { key: "negocio", label: "Negocio" },
                    { key: "horarios", label: "Horarios" },
                    { key: "reservas", label: "Config" },
                    { key: "preguntas", label: "Preguntas" },
                    { key: "preview", label: "Apariencia" },
                  ].map(({ key, label }) => (
                    <button key={key} type="button"
                      className={`cfg-tabnav-item ${abierto === key ? "cfg-tabnav-item--active" : ""}`}
                      onClick={() => setAbierto(key)}>
                      {label}
                    </button>
                  ))}
                </nav>
                <button type="button" className="cfg-tabnav-arrow" onClick={() => scrollTabnav(1)}>
                  <ChevronRight size={14} />
                </button>
              </div>

            </div>
            <div className="cfg-header-spacer" style={{ height: headerH }} />

            <div className="acc-list">

              {/* ── NEGOCIO ── */}
              <div className="acc-seccion">
                <button type="button" className={`acc-header ${abierto === "negocio" ? "acc-header--open" : ""}`}
                  onClick={() => toggle("negocio")}>
                  <span>Negocio</span>
                  <span className={`acc-arrow ${abierto === "negocio" ? "acc-arrow--open" : ""}`}><ChevronDown size={16} /></span>
                </button>
                {abierto === "negocio" && (
                  <div className="acc-body">

                    {/* ── Visibilidad ── */}
                    <div className="cfg-card">
                      <div className="cfg-card-desktop cfg-card-mobile">

                        <div className="cont-header-titles">
                          <h2 className="cfg-card-label">Visibilidad</h2>
                          <p className="cfg-card-subtitle">Campos del formulario</p>
                        </div>
                        {/* Campos del formulario */}
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

                        {/* Datos del negocio */}
                        <div className="cfg-card-cont">
                          <p className="cfg-card-subtitle">Funciones</p>

                          {/* Mostrar nombre del negocio */}
                          <div className="cfg-toggle-row">
                            <span className="cfg-toggle-label1">Mostrar nombre del negocio</span>
                            <label className="cfg-toggle">
                              <input type="checkbox" checked={draft.mostrarNombre ?? true}
                                onChange={(e) => setField("mostrarNombre", e.target.checked)} />
                              <span className="cfg-toggle-track" />
                            </label>
                          </div>

                          {/* Mostrar panel de ayuda */}
                          <div className="cfg-toggle-row">
                            <span className="cfg-toggle-label1">Panel de ayuda</span>
                            <label className="cfg-toggle">
                              <input type="checkbox" checked={draft.mostrarPanelAyuda ?? true}
                                onChange={(e) => setField("mostrarPanelAyuda", e.target.checked)} />
                              <span className="cfg-toggle-track" />
                            </label>
                          </div>

                          {/* Google Calendar en mensaje */}
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
                    {draft.modoEnvio !== "email" && <div className="cfg-card">
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
                    </div>}

                  </div>
                )}
              </div>

              {/* ── HORARIOS ── */}
              <div className="acc-seccion">
                <button type="button" className={`acc-header ${abierto === "horarios" ? "acc-header--open" : ""}`}
                  onClick={() => toggle("horarios")}>
                  <span>Horarios</span>
                  <span className={`acc-arrow ${abierto === "horarios" ? "acc-arrow--open" : ""}`}><ChevronDown size={16} /></span>
                </button>
                {abierto === "horarios" && (
                  <div className="acc-body">
                    <div className="cfg-card-desktop cfg-card-mobile">

                      <div className="cont-header-titles">
                        <h2 className="cfg-card-label">Horarios de atención</h2>
                        <p className="cfg-card-subtitle">Configura los días y turnos disponibles.</p>
                      </div>
                      {/* Días de la semana */}
                      {Object.entries(draft.horarios).map(([day, { abierto: diaAbierto, turnos }]) => (


                        <div key={day} className={`cfg-card cfg-card--dia ${diaAbierto ? "cfg-card--dia-open" : "cfg-card--dia-closed"}`}>

                          <div className="cfg-toggle-row">
                            <div className="cfg-dia-info">
                              <span className={`cfg-dia-icon ${diaAbierto ? "cfg-dia-icon--open" : "cfg-dia-icon--closed"}`}>
                                <Calendar size={17} />
                              </span>
                              <div>
                                <div className="cfg-dia-nombre">{DIAS[day]}</div>
                                <div className={`cfg-dia-status ${diaAbierto ? "cfg-dia-status--open" : "cfg-dia-status--closed"}`}>
                                  {diaAbierto ? "Abierto" : "Cerrado"}
                                </div>
                              </div>
                            </div>
                            <label className="cfg-toggle">
                              <input type="checkbox" checked={diaAbierto}
                                onChange={(e) => setDia(day, { abierto: e.target.checked })} />
                              <span className="cfg-toggle-track" />
                            </label>
                          </div>
                          {diaAbierto && (
                            <div className="admin-turnos">
                              {turnos.map((turno, i) => (
                                <div key={i} className="admin-turno">
                                  <input className="admin-input admin-input-time" type="time" value={turno.start}
                                    onChange={(e) => setTurno(day, i, "start", e.target.value)} />
                                  <span className="admin-turno-sep">—</span>
                                  <input className="admin-input admin-input-time" type="time" value={turno.end}
                                    onChange={(e) => setTurno(day, i, "end", e.target.value)} />
                                  {turnos.length > 1 && (
                                    <button type="button" className="admin-btn-remove" onClick={() => removeTurno(day, i)}>
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button type="button" className="admin-btn-add" onClick={() => addTurno(day)}>+ Agregar turno</button>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* ── Fechas bloqueadas ── */}
                      <div className="cfg-card cfg-card--dia">
                        <div className="cfg-toggle-row">
                          <div className="cfg-dia-info">
                            <span className="cfg-dia-icon cfg-dia-icon--neutral">
                              <CalendarX size={17} />
                            </span>
                            <div>
                              <div className="cfg-dia-nombre">Fechas bloqueadas</div>
                              {draft.fechasBloqueadas.length > 0 && (
                                <div className="cfg-dia-status cfg-dia-status--closed">
                                  {draft.fechasBloqueadas.length} bloqueada{draft.fechasBloqueadas.length !== 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="admin-turnos">
                          {draft.fechasBloqueadas.length > 0 && (
                            <ul className="admin-fechas-list">
                              {draft.fechasBloqueadas.map((fecha) => (
                                <li key={fecha} className="admin-fecha-item">
                                  <span>{fecha.split("-").reverse().join("/")}</span>
                                  <button type="button" className="admin-btn-remove" onClick={() => removeFechaBloqueada(fecha)}>
                                    <Trash2 size={14} />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="admin-fecha-add">
                            <input className="admin-input" type="date" value={nuevaFecha}
                              min={hoy} onChange={(e) => setNuevaFecha(e.target.value)} />
                            <button type="button" className="admin-btn-add-fecha" onClick={addFechaBloqueada}>Bloquear</button>
                          </div>
                        </div>
                      </div>

                      {/* ── Cierre temporal ── */}
                      <div className={`cfg-card cfg-card--dia ${draft.cierreTemporalFecha === hoy ? "cfg-card--dia-closed" : "cfg-card--dia-open"}`}>
                        <div className="cfg-toggle-row">
                          <div className="cfg-dia-info">
                            <span className={`cfg-dia-icon ${draft.cierreTemporalFecha === hoy ? "cfg-dia-icon--closed" : "cfg-dia-icon--open"}`}>
                              <Lock size={15} />
                            </span>
                            <div>
                              <div className="cfg-dia-nombre">Cerrar hoy</div>
                              <div className={`cfg-dia-status ${draft.cierreTemporalFecha === hoy ? "cfg-dia-status--closed" : "cfg-dia-status--open"}`}>
                                {draft.cierreTemporalFecha === hoy ? "Hoy cerrado" : "Hoy abierto"}
                              </div>
                            </div>
                          </div>
                          <label className="cfg-toggle">
                            <input type="checkbox"
                              checked={draft.cierreTemporalFecha === hoy}
                              onChange={(e) => setField("cierreTemporalFecha", e.target.checked ? hoy : "")} />
                            <span className="cfg-toggle-track" />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── CONFIGURACIÓN DE RESERVAS ── */}
              <div className="acc-seccion">
                <button type="button" className={`acc-header ${abierto === "reservas" ? "acc-header--open" : ""}`}
                  onClick={() => toggle("reservas")}>
                  <span>Configuración</span>
                  <span className={`acc-arrow ${abierto === "reservas" ? "acc-arrow--open" : ""}`}><ChevronDown size={16} /></span>
                </button>
                {abierto === "reservas" && (
                  <div className="acc-body">
                    <div className="cfg-card-desktop cfg-card-mobile">
                      <div className="cont-header-titles">
                        <h2 className="cfg-card-label">Gestión de reservas</h2>
                        <p className="cfg-card-subtitle">Ajusta límites, antelación y capacidad de las reservas.</p>
                      </div>
                      {/* ── TIEMPO ── */}
                      <div className="cfg-rsv-section cfg-rsv-section--tiempo">
                        <div className="cfg-rsv-section-head">
                          <span className="cfg-rsv-badge"><Clock size={14} /></span>
                          <h3 className="cfg-rsv-section-title">Tiempo</h3>
                        </div>
                        <div className="cfg-rsv-row">
                          <div className="cfg-rsv-row-label">
                            <h5 className="cfg-rsv-label">Duración de cada reserva (Min)</h5>
                            <p className="cfg-rsv-hint">Franja horaria disponible.</p>
                          </div>
                          <select className="admin-input cfg-rsv-input" value={draft.slotInterval}
                            onChange={(e) => setField("slotInterval", Number(e.target.value))}>
                            <option value={15}>15 min</option>
                            <option value={20}>20 min</option>
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                            <option value={60}>1 hora</option>
                            <option value={90}>1 h 30 min</option>
                            <option value={120}>2 horas</option>
                          </select>
                        </div>
                        <div className="cfg-rsv-row">
                          <div className="cfg-rsv-row-label">
                            <h5 className="cfg-rsv-label">Antelación mínima (horas)</h5>
                            <p className="cfg-rsv-hint">0 = reserva inmediata.</p>
                          </div>
                          <input className="admin-input cfg-rsv-input" type="number" min="0" max="72"
                            value={draft.antelacionMinHoras}
                            onChange={(e) => setField("antelacionMinHoras", Number(e.target.value))} />
                        </div>
                        <div className="cfg-rsv-row">
                          <div className="cfg-rsv-row-label">
                            <h5 className="cfg-rsv-label">Antelación máxima (días)</h5>
                            <p className="cfg-rsv-hint">Días máximos para reservar.</p>
                          </div>
                          <input className="admin-input cfg-rsv-input" type="number" min="1" max="365"
                            value={draft.antelacionMaxDias}
                            onChange={(e) => setField("antelacionMaxDias", Number(e.target.value))} />
                        </div>
                      </div>

                      {/* ── CAPACIDAD ── */}
                      <div className="cfg-rsv-section cfg-rsv-section--capacidad">
                        <div className="cfg-rsv-section-head">
                          <span className="cfg-rsv-badge"><Users size={14} /></span>
                          <h3 className="cfg-rsv-section-title">Capacidad</h3>
                        </div>
                        <div className="cfg-rsv-row">
                          <div className="cfg-rsv-row-label">
                            <h5 className="cfg-rsv-label">Mínimo de personas</h5>
                            <p className="cfg-rsv-hint">Por reserva.</p>
                          </div>
                          <input className="admin-input cfg-rsv-input" type="number" min="1" max="99"
                            value={draft.minPersonas}
                            onChange={(e) => setField("minPersonas", Number(e.target.value))} />
                        </div>
                        <div className="cfg-rsv-row">
                          <div className="cfg-rsv-row-label">
                            <h5 className="cfg-rsv-label">Máximo de personas</h5>
                            <p className="cfg-rsv-hint">Por reserva.</p>
                          </div>
                          <input className="admin-input cfg-rsv-input" type="number" min="1" max="100"
                            value={draft.maxPersonas}
                            onChange={(e) => setField("maxPersonas", Number(e.target.value))} />
                        </div>
                      </div>

                      {/* ── AFORO ── */}
                      <div className="cfg-rsv-section cfg-rsv-section--aforo">
                        <div className="cfg-rsv-section-head">
                          <span className="cfg-rsv-badge"><SlidersHorizontal size={14} /></span>
                          <h3 className="cfg-rsv-section-title">Aforo</h3>
                        </div>
                        <div className="cfg-rsv-row">
                          <div className="cfg-rsv-row-label">
                            <h5 className="cfg-rsv-label">Aforo máximo por horario</h5>
                            <p className="cfg-rsv-hint">0 = sin límite. Requiere panel de reservas.</p>
                          </div>
                          <input className="admin-input cfg-rsv-input" type="number" min="0" max="999"
                            value={draft.aforoPorSlot}
                            onChange={(e) => setField("aforoPorSlot", Number(e.target.value))} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── PREGUNTAS ── */}
              <div className="acc-seccion">

                <button type="button" className={`acc-header ${abierto === "preguntas" ? "acc-header--open" : ""}`}
                  onClick={() => toggle("preguntas")}>
                  <span>Preguntas</span>
                  <span className={`acc-arrow ${abierto === "preguntas" ? "acc-arrow--open" : ""}`}><ChevronDown size={16} /></span>
                </button>
                {abierto === "preguntas" && (
                  <div className="acc-body">
                    <div className="cfg-card-desktop cfg-card-mobile">

                      {/* Cabecera */}
                      <div className="cont-header-titles">
                        <h2 className="cfg-card-label">Preguntas personalizadas</h2>
                        <p className="cfg-card-subtitle">Campos extra que verá el cliente al reservar.</p>
                      </div>
                      <div className="cfg-preguntas-list">
                        {/* Lista de preguntas */}
                        {draft.preguntasExtra.map((p, i) => (
                          p.guardado ? (
                            /* Pregunta guardada */
                            <div key={p.id} className="cfg-pregunta-card">
                              <div className="cfg-pregunta-top">
                                <span className="cfg-pregunta-icon"><FileText size={15} /></span>
                                <div>
                                  <div className="cfg-pregunta-nombre">{p.label}</div>
                                  <div className="cfg-pregunta-tipo">
                                    {p.tipo === "seleccion" ? "Opciones" : "Texto libre"}
                                    {p.requerida && <span className="cfg-pregunta-obligatoria"> · Obligatoria</span>}
                                  </div>
                                </div>
                              </div>
                              {confirmarEliminarPregunta === i ? (
                                <div className="cfg-pregunta-actions">
                                  <span className="cfg-pregunta-confirmar">¿Eliminar?</span>
                                  <button type="button" className="cfg-pregunta-btn cfg-pregunta-btn--danger"
                                    onClick={() => { removePregunta(i); setConfirmarEliminarPregunta(null); }}>Sí</button>
                                  <button type="button" className="cfg-pregunta-btn"
                                    onClick={() => setConfirmarEliminarPregunta(null)}>No</button>
                                </div>
                              ) : (
                                <div className="cfg-pregunta-actions">
                                  <button type="button" className="cfg-pregunta-btn"
                                    onClick={() => setPregunta(i, "guardado", false)}>
                                    <Pencil size={12} />Editar
                                  </button>
                                  <button type="button" className="cfg-pregunta-btn cfg-pregunta-btn--danger"
                                    onClick={() => setConfirmarEliminarPregunta(i)}>
                                    <Trash2 size={12} />Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Pregunta en edición */
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
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── APARIENCIA ── */}
              <div className="acc-seccion acc-seccion--preview">
                <button type="button" className={`acc-header ${abierto === "preview" ? "acc-header--open" : ""}`}
                  onClick={() => toggle("preview")}>
                  <span>Apariencia</span>
                  <span className={`acc-arrow ${abierto === "preview" ? "acc-arrow--open" : ""}`}><ChevronDown size={16} /></span>
                </button>
                {abierto === "preview" && (() => {
                  const { dataTema, vars, gradient, bgImage } = getFormVars(draft.tema, draft.colorFondo, draft.colorAcento, draft.colorBorde, TEMAS);
                  return (
                    <div className="acc-body">
                      <div className="cfg-card-desktop cfg-card-mobile">
                        <div className="cont-header-titles">
                          <h2 className="cfg-card-label">Tema del formulario</h2>
                          <p className="cfg-card-subtitle">Elige el estilo visual de tu formulario.</p>
                        </div>
                        {/* Selector de tema del formulario */}
                        <div className="cfg-card">
                          <div className="cfg-card-desktop cfg-card-mobile">


                            {/* Tabs de categoría */}
                            <div className="cfg-tema-cats">
                              {[
                                { id: "todos", label: "Todos", icon: <LayoutGrid size={13} /> },
                                { id: "claro", label: "Claros", icon: <Sun size={13} /> },
                                { id: "oscuro", label: "Oscuros", icon: <Moon size={13} /> },
                                { id: "fondo", label: "Artísticos", icon: <ImageIcon size={13} /> },
                                { id: "favoritos", label: "Favoritos", icon: <Star size={13} /> },

                              ].map(({ id, label, icon }) => (
                                <button key={id} type="button"
                                  className={`cfg-tema-cat-btn ${categoriaTema === id ? "cfg-tema-cat-btn--active" : ""}`}
                                  onClick={() => { setCategoriaTema(id); setVerMasTemas(false); }}>
                                  {icon}{label}
                                </button>
                              ))}
                            </div>

                            {/* Grid de cards */}
                            {(() => {
                              const renderCard = (tema) => {
                                const cardBg = tema.bgImage
                                  ? { backgroundImage: `url("${tema.bgImage}")`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }
                                  : tema.gradient
                                    ? { background: tema.gradient }
                                    : { background: tema.bg || "#e5e5e5" };
                                return (
                                  <button key={tema.id} type="button"
                                    className={`cfg-tema-card cfg-tema-card--${tema.base} ${draft.tema === tema.id ? "cfg-tema-card--active" : ""}`}
                                    style={cardBg}
                                    onClick={() => {
                                      setField("tema", tema.id);
                                      window.dispatchEvent(new CustomEvent("turno-ya:tema", { detail: { tema: tema.id, colorFondo: draft.colorFondo, colorAcento: draft.colorAcento, colorBorde: draft.colorBorde } }));
                                    }}>
                                    <div className="cfg-tema-card-overlay" />
                                    <span className="cfg-tema-card-nombre">{tema.label}</span>
                                    {draft.tema === tema.id && <span className="cfg-tema-card-check"><Check size={11} /></span>}
                                  </button>
                                );
                              };

                              const todos = TEMAS.filter(t => t.id !== "personalizado");

                              if (categoriaTema === "todos") {
                                const selected = todos.find(t => t.id === draft.tema);
                                const rest = todos.filter(t => t.id !== draft.tema);
                                const visible = verMasTemas ? todos : [selected, ...rest.slice(0, 3)].filter(Boolean);
                                const remaining = todos.length - visible.length;
                                return (
                                  <>
                                    <div className="cfg-tema-grid">{visible.map(renderCard)}</div>
                                    {(verMasTemas || todos.length > 4) && (
                                      <button type="button" className="cfg-tema-vermás-btn"
                                        onClick={() => setVerMasTemas(p => !p)}>
                                        {verMasTemas ? "Ver menos ↑" : `Ver todos · ${remaining} más ↓`}
                                      </button>
                                    )}
                                  </>
                                );
                              }

                              if (categoriaTema === "fondo") {
                                const fondosClaros = todos.filter(t => t.bgImage && t.base === "claro");
                                const fondosOscuros = todos.filter(t => t.bgImage && t.base === "oscuro");
                                return (
                                  <>
                                    {fondosClaros.length > 0 && (
                                      <>
                                        <span className="cfg-tema-grupo-label">Fondos claros</span>
                                        <div className="cfg-tema-grid">{fondosClaros.map(renderCard)}</div>
                                      </>
                                    )}
                                    {fondosOscuros.length > 0 && (
                                      <>
                                        <span className="cfg-tema-grupo-label">Fondos oscuros</span>
                                        <div className="cfg-tema-grid">{fondosOscuros.map(renderCard)}</div>
                                      </>
                                    )}
                                  </>
                                );
                              }

                              const temas = todos.filter(t => t.base === categoriaTema);
                              const solidos = temas.filter(t => !t.bgImage);
                              const artisticos = temas.filter(t => t.bgImage);
                              return (
                                <>
                                  {solidos.length > 0 && (
                                    <>
                                      <span className="cfg-tema-grupo-label">Colores sólidos</span>
                                      <div className="cfg-tema-grid">{solidos.map(renderCard)}</div>
                                    </>
                                  )}
                                  {artisticos.length > 0 && (
                                    <>
                                      <span className="cfg-tema-grupo-label">Fondos artísticos</span>
                                      <div className="cfg-tema-grid">{artisticos.map(renderCard)}</div>
                                    </>
                                  )}
                                </>
                              );
                            })()}

                            {/* Botón Custom */}
                            <button type="button"
                              className={`cfg-tema-custom-btn ${draft.tema === "personalizado" ? "cfg-tema-custom-btn--active" : ""}`}
                              onClick={() => setModalCustom(true)}>
                              <Lock size={13} />Custom
                            </button>
                          </div>
                        </div>

                        {/* Preview en vivo del formulario */}
                        <div className="cfg-tema-preview-wrap" data-tema={dataTema} style={bgImage
                          ? { ...vars, backgroundColor: "var(--bg)", backgroundImage: `url("${bgImage}")`, backgroundSize: "cover", backgroundPosition: "center" }
                          : { ...vars, background: gradient || "var(--bg)" }}>
                          <ReservaWhatsApp configOverride={getConfigFinal()} />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Botón guardar móvil */}


          </form>
        </div>

        {/* ── Modal tema personalizado ── */}
        {modalCustom && (
          <div className="admin-modal-overlay" onClick={() => setModalCustom(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>

              {/* Cabecera del modal */}
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

                {/* Color de fondo */}
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

                {/* Color principal */}
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

                {/* Color de bordes */}
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

                {/* Guardar como favorito */}
                <div className="admin-favorito-save">
                  <input className="admin-input" type="text" placeholder="Nombre del favorito"
                    maxLength={30} value={nombreTema} onChange={(e) => setNombreTema(e.target.value)} />
                  <button type="button" className="admin-btn-add-fecha" disabled={!nombreTema.trim()}
                    onClick={() => { addTemaGuardado(nombreTema.trim()); setNombreTema(""); }}>
                    Guardar
                  </button>
                </div>

              </div>

              {/* Aplicar tema */}
              <button type="button" className="admin-btn-primary" onClick={() => {
                setField("tema", "personalizado");
                setModalCustom(false);
              }}>Aplicar</button>

            </div>
          </div>
        )}
      </section>
    </>
  );
}
