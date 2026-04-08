import { PhoneCall } from "lucide-react";
import icon1 from "../assets/icon-whatsapp.png";
import { useReservaForm } from "../hooks/useReservaForm";
import { descargarIcs } from "../utils/ics";
import "../styles/reserva.css";

export default function ReservaWhatsApp({ configOverride = null } = {}) {
  const {
    form,
    today,
    canSend,
    diaOk,
    nombreOk,
    telefonoOk,
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
  } = useReservaForm(configOverride);

  const fieldIcon = (field, isOk) => {
    if (!touched[field]) return null;
    return isOk
      ? <span className="field-icon--ok">✓</span>
      : <span className="field-icon--bad">✗</span>;
  };

  if (enviado) {
    return (
      <section className="reserva-section">
        <div className="confirmacion">
          <div className="confirmacion-icono">✅</div>
          <h2 className="confirmacion-titulo">¡Solicitud enviada!</h2>
          <p className="confirmacion-texto">
            Tu reserva en <strong>{negocio.nombre}</strong> ha sido enviada.
            El negocio te confirmará por WhatsApp.
          </p>
          <div className="confirmacion-resumen">
            <span>📅 {form.dia}</span>
            <span>🕐 {form.hora}</span>
            <span>👥 {form.personas} personas</span>
          </div>
          <button
            className="confirmacion-btn-ics"
            type="button"
            onClick={() => descargarIcs(form, negocio)}
          >
            📅 Añadir al calendario
          </button>
          <button className="confirmacion-btn-nueva" onClick={resetEnviado}>
            Hacer otra reserva
          </button>
        </div>
      </section>
    );
  }

  const cerradoHoy = negocio.cierreTemporalFecha === today;

  return (
    <section className="reserva-section">
      <form className="reserva-form" onSubmit={onSubmit}>
        {negocio.logoUrl && (
          <img src={negocio.logoUrl} alt={negocio.nombre} className="reserva-logo" />
        )}
        <p className="reserva-negocio" style={{ color: negocio.colorNegocio }}>{negocio.nombre}</p>
        {negocio.descripcion && (
          <p className="reserva-descripcion">{negocio.descripcion}</p>
        )}
        <h2 className="reserva-title">{negocio.tituloFormulario || "Reservas"}</h2>

        {cerradoHoy && (
          <div className="reserva-cerrado">
            🔴 Hoy no aceptamos reservas. Vuelve mañana o llámanos.
          </div>
        )}

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

        <label className="reserva-label">
          <span className="reserva-label-row">Día* {fieldIcon("dia", diaOk)}</span>
          <input
            className="reserva-input"
            type="date"
            name="dia"
            value={form.dia}
            min={today}
            max={maxDate}
            onChange={(e) => handleChange("dia", e.target.value)}
            onBlur={() => touch("dia")}
          />
        </label>

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

        {negocio.preguntasExtra?.filter((p) => p.guardado && p.label.trim()).map((p) => (
          <label key={p.id} className="reserva-label">
            {p.label}
            {p.tipo === "seleccion" ? (
              <select
                className="reserva-input"
                value={form.extras?.[p.id] ?? ""}
                onChange={(e) => handleExtra(p.id, e.target.value)}
              >
                <option value="">Selecciona una opción</option>
                {p.opciones?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
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

        <label className="reserva-label">
          Mensaje (opcional)
          <textarea
            className="reserva-textarea"
            name="mensaje"
            value={form.mensaje}
            placeholder="Alergias, preferencia de mesa..."
            rows={4}
            onChange={(e) => handleChange("mensaje", e.target.value)}
          />
        </label>

        <div className="reserva-actions">
          <button className="reserva-btn" type="submit" disabled={!canSend}>
            Reservar
            <img src={icon1} alt="WhatsApp" />
          </button>

          <button className="reserva-btn-secondary" type="button" onClick={limpiar}>
            Limpiar
          </button>

          <div className="reserva-tel">
            <p>También puedes reservar por teléfono</p>
            <a href={`tel:${negocio.telefono}`}>
              <PhoneCall className="icon-tel" />
            </a>
          </div>
        </div>
      </form>
    </section>
  );
}
