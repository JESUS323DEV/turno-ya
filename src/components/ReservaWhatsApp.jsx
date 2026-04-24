// ─── Imports ────────────────────────────────────────────────────────────────
import { useState } from "react";
import { PhoneCall, Globe, Calendar } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale/es";
import "react-day-picker/style.css";
import icon1 from "../assets/icon-whatsapp.png";
import { useReservaForm } from "../hooks/useReservaForm";
import { descargarIcs } from "../utils/ics";
import "../styles/reserva.css";

// ─── Icono Instagram (SVG inline — lucide-react no incluye iconos de marca) ──
function InstagramIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// ─── Helpers de fecha (evitan problemas de zona horaria con Date) ────────────
function strToDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function dateToStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function ReservaWhatsApp({ configOverride = null } = {}) {
  const {
    form,
    today,
    canSend,
    diaOk,
    nombreOk,
    telefonoOk,
    emailOk,
    horaOk,
    personasOk,
    slots,
    touched,
    handleChange,
    touch,
    limpiar,
    onSubmit,
    negocio,
    enviado,
    resetEnviado,
    maxDate,
    handleExtra,
    serviciosDisponibles,
    campos,
  } = useReservaForm(configOverride);

  const [calOpen, setCalOpen] = useState(false);

  // ─── Helper: icono de validación por campo ─────────────────────────────────
  const fieldIcon = (field, isOk) => {
    if (!touched[field]) return null;
    return isOk
      ? <span className="field-icon--ok">✓</span>
      : <span className="field-icon--bad">✗</span>;
  };

  // ─── Pantalla de confirmación ──────────────────────────────────────────────
  if (enviado) {
    return (
      <section className="reserva-section">
        <div className="confirmacion">
          <div className="confirmacion-icono">✅</div>
          <h2 className="confirmacion-titulo">¡Solicitud enviada!</h2>
          <p className="confirmacion-texto">
            Tu solicitud en <strong>{negocio.nombre}</strong> ha sido enviada.
            En breve recibirás confirmación.
          </p>
          {(campos.fechaHora || campos.personas) && (
            <div className="confirmacion-resumen">
              {campos.fechaHora && form.dia && <span>📅 {form.dia.split("-").reverse().join("-")}</span>}
              {campos.fechaHora && form.hora && <span>🕐 {form.hora}</span>}
              {campos.personas && <span>👥 {form.personas} {form.personas === 1 ? "persona" : "personas"}</span>}
            </div>
          )}
          {campos.fechaHora && (
            <button className="confirmacion-btn-ics" type="button" onClick={() => descargarIcs(form, negocio)}>
              📅 Añadir al calendario
            </button>
          )}
          <button className="confirmacion-btn-nueva" onClick={resetEnviado}>
            Nueva solicitud
          </button>
        </div>
      </section>
    );
  }

  const cerradoHoy = negocio.cierreTemporalFecha === today;

  // ─── Formulario principal ──────────────────────────────────────────────────
  return (
    <section className="reserva-section">
      <form className="reserva-form" onSubmit={onSubmit}>

        <div className="reserva-cabecera">

          {/* Cabecera: logo, nombre, descripción*/}
          <div className="cabecera">
            {negocio.logoUrl && (
              <img src={negocio.logoUrl} alt={negocio.nombre} className="reserva-logo" />
            )}

            <div className="reserva-tittle-negocio">
              <h1 style={{ color: negocio.colorNegocio }}>{negocio.nombre}</h1>
            </div>


            {negocio.descripcion && (
              <p className="reserva-descripcion">{negocio.descripcion}</p>
            )}

          </div>
          {/* Cabecera: links*/}
          {negocio.links?.some(l => l) && (
            <div className="reserva-links">
              {negocio.links.filter(l => l).map((url, i) => {
                const Icon = url.includes("instagram") ? InstagramIcon : Globe;
                const label = url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
                return (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="reserva-link-item">
                    <Icon size={15} />
                    <span>{label}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div>
          {/* Cabecera: título */}
          <h2 className="reserva-title">{negocio.tituloFormulario || "Reservas"}</h2>
        </div>



        {/* Aviso cierre temporal */}
        {cerradoHoy && (
          <div className="reserva-cerrado">
            🔴 Hoy no aceptamos reservas. Vuelve mañana o llámanos.
          </div>
        )}

        {/* Campos de datos personales */}
        {campos.nombre && (
          <label className="reserva-label">
            <span className="reserva-label-row">Nombre* {fieldIcon("nombre", nombreOk)}</span>
            <input
              className="reserva-input"
              type="text"
              name="nombre"
              value={form.nombre}
              placeholder="Nombre Completo"
              autoComplete="name"
              onChange={(e) => handleChange("nombre", e.target.value)}
              onBlur={() => touch("nombre")}
            />
          </label>
        )}

        {campos.email && (
          <label className="reserva-label">
            <span className="reserva-label-row">Email* {fieldIcon("email", emailOk)}</span>
            <input
              className="reserva-input"
              type="email"
              name="email"
              value={form.email}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => touch("email")}
            />
          </label>
        )}

        {campos.telefono && (
          <label className="reserva-label">
            <span className="reserva-label-row">Teléfono* {fieldIcon("telefono", telefonoOk)}</span>
            <input
              className="reserva-input"
              type="tel"
              name="telefono"
              value={form.telefono}
              placeholder="688888888"
              maxLength={15}
              autoComplete="tel"
              onChange={(e) => handleChange("telefono", e.target.value)}
              onBlur={() => touch("telefono")}
            />
          </label>
        )}

        {campos.personas && (
          <label className="reserva-label">
            <span className="reserva-label-row">Personas* {fieldIcon("personas", personasOk)}</span>
            <input
              className="reserva-input"
              type="number"
              name="personas"
              min="1"
              max={negocio.maxPersonas}
              value={form.personas}
              onChange={(e) => handleChange("personas", e.target.value)}
              onBlur={() => touch("personas")}
            />
          </label>
        )}

        {/* Selector de servicio (solo si el negocio tiene servicios configurados) */}
        {serviciosDisponibles.length > 0 && (
          <label className="reserva-label">
            <span className="reserva-label-row">Servicio* {fieldIcon("servicio", !!form.servicio)}</span>
            <select
              className="reserva-input"
              value={form.servicio}
              onChange={(e) => handleChange("servicio", e.target.value)}
              onBlur={() => touch("servicio")}
            >
              <option value="">Selecciona un servicio</option>
              {serviciosDisponibles.map((s) => (
                <option key={s.nombre} value={s.nombre}>{s.nombre}</option>
              ))}
            </select>
          </label>
        )}

        {/* Calendario y slots de hora */}
        {campos.fechaHora && (<>
          <div className="reserva-label">
            <span className="reserva-label-row">Día* {fieldIcon("dia", diaOk)}</span>
            <div className="reserva-datepicker-wrap">
              <button
                type="button"
                className="reserva-date-trigger"
                onClick={() => setCalOpen(o => !o)}
              >
                <Calendar size={16} />
                <span>{form.dia ? form.dia.split("-").reverse().join("/") : "dd/mm/aaaa"}</span>
              </button>
              {calOpen && (<>
                <div className="reserva-cal-overlay" onClick={() => { setCalOpen(false); touch("dia"); }} />
                <div className="reserva-cal-popup">
                  <DayPicker
                    mode="single"
                    locale={es}
                    selected={form.dia ? strToDate(form.dia) : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      handleChange("dia", dateToStr(date));
                      touch("dia");
                      setCalOpen(false);
                    }}
                    disabled={[
                      { before: strToDate(today) },
                      { after: strToDate(maxDate) },
                      { dayOfWeek: Object.entries(negocio.horarios).filter(([, t]) => t.length === 0).map(([d]) => Number(d)) },
                      ...(negocio.fechasBloqueadas ?? []).map(strToDate),
                    ]}
                    startMonth={strToDate(today)}
                    endMonth={strToDate(maxDate)}
                  />
                </div>
              </>)}
            </div>
          </div>

          <div className="reserva-label">
            Hora*
            {!form.dia || !diaOk ? (
              <p className="slots-placeholder">Selecciona un día primero</p>
            ) : slots.length === 0 ? (
              <p className="slots-placeholder">No hay horario disponible para este día</p>
            ) : (
              <div
                className={`slots-grid ${touched.hora && !horaOk ? "slots-bad" : touched.hora && horaOk ? "slots-ok" : ""}`}
                onBlur={() => touch("hora")}
              >
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-btn ${form.hora === slot ? "slot-btn--selected" : ""}`}
                    onClick={() => { handleChange("hora", slot); touch("hora"); }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>)}

        {/* Preguntas extra definidas por el admin */}
        {negocio.preguntasExtra?.filter((p) => p.guardado && p.label.trim()).map((p) => (
          <label key={p.id} className="reserva-label">
            {p.label}{!p.requerida && " (opcional)"}
            {p.tipo === "seleccion" ? (
              <select
                className="reserva-input"
                value={form.extras?.[p.id] ?? ""}
                onChange={(e) => handleExtra(p.id, e.target.value)}
              >
                <option value="">Selecciona una opción</option>
                {p.opciones?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : p.campoTipo === "textarea" ? (
              <textarea
                className="reserva-textarea"
                rows={3}
                value={form.extras?.[p.id] ?? ""}
                onChange={(e) => handleExtra(p.id, e.target.value)}
              />
            ) : (
              <input
                className="reserva-input"
                type="text"
                value={form.extras?.[p.id] ?? ""}
                onChange={(e) => handleExtra(p.id, e.target.value)}
              />
            )}
          </label>
        ))}

        {/* Mensaje libre (opcional) */}
        {campos.mensaje && (
          <label className="reserva-label">
            Mensaje (opcional)
            <textarea
              className="reserva-textarea"
              name="mensaje"
              value={form.mensaje}
              placeholder="Cualquier detalle adicional..."
              rows={4}
              onChange={(e) => handleChange("mensaje", e.target.value)}
            />
          </label>
        )}

        {/* Acciones: enviar, limpiar, teléfono */}
        <div className="reserva-actions">
          <button className="reserva-btn" type="submit" disabled={!canSend}>
            {negocio.textoBtnReservar || "Reservar"}
            <img src={icon1} alt="WhatsApp" />
          </button>

          <button className="reserva-btn-secondary" type="button" onClick={limpiar}>
            Limpiar
          </button>

          {(negocio.mostrarTelefono ?? true) && (
            <div className="reserva-tel">
              <p>{negocio.textoTelefono || "También puedes reservar por teléfono"}</p>
              <a href={`tel:${negocio.telefono}`}>
                <PhoneCall className="icon-tel" />
              </a>
            </div>
          )}
        </div>

      </form>
    </section>
  );
}
