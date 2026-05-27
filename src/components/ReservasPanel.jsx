import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, Users, User, Settings, FlaskConical, ScrollText, ArrowLeft } from "lucide-react";
import iconWa from "../assets/icon-whatsapp.png";
import { fetchReservas, accionReserva, SLUG } from "../lib/supabase";
import { getPanelVars, TEMAS_PANEL } from "../config/temasPanel";

function MenuContent({ draft, temaPanel, aplicarTemaPanel, onCuenta, onBack }) {
  return (
    <>
      <div className="res-menu-header">
        <span className="res-menu-nombre">{draft.nombre || "Reservaq"}</span>
        <span className="res-menu-email">{draft.emailNegocio || "—"}</span>
      </div>
      <hr className="res-menu-sep" />
      <div className="res-menu-items">
        <button type="button" className="res-menu-item" onClick={onCuenta}>
          <Settings size={15} />Configuración de cuenta
        </button>
        <button type="button" className="res-menu-item" disabled>
          <FlaskConical size={15} />Vistas previas
        </button>
        <button type="button" className="res-menu-item" disabled>
          <ScrollText size={15} />Registro de cambios
        </button>
      </div>
      <hr className="res-menu-sep" />
      <div className="res-menu-section">
        <span className="res-menu-section-label">Tema</span>
        <div className="res-menu-tema-list">
          {TEMAS_PANEL.map(({ id, label }) => (
            <button key={id} type="button"
              className={`res-menu-tema-item ${temaPanel === id ? "res-menu-tema-item--active" : ""}`}
              onClick={() => aplicarTemaPanel(id)}>
              <span className="res-menu-tema-dot" />
              {label}
            </button>
          ))}
        </div>
      </div>
      <hr className="res-menu-sep" />
      <div className="res-menu-items">
        <button type="button" className="res-menu-item" onClick={onBack}>
          <ArrowLeft size={15} />Volver
        </button>
      </div>
    </>
  );
}

const TABS = { panel: "Reservas", consultas: "Consultas", historial: "Historial" };
const POR_PAGINA = 10;

