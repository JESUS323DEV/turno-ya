import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, Users, User, Settings, FlaskConical, ScrollText, ArrowLeft, Bell, CalendarDays, Mail, Eye, Trash2, Check, X, Clock, Phone, MoreVertical, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
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

export default function ReservasPanel({ pin, onBack, onCuenta, draft = {} }) {
  const [tab, setTab] = useState("panel");
  const [reservasMock, setReservasMock] = useState([]);
  const [filtroPanel, setFiltroPanel] = useState("todas");
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroServicio, setFiltroServicio] = useState("todos");
  const [filtroPersonas, setFiltroPersonas] = useState("todos");
  const [busquedaConsultas, setBusquedaConsultas] = useState("");
  const [filtroEstadoConsultas, setFiltroEstadoConsultas] = useState("todas");
  const [filtroServicioConsultas, setFiltroServicioConsultas] = useState("todos");
  const [tabConsultas, setTabConsultas] = useState("sin-fecha");
  const [modalDetalle, setModalDetalle] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [paginaPanel, setPaginaPanel] = useState(1);
  const [tabFecha, setTabFecha] = useState("hoy");
  const [tabHistorial, setTabHistorial] = useState("reservas");
  const [filtroHistorialReservas, setFiltroHistorialReservas] = useState("todas");
  const [filtroHistorialConsultas, setFiltroHistorialConsultas] = useState("todas");
  const [temaPanel, setTemaPanel] = useState(() => localStorage.getItem("reservaq-tema-panel") || "claro");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [menuCardId, setMenuCardId] = useState(null);
  const [expandedMsgId, setExpandedMsgId] = useState(null);
  const [filtrosPanelOpen, setFiltrosPanelOpen] = useState(false);
  const [filtrosConsultasOpen, setFiltrosConsultasOpen] = useState(false);
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
      fetchReservas(SLUG, pin).then((data) => {
        setReservasMock(data.map((r) => ({ ...r, fecha: r.dia })));
        setUltimaActualizacion(new Date());
      });
    };
    cargar();
    const id = setInterval(cargar, 30000);
    return () => clearInterval(id);
  }, [pin]);

  // ── Historial ────────────────────────────────────────────────────────────────
  const esConsulta = (r) => (r.perfil ?? "") === "consulta";
  const minutosParaHistorial = draft.minutosParaHistorial ?? 120;
  const estaEnHistorial = (r) => {
    if (r.estado === "eliminada") return true;
    if (r.estado === "pendiente") return false;
    const umbralMs = minutosParaHistorial * 60 * 1000;
    const ahoraMs = ultimaActualizacion ? ultimaActualizacion.getTime() : 0;
    if (!esConsulta(r)) {
      if (!r.fecha || !r.hora) return false;
      return (ahoraMs - new Date(`${r.fecha}T${r.hora}`).getTime()) >= umbralMs;
    }
    if (r.fecha && r.fecha !== "") {
      const hora = r.hora || "00:00";
      return (ahoraMs - new Date(`${r.fecha}T${hora}`).getTime()) >= umbralMs;
    }
    if (!r.created_at) return false;
    return (ahoraMs - new Date(r.created_at).getTime()) >= umbralMs;
  };
  const reservasHistorial = reservasMock.filter(r => !esConsulta(r) && estaEnHistorial(r));
  const consultasHistorial = reservasMock.filter(r => esConsulta(r) && estaEnHistorial(r)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const consultas = reservasMock.filter(r => esConsulta(r) && !estaEnHistorial(r));
  const pendientes = reservasMock.filter(r => !esConsulta(r) && r.fecha && r.estado === "pendiente").sort((a, b) => a.fecha.localeCompare(b.fecha));
  const pendientesReservas = pendientes.length;
  const pendientesConsultasList = consultas.filter(r => r.estado === "pendiente");
  const pendientesConsultas = pendientesConsultasList.length;
  const serviciosEnConsultas = [...new Set(consultas.map(r => r.servicio).filter(Boolean))];
  const consultasFiltradas = consultas.filter(r => {
    if (filtroEstadoConsultas !== "todas" && r.estado !== filtroEstadoConsultas) return false;
    if (filtroServicioConsultas !== "todos" && r.servicio !== filtroServicioConsultas) return false;
    if (busquedaConsultas) {
      const q = busquedaConsultas.toLowerCase();
      if (!r.nombre?.toLowerCase().includes(q) && !r.telefono?.includes(busquedaConsultas)) return false;
    }
    return true;
  });
  const consultasSinFecha = consultasFiltradas.filter(r => !r.fecha || r.fecha === "");
  const consultasConFecha = consultasFiltradas.filter(r => r.fecha && r.fecha !== "");
  const countConsultasHoy = consultasConFecha.filter(r => r.fecha === hoyStr).length;
  const countConsultasManana = consultasConFecha.filter(r => r.fecha === mananaStr).length;
  const countConsultasProximos = consultasConFecha.filter(r => r.fecha >= pasadoMananaStr).length;
  const hayFiltrosConsultas = busquedaConsultas !== "" || filtroEstadoConsultas !== "todas" || filtroServicioConsultas !== "todos";
  const limpiarFiltrosConsultas = () => { setBusquedaConsultas(""); setFiltroEstadoConsultas("todas"); setFiltroServicioConsultas("todos"); };
  const reservasHistorialFiltradas = reservasHistorial.filter(r =>
    filtroHistorialReservas === "todas" || r.estado === filtroHistorialReservas
  );
  const consultasHistorialFiltradas = consultasHistorial.filter(r =>
    filtroHistorialConsultas === "todas" || r.estado === filtroHistorialConsultas
  );
  const historialPorFechaFiltrado = reservasHistorialFiltradas.reduce((acc, r) => {
    if (!acc[r.fecha]) acc[r.fecha] = [];
    acc[r.fecha].push(r);
    return acc;
  }, {});
  const fechasHistorialFiltradas = Object.keys(historialPorFechaFiltrado).sort((a, b) => b.localeCompare(a));

  // ── Panel filtros ────────────────────────────────────────────────────────────
  const serviciosEnReservas = [...new Set(reservasMock.filter(r => !esConsulta(r)).map(r => r.servicio).filter(Boolean))];
  const hayFiltros = busqueda !== "" || filtroPanel !== "todas" || filtroServicio !== "todos" || filtroPersonas !== "todos";
  const limpiarFiltros = () => { setBusqueda(""); setFiltroPanel("todas"); setFiltroServicio("todos"); setFiltroPersonas("todos"); };

  const reservasPanelV2 = reservasMock.filter(r => {
    if (esConsulta(r) || estaEnHistorial(r)) return false;
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
      fetchReservas(SLUG, pin).then((data) => setReservasMock(data.map((r) => ({ ...r, fecha: r.dia }))));
    }
  };

  const eliminarReserva = async (id) => {
    setReservasMock((prev) => prev.map((r) => r.id === id ? { ...r, estado: "eliminada" } : r));
    setConfirmarEliminar(null);
    try {
      await accionReserva(id, "eliminar", pin, SLUG);
    } catch {
      fetchReservas(SLUG, pin).then((data) => setReservasMock(data.map((r) => ({ ...r, fecha: r.dia }))));
    }
  };

  const formatTel = (tel) => {
    if (!tel) return tel;
    const cleaned = String(tel).replace(/\s/g, "");
    if (cleaned.startsWith("+")) {
      const prefix = cleaned.slice(0, 3);
      const rest = cleaned.slice(3).replace(/(\d{3})(?=\d)/g, "$1 ");
      return `${prefix} ${rest}`;
    }
    return cleaned.replace(/(\d{3})(?=\d)/g, "$1 ");
  };

  const renderPendienteCard = (r) => {
    const extrasRellenos = (() => {
      const extras = r.extras;
      const preguntas = draft.preguntasExtra;
      if (!extras || !preguntas?.length) return [];
      return preguntas.filter(p => p.guardado && extras[p.id] != null && extras[p.id] !== "");
    })();
    return (
      <div key={r.id} className="notif-nueva-card">
        <span className="pv2-nombre">{r.nombre}</span>
        {r.telefono && (
          <div className="panel-card-tel">
            <a href={`tel:${r.telefono}`} className="panel-v2-tel">{formatTel(r.telefono)}</a>
            <a href={`https://wa.me/${(r.telefono || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
              <img src={iconWa} alt="WA" className="panel-wa-icon" />
            </a>
          </div>
        )}
        {r.email && <span className="panel-v2-card-meta"><Mail size={11} className="pv2-icon" />{r.email}</span>}
        {(r.fecha || r.hora || (!esConsulta(r) && Number(r.personas) > 0) || r.servicio) && (
          <div className="notif-nueva-fila">
            {r.fecha && <span className="panel-v2-card-meta"><CalendarDays size={11} className="pv2-icon" />{r.fecha.split("-").reverse().join("/")}</span>}
            {r.hora && <span className="panel-v2-card-meta"><Clock size={11} className="pv2-icon" />{r.hora}</span>}
            {!esConsulta(r) && Number(r.personas) > 0 && <span className="panel-v2-card-meta"><Users size={11} className="pv2-icon" />{r.personas}p</span>}
            {r.servicio && <span className="panel-v2-card-meta">{r.servicio}</span>}
          </div>
        )}
        {(r.mensaje || extrasRellenos.length > 0) && (
          <div className="notif-msg-scroll">
            {r.mensaje && <p className="panel-v2-consulta-msg">{r.mensaje}</p>}
            {extrasRellenos.map(p => (
              <p key={p.id} className="panel-v2-consulta-msg"><strong>{p.label}:</strong> {r.extras[p.id]}</p>
            ))}
          </div>
        )}
        <div className="panel-card-actions">
          <button type="button" className="panel-btn-confirmar" onClick={() => cambiarEstado(r.id, "confirmada")}><Check size={13} />Confirmar</button>
          <button type="button" className="panel-btn-cancelar" onClick={() => cambiarEstado(r.id, "cancelada")}><X size={13} />Cancelar</button>
        </div>
      </div>
    );
  };

  // ── Card consulta ────────────────────────────────────────────────────────────
  const renderConsultaCard = (r, readOnly = false) => {
    const tieneStats = r.fecha || r.hora;
    return (
      <div key={r.id} className={`panel-v2-card panel-v2-card--${r.estado}`}>
        <div className="pv2c-header">
          <span className={`panel-badge panel-badge--${r.estado}`}>
            {r.estado === "confirmada" ? <Check size={10} /> : r.estado === "cancelada" ? <X size={10} /> : r.estado === "eliminada" ? <Trash2 size={10} /> : <Clock size={10} />}
            {r.estado === "pendiente" ? "Pendiente" : r.estado === "confirmada" ? "Confirmada" : r.estado === "eliminada" ? "Eliminada" : "Cancelada"}
          </span>
          <div className="pv2c-menu-wrap">
            <button type="button" className="pv2c-menu-btn" onClick={() => setMenuCardId(menuCardId === r.id ? null : r.id)}>
              <MoreVertical size={16} />
            </button>
            {menuCardId === r.id && (
              <>
                <div className="pv2c-dropdown-overlay" onClick={() => setMenuCardId(null)} />
                <div className="pv2c-dropdown">
                  <button type="button" className="pv2c-dropdown-item" onClick={() => { setModalDetalle(r); setMenuCardId(null); }}><Eye size={13} />Ver detalles</button>
                  {!readOnly && r.estado !== "eliminada" && (
                    <button type="button" className="pv2c-dropdown-item pv2c-dropdown-item--danger" onClick={() => { setConfirmarEliminar(r); setMenuCardId(null); }}><Trash2 size={13} />Eliminar</button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <span className="pv2c-nombre">{r.nombre}</span>
        <div className="pv2c-body">
          <div className="pv2c-contact">
            <a href={`tel:${r.telefono}`} className="panel-v2-tel pv2c-tel">{formatTel(r.telefono)}</a>
            <div className="pv2c-contact-icons">
              <a href={`tel:${r.telefono}`} className="pv2c-icon-btn"><Phone size={15} /></a>
              <a href={`https://wa.me/${(r.telefono || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="pv2c-icon-btn">
                <img src={iconWa} alt="WA" className="panel-wa-icon" />
              </a>
              {r.email && <a href={`mailto:${r.email}`} className="pv2c-icon-btn"><Mail size={15} /></a>}
            </div>
          </div>
          {tieneStats && (<>
            <div className="pv2c-vsep" />
            <div className="pv2c-stats">
              {r.fecha && (
                <div className="pv2c-stat">
                  <CalendarDays size={16} />
                  <span className="pv2c-stat-val">{r.fecha.split("-").slice(1).reverse().join("/")}</span>
                  <span className="pv2c-stat-label">Fecha</span>
                </div>
              )}
              {r.fecha && r.hora && <div className="pv2c-stat-sep" />}
              {r.hora && (
                <div className="pv2c-stat">
                  <Clock size={16} />
                  <span className="pv2c-stat-val">{r.hora}</span>
                  <span className="pv2c-stat-label">Hora</span>
                </div>
              )}
            </div>
          </>)}
        </div>
        {r.estado === "pendiente" && !readOnly ? (
          <>
            {r.mensaje && (
              <div className="pv2c-msg">
                <div className="pv2c-msg-header"><MessageSquare size={12} />Mensaje</div>
                <p className="pv2c-msg-text">{r.mensaje}</p>
              </div>
            )}
            <hr className="pv2c-divider" />
            <div className="panel-card-actions">
              <button type="button" className="panel-btn-confirmar" onClick={() => cambiarEstado(r.id, "confirmada")}><Check size={13} />Confirmar</button>
              <button type="button" className="panel-btn-cancelar" onClick={() => cambiarEstado(r.id, "cancelada")}><X size={13} />Cancelar</button>
            </div>
          </>
        ) : r.mensaje ? (
          <>
            <hr className="pv2c-divider" />
            <div className="pv2c-msg-expand">
              <p className={`pv2c-msg-expand-text${expandedMsgId === r.id ? " pv2c-msg-expand-text--open" : ""}`}>{r.mensaje}</p>
              <button type="button" className="pv2c-msg-more" onClick={() => setExpandedMsgId(expandedMsgId === r.id ? null : r.id)}>
                {expandedMsgId === r.id ? "Leer menos" : "Leer más"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    );
  };

  // ── Card reutilizable ────────────────────────────────────────────────────────
  const renderCard = (r, readOnly = false) => (
    <div key={r.id} className={`panel-v2-card panel-v2-card--${r.estado}`}>
      <div className="pv2c-header">
        <span className={`panel-badge panel-badge--${r.estado}`}>
          {r.estado === "confirmada" ? <Check size={10} /> : r.estado === "cancelada" ? <X size={10} /> : r.estado === "eliminada" ? <Trash2 size={10} /> : <Clock size={10} />}
          {r.estado === "pendiente" ? "Pendiente" : r.estado === "confirmada" ? "Confirmada" : r.estado === "eliminada" ? "Eliminada" : "Cancelada"}
        </span>
        <div className="pv2c-menu-wrap">
          <button type="button" className="pv2c-menu-btn" onClick={() => setMenuCardId(menuCardId === r.id ? null : r.id)}>
            <MoreVertical size={16} />
          </button>
          {menuCardId === r.id && (
            <>
              <div className="pv2c-dropdown-overlay" onClick={() => setMenuCardId(null)} />
              <div className="pv2c-dropdown">
                <button type="button" className="pv2c-dropdown-item" onClick={() => { setModalDetalle(r); setMenuCardId(null); }}><Eye size={13} />Ver detalles</button>
                {!readOnly && r.estado !== "eliminada" && (
                  <button type="button" className="pv2c-dropdown-item pv2c-dropdown-item--danger" onClick={() => { setConfirmarEliminar(r); setMenuCardId(null); }}><Trash2 size={13} />Eliminar</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <span className="pv2c-nombre">{r.nombre}</span>
      <div className="pv2c-body">
        <div className="pv2c-contact">
          <a href={`tel:${r.telefono}`} className="panel-v2-tel pv2c-tel">{formatTel(r.telefono)}</a>
          <div className="pv2c-contact-icons">
            <a href={`tel:${r.telefono}`} className="pv2c-icon-btn"><Phone size={15} /></a>
            <a href={`https://wa.me/${(r.telefono || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="pv2c-icon-btn">
              <img src={iconWa} alt="WA" className="panel-wa-icon" />
            </a>
            {r.email && <a href={`mailto:${r.email}`} className="pv2c-icon-btn"><Mail size={15} /></a>}
          </div>
        </div>
        <div className="pv2c-vsep" />
        <div className="pv2c-stats">
          {r.fecha && (<div className="pv2c-stat"><CalendarDays size={16} /><span className="pv2c-stat-val">{r.fecha.split("-").slice(1).reverse().join("/")}</span><span className="pv2c-stat-label">Fecha</span></div>)}
          {r.fecha && r.hora && <div className="pv2c-stat-sep" />}
          {r.hora && (<div className="pv2c-stat"><Clock size={16} /><span className="pv2c-stat-val">{r.hora}</span><span className="pv2c-stat-label">Hora</span></div>)}
          {(r.fecha || r.hora) && r.personas && <div className="pv2c-stat-sep" />}
          {r.personas && (<div className="pv2c-stat"><User size={16} /><span className="pv2c-stat-val">{r.personas}</span><span className="pv2c-stat-label">Pers.</span></div>)}
        </div>
      </div>
      {r.estado === "pendiente" && !readOnly ? (
        <>
          {r.mensaje && (
            <div className="pv2c-msg">
              <div className="pv2c-msg-header"><MessageSquare size={12} />Mensaje</div>
              <p className="pv2c-msg-text">{r.mensaje}</p>
            </div>
          )}
          <hr className="pv2c-divider" />
          <div className="panel-card-actions">
            <button type="button" className="panel-btn-confirmar" onClick={() => cambiarEstado(r.id, "confirmada")}><Check size={13} />Confirmar</button>
            <button type="button" className="panel-btn-cancelar" onClick={() => cambiarEstado(r.id, "cancelada")}><X size={13} />Cancelar</button>
          </div>
        </>
      ) : r.mensaje ? (
        <>
          <hr className="pv2c-divider" />
          <div className="pv2c-msg-expand">
            <p className={`pv2c-msg-expand-text${expandedMsgId === r.id ? " pv2c-msg-expand-text--open" : ""}`}>{r.mensaje}</p>
            <button type="button" className="pv2c-msg-more" onClick={() => setExpandedMsgId(expandedMsgId === r.id ? null : r.id)}>
              {expandedMsgId === r.id ? "Leer menos" : "Leer más"}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );

  return (
    <>
      {menuOpen && createPortal(
        <>
          <div className="res-menu-overlay" onClick={closeMenu} />
          <div className="res-menu-portal"
            style={{ ...panelVars, top: menuPos.top, left: menuPos.left }}>
            <MenuContent draft={draft} temaPanel={temaPanel} aplicarTemaPanel={aplicarTemaPanel} onCuenta={onCuenta ?? onBack} onBack={onBack} />
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
          {pendientes.map(r => (
            <div key={r.id} className="notif-nueva">
              <div className="notif-nueva-header">
                <span className="notif-nueva-titulo"><Bell size={13} /> 1 reserva pendiente</span>
              </div>
              {renderPendienteCard(r)}
            </div>
          ))}

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
                  <button type="button" className="panel-v2-filtros-toggle" onClick={() => setFiltrosPanelOpen(o => !o)}>
                    Filtros {hayFiltros && <span className="panel-v2-filtros-dot" />}{filtrosPanelOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {filtrosPanelOpen && (
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
                  )}
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
                              <span className="panel-v2-grupo-label"><CalendarDays size={13} />{fechaLarga(fecha)}</span>
                              <span className="panel-v2-grupo-badge">{rf.length} reserva{rf.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="panel-v2-lista">{rf.map(r => renderCard(r))}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <div className="panel-v2-grupo-header">
                        <span className="panel-v2-grupo-label"><CalendarDays size={13} />{fechaLarga(tabFecha === "hoy" ? hoyStr : mananaStr)}</span>
                        <span className="panel-v2-grupo-badge">{reservasPorTab.length} reserva{reservasPorTab.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="panel-v2-lista">{reservasPaginadas.map(r => renderCard(r))}</div>
                    </>
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
                {pendientesConsultasList.map(r => (
                  <div key={r.id} className="notif-nueva">
                    <div className="notif-nueva-header">
                      <span className="notif-nueva-titulo"><Bell size={13} /> 1 consulta pendiente</span>
                    </div>
                    {renderPendienteCard(r)}
                  </div>
                ))}
                <div className="panel-v2-toolbar">
                  <div className="panel-v2-search-wrap">
                    <Search size={14} className="panel-v2-search-icon" />
                    <input type="text" className="panel-v2-search" placeholder="Buscar por nombre o teléfono..."
                      value={busquedaConsultas} onChange={(e) => setBusquedaConsultas(e.target.value)} />
                  </div>
                  <button type="button" className="panel-v2-filtros-toggle" onClick={() => setFiltrosConsultasOpen(o => !o)}>
                    Filtros {hayFiltrosConsultas && <span className="panel-v2-filtros-dot" />}{filtrosConsultasOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {filtrosConsultasOpen && (
                    <div className="panel-v2-filters-row">
                      <select className="panel-v2-select" value={filtroEstadoConsultas} onChange={(e) => setFiltroEstadoConsultas(e.target.value)}>
                        <option value="todas">Estado: Todos</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                      <select className="panel-v2-select" value={filtroServicioConsultas} onChange={(e) => setFiltroServicioConsultas(e.target.value)}>
                        <option value="todos">Servicio: Todos</option>
                        {serviciosEnConsultas.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {hayFiltrosConsultas && (
                        <button type="button" className="panel-v2-clear" onClick={limpiarFiltrosConsultas}>
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="panel-v2-tabs-fecha">
                  {[
                    { key: "sin-fecha", label: "Consultas varias", count: consultasSinFecha.filter(r => r.estado === "pendiente").length },
                    { key: "hoy", label: "Hoy", count: countConsultasHoy },
                    { key: "manana", label: "Mañana", count: countConsultasManana },
                    { key: "proximos", label: "Próximos días", count: countConsultasProximos },
                  ].map(({ key, label, count }) => (
                    <button key={key} type="button"
                      className={`panel-v2-tab-fecha ${tabConsultas === key ? "panel-v2-tab-fecha--active" : ""}`}
                      onClick={() => setTabConsultas(key)}>
                      {label}
                      {count > 0 && <span className="panel-v2-tab-badge">{count}</span>}
                    </button>
                  ))}
                </div>
                {(() => {
                  let lista;
                  if (tabConsultas === "sin-fecha") lista = consultasSinFecha;
                  else if (tabConsultas === "hoy") lista = consultasConFecha.filter(r => r.fecha === hoyStr);
                  else if (tabConsultas === "manana") lista = consultasConFecha.filter(r => r.fecha === mananaStr);
                  else lista = consultasConFecha.filter(r => r.fecha >= pasadoMananaStr);

                  if (lista.length === 0) {
                    return <p className="res-hint res-hint--center">{hayFiltrosConsultas ? "No hay consultas con esos filtros." : "Sin consultas."}</p>;
                  }

                  if (tabConsultas === "proximos") {
                    const porFecha = lista.reduce((acc, r) => { if (!acc[r.fecha]) acc[r.fecha] = []; acc[r.fecha].push(r); return acc; }, {});
                    const fechas = Object.keys(porFecha).sort();
                    return (
                      <div className="panel-v2-grupos">
                        {fechas.map(fecha => (
                          <div key={fecha} className="panel-v2-grupo">
                            <div className="panel-v2-grupo-header">
                              <span className="panel-v2-grupo-label"><CalendarDays size={13} />{fechaLarga(fecha)}</span>
                              <span className="panel-v2-grupo-badge">{porFecha[fecha].length} consulta{porFecha[fecha].length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="panel-v2-lista">{porFecha[fecha].map(r => renderConsultaCard(r))}</div>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  const headerFecha = tabConsultas === "hoy" ? hoyStr : tabConsultas === "manana" ? mananaStr : hoyStr;
                  return (
                    <>
                      <div className="panel-v2-grupo-header">
                        <span className="panel-v2-grupo-label"><CalendarDays size={13} />{fechaLarga(headerFecha)}</span>
                        <span className="panel-v2-grupo-badge">{lista.length} consulta{lista.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="panel-v2-lista">{lista.map(r => renderConsultaCard(r))}</div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* ── TAB: HISTORIAL ── */}
            {tab === "historial" && (
              <div className="panel-v2">
                <div className="panel-v2-tabs-fecha">
                  <button type="button"
                    className={`panel-v2-tab-fecha ${tabHistorial === "reservas" ? "panel-v2-tab-fecha--active" : ""}`}
                    onClick={() => setTabHistorial("reservas")}>
                    Reservas
                    {reservasHistorial.length > 0 && <span className="panel-v2-tab-badge">{reservasHistorial.length}</span>}
                  </button>
                  <button type="button"
                    className={`panel-v2-tab-fecha ${tabHistorial === "consultas" ? "panel-v2-tab-fecha--active" : ""}`}
                    onClick={() => setTabHistorial("consultas")}>
                    Consultas
                    {consultasHistorial.length > 0 && <span className="panel-v2-tab-badge">{consultasHistorial.length}</span>}
                  </button>
                </div>

                {tabHistorial === "reservas" && (<>
                  <div className="panel-v2-filters-row">
                    <select className="panel-v2-select" value={filtroHistorialReservas}
                      onChange={(e) => setFiltroHistorialReservas(e.target.value)}>
                      <option value="todas">Estado: Todas</option>
                      <option value="confirmada">Confirmadas</option>
                      <option value="cancelada">Canceladas</option>
                      <option value="eliminada">Eliminadas</option>
                    </select>
                  </div>
                  {fechasHistorialFiltradas.length === 0 ? (
                    <p className="res-hint res-hint--center">Sin reservas en el historial.</p>
                  ) : (
                    <div className="panel-v2-grupos">
                      {fechasHistorialFiltradas.map(fecha => (
                        <div key={fecha} className="panel-v2-grupo">
                          <div className="panel-v2-grupo-header">
                            <span className="panel-v2-grupo-label">{fechaLarga(fecha)}</span>
                            <span className="panel-v2-grupo-badge">{historialPorFechaFiltrado[fecha].length} reserva{historialPorFechaFiltrado[fecha].length !== 1 ? "s" : ""}</span>
                          </div>
                          <div className="panel-v2-lista">{historialPorFechaFiltrado[fecha].map(r => renderCard(r, true))}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>)}

                {tabHistorial === "consultas" && (<>
                  <div className="panel-v2-filters-row">
                    <select className="panel-v2-select" value={filtroHistorialConsultas}
                      onChange={(e) => setFiltroHistorialConsultas(e.target.value)}>
                      <option value="todas">Estado: Todas</option>
                      <option value="confirmada">Confirmadas</option>
                      <option value="cancelada">Canceladas</option>
                      <option value="eliminada">Eliminadas</option>
                    </select>
                  </div>
                  {consultasHistorialFiltradas.length === 0 ? (
                    <p className="res-hint res-hint--center">Sin consultas en el historial.</p>
                  ) : (
                    <div className="panel-v2-lista">{consultasHistorialFiltradas.map(r => renderConsultaCard(r, true))}</div>
                  )}
                </>)}
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

      </section>
    </>
  );
}
