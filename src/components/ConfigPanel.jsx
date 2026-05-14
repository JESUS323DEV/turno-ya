import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, LogOut, Settings, FlaskConical, ScrollText, User, Store, Clock, Settings2, HelpCircle, Eye, Scale } from "lucide-react";
import { TEMAS_PANEL, getPanelVars } from "../config/temasPanel";
import TabNegocio from "./config-tabs/TabNegocio";
import TabHorarios from "./config-tabs/TabHorarios";
import TabConfigReservas from "./config-tabs/TabConfigReservas";
import TabPreguntas from "./config-tabs/TabPreguntas";
import TabApariencia from "./config-tabs/TabApariencia";
import TabLegal from "./config-tabs/TabLegal";
import TabCuenta from "./config-tabs/TabCuenta";

function MenuContent({ onCuenta, draft, temaPanel, aplicarTemaPanel, onBack }) {
  return (
    <>
      <div className="cfg-menu-header">
        <span className="cfg-menu-nombre">{draft.nombre || "Reservaq"}</span>
        <span className="cfg-menu-email">{draft.emailNegocio || "—"}</span>
      </div>
      <hr className="cfg-menu-sep" />
      <div className="cfg-menu-items">
        <button type="button" className="cfg-menu-item" onClick={onCuenta}>
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
      <div className="cfg-menu-items">
        <button type="button" className="cfg-menu-item" onClick={onBack}>
          <ArrowLeft size={15} />Volver
        </button>
      </div>
    </>
  );
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
  const [abierto, setAbierto] = useState("negocio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [temaPanel, setTemaPanel] = useState(() => localStorage.getItem("turno-ya-tema-panel") || "claro");
  const [cuentaOpen, setCuentaOpen] = useState(false);
  const [headerH, setHeaderH] = useState(0);
  const avatarBtnRef = useRef(null);
  const stickyRef = useRef(null);
  const tabnavRef = useRef(null);

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
  }, [cuentaOpen]);

  const scrollTabnav = (dir) => tabnavRef.current?.scrollBy({ left: dir * 120, behavior: "smooth" });
  const toggle = (key) => setAbierto((prev) => (prev === key ? null : key));

  const TABS = [
    { key: "negocio", icon: <Store size={17} />, label: "Negocio" },
    { key: "horarios", icon: <Clock size={17} />, label: "Horarios" },
    { key: "reservas", icon: <Settings2 size={17} />, label: "Configuración" },
    { key: "preguntas", icon: <HelpCircle size={17} />, label: "Preguntas" },
    { key: "legal", icon: <Scale size={17} />, label: "Legal" },
    { key: "preview", icon: <Eye size={17} />, label: "Apariencia" },
  ];

  /* ── Sub-vista Cuenta ── */
  if (cuentaOpen) {
    return (
      <TabCuenta
        draft={draft}
        setField={setField}
        guardar={guardar}
        guardado={guardado}
        errorGuardado={errorGuardado}
        exportarWidget={exportarWidget}
        temaPanel={temaPanel}
        onClose={() => { setCuentaOpen(false); window.scrollTo(0, 0); }}
      />
    );
  }

  /* ── Panel principal ── */
  return (
    <>
      {menuOpen && createPortal(
        <>
          <div className="cfg-menu-overlay" onClick={closeMenu} />
          <div className="cfg-mobile-menu cfg-portal-menu"
            data-tema-panel={temaPanel}
            style={{ top: menuPos.top, left: menuPos.left }}>
            <MenuContent onCuenta={() => setCuentaOpen(true)} draft={draft} temaPanel={temaPanel} aplicarTemaPanel={aplicarTemaPanel} onBack={onBack} />
          </div>
        </>,
        document.body
      )}

      <section className="cfg-section" data-tema-panel={temaPanel}>
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
              <span className="cfg-sidebar-nombre">{draft.nombre || "Reservaq"}</span>
            </div>
            <nav className="cfg-sidebar-nav">
              {TABS.map(({ key, icon, label }) => (
                <button key={key} type="button"
                  className={`cfg-sidebar-item ${abierto === key ? "cfg-sidebar-item--active" : ""}`}
                  onClick={() => setAbierto(key)}>
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <form className="cfg-form cfg-main" onSubmit={guardar}>

            {/* ── Topbar desktop ── */}
            <div className="cfg-topbar">
              <button type="button" className="cfg-seccion-back" onClick={onBack}>← Volver</button>
              <button className="cfg-btn-primary" type="submit">
                {guardado ? "✓ Guardado" : "Guardar cambios"}
              </button>
            </div>

            {/* ── Header móvil + Tabnav (sticky) ── */}
            <div className="cfg-mobile-header-sticky" ref={stickyRef}>
              <div className="cfg-header">
                <div className="cfg-mobile-profile">
                  <button type="button" className="cfg-mobile-avatar-btn" onClick={() => setMobileMenuOpen(p => !p)}>
                    {draft.logoUrl
                      ? <img src={draft.logoUrl} alt="" className="cfg-mobile-avatar-img" />
                      : <User size={16} />
                    }
                  </button>
                  {mobileMenuOpen && (
                    <>
                      <div className="cfg-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
                      <div className="cfg-mobile-menu">
                        <MenuContent onCuenta={() => { setCuentaOpen(true); setMobileMenuOpen(false); }} draft={draft} temaPanel={temaPanel} aplicarTemaPanel={aplicarTemaPanel} onBack={() => { setMobileMenuOpen(false); onBack(); }} />
                        <hr className="cfg-menu-sep" />
                        <button type="button" className="cfg-menu-logout" disabled>
                          <LogOut size={15} />Cerrar sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <button type="submit" className="cfg-btn-primary cfg-header-save-btn">
                  {guardado ? "✓ Guardado" : "Guardar cambios"}
                </button>
              </div>

              {/* ── Tabnav móvil ── */}
              <div className="cfg-tabnav-wrap">
                <button type="button" className="cfg-tabnav-arrow" onClick={() => scrollTabnav(-1)}>
                  <ChevronLeft size={14} />
                </button>
                <nav className="cfg-tabnav" ref={tabnavRef}>
                  {TABS.map(({ key, label }) => (
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

              {TABS.map(({ key, label }) => (
                <div key={key} className={`acc-seccion${key === "preview" ? " acc-seccion--preview" : ""}`}>
                  <button type="button"
                    className={`acc-header ${abierto === key ? "acc-header--open" : ""}`}
                    onClick={() => toggle(key)}>
                    <span>{label}</span>
                    <span className={`acc-arrow ${abierto === key ? "acc-arrow--open" : ""}`}>
                      <ChevronDown size={16} />
                    </span>
                  </button>
                  {abierto === key && (
                    key === "negocio" ? <TabNegocio draft={draft} setField={setField} /> :
                    key === "horarios" ? <TabHorarios draft={draft} setField={setField} setDia={setDia} setTurno={setTurno} addTurno={addTurno} removeTurno={removeTurno} nuevaFecha={nuevaFecha} setNuevaFecha={setNuevaFecha} addFechaBloqueada={addFechaBloqueada} removeFechaBloqueada={removeFechaBloqueada} /> :
                    key === "reservas" ? <TabConfigReservas draft={draft} setField={setField} /> :
                    key === "preguntas" ? <TabPreguntas draft={draft} setField={setField} addPregunta={addPregunta} removePregunta={removePregunta} setPregunta={setPregunta} /> :
                    key === "legal" ? <TabLegal draft={draft} setField={setField} /> :
                    <TabApariencia draft={draft} setField={setField} addTemaGuardado={addTemaGuardado} removeTemaGuardado={removeTemaGuardado} getConfigFinal={getConfigFinal} />
                  )}
                </div>
              ))}

            </div>
          </form>
        </div>
      </section>
    </>
  );
}