export default function ReservasPanel({ pin, onBack, draft = {} }) {
  const [tab, setTab] = useState("panel");
  const [reservasMock, setReservasMock] = useState([]);
  const [filtroPanel, setFiltroPanel] = useState("todas");
  const [modalMensaje, setModalMensaje] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroServicio, setFiltroServicio] = useState("todos");
  const [filtroPersonas, setFiltroPersonas] = useState("todos");
  const [modalDetalle, setModalDetalle] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [paginaPanel, setPaginaPanel] = useState(1);
  const [tabFecha, setTabFecha] = useState("hoy");
  const [temaPanel, setTemaPanel] = useState(() => localStorage.getItem("reservaq-tema-panel") || "claro");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const avatarBtnRef = useRef(null);

  const panelVars = getPanelVars(temaPanel);

  const closeMenu = () => setMenuOpen(false);
  const openMenu = () => {
    if (avatarBtnRef.current) {
      const r = avatarBtnRef.current.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 6, left: r.left });
    }
    setMenuOpen(p => !p);
  };
  const aplicarTemaPanel = (id) => {
    localStorage.setItem("reservaq-tema-panel", id);
    setTemaPanel(id);
    closeMenu();
  };

  // Sincronizar body background con el tema del panel
  useEffect(() => {
    const bg = panelVars["--bg"];
    if (bg) document.body.style.backgroundColor = bg;
    return () => document.body.style.removeProperty("background-color");
  }, [panelVars]);


  const hoyStr = new Date().toISOString().split("T")[0];
  const hoyFormateado = hoyStr.split("-").reverse().join("-");
  const mananaStr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })();
  const pasadoMananaStr = (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split("T")[0]; })();

  useEffect(() => {
    const cargar = () => {
      fetchReservas(SLUG).then((data) => {
        setReservasMock(data.map((r) => ({ ...r, fecha: r.dia })));
        setUltimaActualizacion(new Date());
      });
    };
    cargar();
    const id = setInterval(cargar, 30000);
    return () => clearInterval(id);
  }, []);

  // ── Historial ────────────────────────────────────────────────────────────────
  const reservasHoy = reservasMock.filter(r => r.fecha >= hoyStr);
  const reservasHistorial = reservasMock.filter(r => r.fecha && r.fecha < hoyStr && (r.estado === "confirmada" || r.estado === "cancelada"));
  const consultas = reservasMock.filter(r => (r.perfil ?? "reserva") === "consulta");
  const pendientes = reservasMock.filter(r => r.fecha && r.estado === "pendiente").sort((a, b) => a.fecha.localeCompare(b.fecha));
  const pendientesReservas = pendientes.length;
  const pendientesConsultas = consultas.filter(r => r.estado === "pendiente").length;
  const historialPorFecha = reservasHistorial.reduce((acc, r) => {
    if (!acc[r.fecha]) acc[r.fecha] = [];
    acc[r.fecha].push(r);
    return acc;
  }, {});
  const fechasHistorial = Object.keys(historialPorFecha).sort((a, b) => b.localeCompare(a));

  // ── Panel filtros ────────────────────────────────────────────────────────────
  const serviciosEnReservas = [...new Set(reservasMock.map(r => r.servicio).filter(Boolean))];
  const hayFiltros = busqueda !== "" || filtroPanel !== "todas" || filtroServicio !== "todos" || filtroPersonas !== "todos";
  const limpiarFiltros = () => { setBusqueda(""); setFiltroPanel("todas"); setFiltroServicio("todos"); setFiltroPersonas("todos"); };

  const reservasPanelV2 = reservasMock.filter(r => {
    if (!r.fecha || r.fecha < hoyStr) return false;
    if (filtroPanel !== "todas" && r.estado !== filtroPanel) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      if (!r.nombre?.toLowerCase().includes(q) && !r.telefono?.includes(busqueda)) return false;
    }
    if (filtroServicio !== "todos" && r.servicio !== filtroServicio) return false;
    if (filtroPersonas !== "todos") {
      const p = Number(r.personas) || 0;
      if (filtroPersonas === "1-2" && !(p >= 1 && p <= 2)) return false;
      if (filtroPersonas === "3-5" && !(p >= 3 && p <= 5)) return false;
      if (filtroPersonas === "6+" && p < 6) return false;
    }
    return true;
  });

  const countHoy = reservasPanelV2.filter(r => r.fecha === hoyStr).length;
  const countManana = reservasPanelV2.filter(r => r.fecha === mananaStr).length;
  const countProximos = reservasPanelV2.filter(r => r.fecha >= pasadoMananaStr).length;

  const reservasPorTab = reservasPanelV2.filter(r => {
    if (tabFecha === "hoy") return r.fecha === hoyStr;
    if (tabFecha === "manana") return r.fecha === mananaStr;
    return r.fecha >= pasadoMananaStr;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalPaginasPanel = Math.ceil(reservasPorTab.length / POR_PAGINA);
  const reservasPaginadas = reservasPorTab.slice((paginaPanel - 1) * POR_PAGINA, paginaPanel * POR_PAGINA);
  const fechasProximas = tabFecha === "proximos"
    ? [...new Set(reservasPaginadas.map(r => r.fecha))].sort()
    : [];

  const fechaLarga = (str) => {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  };

  // ── Acciones ─────────────────────────────────────────────────────────────────
  const cambiarEstado = async (id, estado) => {
    setReservasMock((prev) => prev.map((r) => r.id === id ? { ...r, estado } : r));
    try {
      await accionReserva(id, estado === "confirmada" ? "confirmar" : "cancelar", pin, SLUG);
    } catch {
      fetchReservas(SLUG).then((data) => setReservasMock(data.map((r) => ({ ...r, fecha: r.dia }))));
    }
  };

  const eliminarReserva = async (id) => {
    setReservasMock((prev) => prev.filter((r) => r.id !== id));
    setConfirmarEliminar(null);
    try {
      await accionReserva(id, "eliminar", pin, SLUG);
    } catch {
      fetchReservas(SLUG).then((data) => setReservasMock(data.map((r) => ({ ...r, fecha: r.dia }))));
    }
  };

  // ── Card consulta ────────────────────────────────────────────────────────────
  const renderConsultaCard = (r) => (
    <div key={r.id} className={`panel-v2-card panel-v2-card--${r.estado}`}>
      <div className="panel-v2-card-top">
        <span className={`panel-badge panel-badge--${r.estado}`}>
          {r.estado === "pendiente" ? "Pendiente" : r.estado === "confirmada" ? "Confirmada" : "Cancelada"}
        </span>
      </div>
      <div className="panel-v2-card-mid">
        <span className="pv2-nombre">{r.nombre}</span>
        {r.servicio && <span className="panel-v2-card-meta">{r.servicio}</span>}
      </div>
      {r.mensaje && <p className="panel-v2-consulta-msg">{r.mensaje}</p>}
      <div className="panel-card-tel">
        <a href={`tel:${r.telefono}`} className="panel-v2-tel">{r.telefono}</a>
        <a href={`https://wa.me/${(r.telefono || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
          <img src={iconWa} alt="WA" className="panel-wa-icon" />
        </a>
      </div>
      <div className="panel-card-actions">
        {r.estado === "pendiente" ? (<>
          <button type="button" className="panel-btn-confirmar" onClick={() => cambiarEstado(r.id, "confirmada")}>Confirmar</button>
          <button type="button" className="panel-btn-cancelar" onClick={() => cambiarEstado(r.id, "cancelada")}>Cancelar</button>
        </>) : (<>
          <button type="button" className="panel-v2-btn-detalle" onClick={() => setModalDetalle(r)}>Ver detalles</button>
          <button type="button" className="panel-btn-eliminar" onClick={() => setConfirmarEliminar(r)}>Eliminar</button>
        </>)}
      </div>
    </div>
  );

  // ── Card reutilizable ────────────────────────────────────────────────────────
  const renderCard = (r) => (
    <div key={r.id} className={`panel-v2-card panel-v2-card--${r.estado}`}>
      <div className="panel-v2-card-top">
        <span className={`panel-badge panel-badge--${r.estado}`}>
          {r.estado === "pendiente" ? "Pendiente" : r.estado === "confirmada" ? "Confirmada" : "Cancelada"}
        </span>
        <span className="pv2-hora">{r.hora}</span>
      </div>
      <div className="panel-v2-card-mid">
        <span className="pv2-nombre">{r.nombre}</span>
        <span className="panel-v2-card-meta">
          <Users size={11} className="pv2-icon" />{r.personas}{r.servicio ? ` · ${r.servicio}` : ""}
        </span>
      </div>
      <div className="panel-card-tel">
        <a href={`tel:${r.telefono}`} className="panel-v2-tel">{r.telefono}</a>
        <a href={`https://wa.me/${(r.telefono || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
          <img src={iconWa} alt="WA" className="panel-wa-icon" />
        </a>
      </div>
      <div className="panel-card-actions">
        {r.estado === "pendiente" ? (<>
          <button type="button" className="panel-btn-confirmar" onClick={() => cambiarEstado(r.id, "confirmada")}>Confirmar</button>
          <button type="button" className="panel-btn-cancelar" onClick={() => cambiarEstado(r.id, "cancelada")}>Cancelar</button>
        </>) : (<>
          <button type="button" className="panel-v2-btn-detalle" onClick={() => setModalDetalle(r)}>Ver detalles</button>
          <button type="button" className="panel-btn-eliminar" onClick={() => setConfirmarEliminar(r)}>Eliminar</button>
        </>)}
      </div>
    </div>
  );

  return (
    <>
      {menuOpen && createPortal(
        <>
          <div className="res-menu-overlay" onClick={closeMenu} />
          <div className="res-menu-portal"
            style={{ ...panelVars, top: menuPos.top, left: menuPos.left }}>
            <MenuContent draft={draft} temaPanel={temaPanel} aplicarTemaPanel={aplicarTemaPanel} onCuenta={onBack} onBack={onBack} />
          </div>
        </>,
        document.body
      )}

      <section className="res-section" style={panelVars}>
        <form className="res-form">

          {/* ── Header ── */}
          <div className="res-header">
            <div className="res-avatar-wrap">
              <button ref={avatarBtnRef} type="button" className="res-avatar-btn" onClick={openMenu}>
                {draft.logoUrl
                  ? <img src={draft.logoUrl} alt="" className="res-avatar-img" />
                  : <User size={15} />
                }
              </button>
            </div>
            <div className="res-header-right">
              <h2 className="res-title">Panel de reservas</h2>
              <div className="panel-v2-live">
                <span className="panel-v2-live-dot" />
                <span>En vivo</span>
                {ultimaActualizacion && (
                  <span className="panel-v2-update">· {ultimaActualizacion.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</span>
                )}
                <span className="panel-v2-fecha-header">{hoyFormateado}</span>
              </div>
            </div>


          </div>

          {/* ── Pendientes ── */}
          {pendientes.length > 0 && (
            <div className="notif-nueva">
              <div className="notif-nueva-header">
                <span className="notif-nueva-titulo">🔔 {pendientes.length === 1 ? "1 reserva pendiente" : `${pendientes.length} reservas pendientes`}</span>
              </div>
              {pendientes.map(r => (
                <div key={r.id} className="notif-nueva-card">
                  <div className="notif-nueva-fila">
                    <span className="pv2-nombre">{r.nombre}</span>
                    <span className="pv2-hora">{r.hora}</span>
                  </div>
                  <div className="notif-nueva-fila">
                    <span className="panel-v2-card-meta"><Users size={11} className="pv2-icon" />{r.personas}{r.servicio ? ` · ${r.servicio}` : ""}</span>
                    <span className="panel-v2-card-meta">📅 {r.fecha?.split("-").reverse().join("/")}</span>
                  </div>
                  <div className="panel-card-tel">
                    <a href={`tel:${r.telefono}`} className="panel-v2-tel">{r.telefono}</a>
                    <a href={`https://wa.me/${(r.telefono || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <img src={iconWa} alt="WA" className="panel-wa-icon" />
                    </a>
                  </div>
                  <div className="panel-card-actions">
                    <button type="button" className="panel-btn-confirmar" onClick={() => cambiarEstado(r.id, "confirmada")}>Confirmar</button>
                    <button type="button" className="panel-btn-cancelar" onClick={() => cambiarEstado(r.id, "cancelada")}>Cancelar</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="res-tabs">
            {Object.entries(TABS).map(([key, label]) => {
              const badge = key === "panel" ? pendientesReservas : key === "consultas" ? pendientesConsultas : 0;
              return (
                <button key={key} type="button"
                  className={`res-tab ${tab === key ? "res-tab--active" : ""}`}
                  onClick={() => setTab(key)}>
                  {label}
                  {badge > 0 && <span className="res-tab-badge">{badge}</span>}
                </button>
              );
            })}
          </div>

          <div className="cfg-card-desktop cfg-card-mobile">



            {/* ── TAB: PANEL ── */}
            {tab === "panel" && (
              <div className="panel-v2">
                <div className="panel-v2-toolbar">
                  <div className="panel-v2-search-wrap">
                    <Search size={14} className="panel-v2-search-icon" />
                    <input type="text" className="panel-v2-search" placeholder="Buscar por nombre o teléfono..."
                      value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPaginaPanel(1); }} />
                  </div>
                  <div className="panel-v2-filters-row">
                    <select className="panel-v2-select" value={filtroPanel} onChange={(e) => { setFiltroPanel(e.target.value); setPaginaPanel(1); }}>
                      <option value="todas">Estado: Todos</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                    <select className="panel-v2-select" value={filtroServicio} onChange={(e) => { setFiltroServicio(e.target.value); setPaginaPanel(1); }}>
                      <option value="todos">Servicio: Todos</option>
                      {serviciosEnReservas.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className="panel-v2-select" value={filtroPersonas} onChange={(e) => { setFiltroPersonas(e.target.value); setPaginaPanel(1); }}>
                      <option value="todos">Personas: Todas</option>
                      <option value="1-2">1 – 2</option>
                      <option value="3-5">3 – 5</option>
                      <option value="6+">6 +</option>
                    </select>
                    {hayFiltros && (
                      <button type="button" className="panel-v2-clear" onClick={() => { limpiarFiltros(); setPaginaPanel(1); }}>
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>

                <div className="panel-v2-tabs-fecha">
                  {[
                    { key: "hoy", label: "Hoy", count: countHoy },
                    { key: "manana", label: "Mañana", count: countManana },
                    { key: "proximos", label: "Próximos días", count: countProximos },
                  ].map(({ key, label, count }) => (
                    <button key={key} type="button"
                      className={`panel-v2-tab-fecha ${tabFecha === key ? "panel-v2-tab-fecha--active" : ""}`}
                      onClick={() => { setTabFecha(key); setPaginaPanel(1); }}>
                      {label}
                      {count > 0 && <span className="panel-v2-tab-badge">{count}</span>}
                    </button>
                  ))}
                </div>

                {reservasPorTab.length === 0 ? (
                  <p className="res-hint res-hint--center">
                    {hayFiltros ? "No hay reservas con esos filtros." : "Sin reservas para este período."}
                  </p>
                ) : (<>
                  {tabFecha === "proximos" ? (
                    <div className="panel-v2-grupos">
                      {fechasProximas.map(fecha => {
                        const rf = reservasPaginadas.filter(r => r.fecha === fecha);
                        return (
                          <div key={fecha} className="panel-v2-grupo">
                            <div className="panel-v2-grupo-header">
                              <span className="panel-v2-grupo-label">📅 {fechaLarga(fecha)}</span>
                              <span className="panel-v2-grupo-badge">{rf.length} reserva{rf.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="panel-v2-lista">{rf.map(renderCard)}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="panel-v2-lista">{reservasPaginadas.map(renderCard)}</div>
                  )}

                  {totalPaginasPanel > 1 && (
                    <div className="panel-v2-pagination">
                      <button type="button" className="pv2-page-btn" disabled={paginaPanel === 1}
                        onClick={() => setPaginaPanel(p => p - 1)}>‹</button>
                      {Array.from({ length: totalPaginasPanel }, (_, i) => i + 1).map(n => (
                        <button key={n} type="button"
                          className={`pv2-page-btn ${paginaPanel === n ? "pv2-page-btn--active" : ""}`}
                          onClick={() => setPaginaPanel(n)}>{n}</button>
                      ))}
                      <button type="button" className="pv2-page-btn" disabled={paginaPanel === totalPaginasPanel}
                        onClick={() => setPaginaPanel(p => p + 1)}>›</button>
                    </div>
                  )}
                </>)}
              </div>
            )}

            {/* ── TAB: CONSULTAS ── */}
            {tab === "consultas" && (
              <div className="panel-v2">
                {consultas.length === 0 ? (
                  <p className="res-hint res-hint--center">Sin consultas.</p>
                ) : (
                  <div className="panel-v2-lista">{consultas.map(renderConsultaCard)}</div>
                )}
              </div>
            )}

            {/* ── TAB: HISTORIAL ── */}
            {tab === "historial" && (
              <div className="panel-reservas">
                <p className="panel-seccion-titulo">Hoy · {hoyFormateado}</p>
                {reservasHoy.length === 0 ? (
                  <p className="res-hint res-hint--center">Sin reservas hoy.</p>
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
                  <p className="res-hint res-hint--center">Sin historial de días anteriores.</p>
                )}
              </div>

            )}
          </div>
        </form>

        {/* Modal detalle */}
        {modalDetalle && (
          <div className="res-modal-overlay" onClick={() => setModalDetalle(null)}>
            <div className="res-modal" onClick={(e) => e.stopPropagation()}>
              <div className="res-modal-header">
                <span className="res-modal-title">{modalDetalle.nombre}</span>
                <button type="button" className="res-modal-close" onClick={() => setModalDetalle(null)}>✕</button>
              </div>
              <div className="res-modal-body">
                <span className={`panel-badge panel-badge--${modalDetalle.estado}`} style={{ alignSelf: "flex-start" }}>
                  {modalDetalle.estado === "pendiente" ? "Pendiente" : modalDetalle.estado === "confirmada" ? "Confirmada" : "Cancelada"}
                </span>
                {[
                  ["Fecha", modalDetalle.fecha?.split("-").reverse().join("/")],
                  ["Hora", modalDetalle.hora],
                  ["Personas", modalDetalle.personas],
                  ["Servicio", modalDetalle.servicio],
                  ["Teléfono", modalDetalle.telefono],
                  ["Email", modalDetalle.email],
                  ["Mensaje", modalDetalle.mensaje],
                ].filter(([, v]) => v).map(([label, valor]) => (
                  <div key={label} className="panel-v2-detalle-row">
                    <span className="panel-v2-detalle-label">{label}</span>
                    <span className="panel-v2-detalle-valor">{valor}</span>
                  </div>
                ))}
                {(() => {
                  const extras = modalDetalle.extras;
                  const preguntas = draft.preguntasExtra;
                  if (!extras || !preguntas?.length) return null;
                  return preguntas
                    .filter(p => p.guardado && extras[p.id] != null && extras[p.id] !== "")
                    .map(p => (
                      <div key={p.id} className="panel-v2-detalle-row">
                        <span className="panel-v2-detalle-label">{p.label}</span>
                        <span className="panel-v2-detalle-valor">{extras[p.id]}</span>
                      </div>
                    ));
                })()}
                <a href={`https://wa.me/${(modalDetalle.telefono || "").replace(/\D/g, "")}`}
                  target="_blank" rel="noopener noreferrer" className="panel-btn-confirmar res-modal-wa">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Modal confirmar eliminar */}
        {confirmarEliminar && (
          <div className="res-modal-overlay" onClick={() => setConfirmarEliminar(null)}>
            <div className="res-modal" onClick={(e) => e.stopPropagation()}>
              <div className="res-modal-header">
                <span className="res-modal-title">Eliminar reserva</span>
                <button type="button" className="res-modal-close" onClick={() => setConfirmarEliminar(null)}>✕</button>
              </div>
              <div className="res-modal-body">
                <p className="res-modal-text">
                  ¿Estás seguro de que quieres eliminar la reserva de <strong>{confirmarEliminar.nombre}</strong>? Esta acción no se puede deshacer.
                </p>
                <div className="res-modal-actions">
                  <button type="button" className="panel-btn-eliminar"
                    onClick={() => eliminarReserva(confirmarEliminar.id)}>
                    Sí, eliminar
                  </button>
                  <button type="button" className="panel-v2-btn-detalle"
                    onClick={() => setConfirmarEliminar(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {modalMensaje && (
          <div className="res-modal-overlay" onClick={() => setModalMensaje(null)}>
            <div className="res-modal" onClick={(e) => e.stopPropagation()}>
              <div className="res-modal-header">
                <span className="res-modal-title">Mensaje del cliente</span>
                <button type="button" className="res-modal-close" onClick={() => setModalMensaje(null)}>✕</button>
              </div>
              <div className="res-modal-body">
                <p className="res-modal-text">💬 {modalMensaje}</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
