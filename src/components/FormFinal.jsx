// ─── Imports ────────────────────────────────────────────────────────────────
import { useState } from "react";
import { PhoneCall, Globe, Calendar, Clock, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale/es";
import "react-day-picker/style.css";
import icon1 from "../assets/icon-whatsapp.png";
import { useReservaForm } from "../hooks/useReservaForm";
import { SLUG } from "../lib/supabase";
import { descargarIcs } from "../utils/ics";
import "../styles/formFinal.css";

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

// ─── Panel de ayuda (confirmación, cargos, WhatsApp) ────────────────────────
function HelpCards({ negocio }) {
  const waLink = negocio.whatsapp ? `https://wa.me/${negocio.whatsapp}` : null;
  return (
    <>
      <div className="help-card">
        <Clock size={22} className="help-card-icon" />
        <div>
          <p className="help-card-title">Confirmación rápida</p>
          <p className="help-card-text">Te confirmaremos tu reserva por email o WhatsApp a la brevedad posible.</p>
        </div>
      </div>
      <div className="help-card">
        <Calendar size={22} className="help-card-icon" />
        <div>
          <p className="help-card-title">Sin cargos</p>
          <p className="help-card-text">Reservar es gratuito y sin compromiso.</p>
        </div>
      </div>
      {waLink && (
        <div className="help-card">
          <PhoneCall size={22} className="help-card-icon" />
          <div>
            <p className="help-card-title">¿Necesitas ayuda?</p>
            <p className="help-card-text">Escríbenos por WhatsApp si tienes alguna consulta.</p>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="help-card-btn">
              Abrir WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
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
export default function FormFinal({ configOverride = null } = {}) {
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
    enviando,
    errorEnvio,
    emailRequired,
    horasOcupadas,
  } = useReservaForm(configOverride);

  const [calOpen, setCalOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

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
          <h2 className="confirmacion-titulo">
            {negocio.modoEnvio === "email" ? "¡Solicitud recibida!" : "¡Solicitud enviada!"}
          </h2>
          <p className="confirmacion-texto">
            {negocio.modoEnvio === "email"
              ? <>Hemos recibido tu solicitud en <strong>{negocio.nombre}</strong>. Te confirmaremos en breve por email.</>
              : <>Tu solicitud en <strong>{negocio.nombre}</strong> ha sido enviada. En breve recibirás confirmación.</>
            }
          </p>
          {(campos.fecha || campos.hora || campos.personas) && (
            <div className="confirmacion-resumen">
              {campos.fecha && form.dia && <span>📅 {form.dia.split("-").reverse().join("-")}</span>}
              {campos.hora && form.hora && <span>🕐 {form.hora}</span>}
              {campos.personas && <span>👥 {form.personas} {form.personas === 1 ? "persona" : "personas"}</span>}
            </div>
          )}
          {(campos.fecha || campos.hora) && (
            <button className="confirmacion-btn-ics" type="button" onClick={() => descargarIcs(form, negocio)}>
              📅 Añadir al calendario
            </button>
          )}
          <button className="confirmacion-btn-nueva" onClick={() => { resetEnviado(); setStep(1); }}>
            Nueva solicitud
          </button>
        </div>
      </section>
    );
  }

  const cerradoHoy = negocio.cierreTemporalFecha === today;

  // ─── Formulario principal ──────────────────────────────────────────────────
  return (
    <>
    <section className="reserva-section">
      <div className="reserva-layout">
        <form className="reserva-form" onSubmit={onSubmit}>

          <div className="reserva-cabecera">

            {/* Cabecera: logo, nombre, descripción*/}
            <div className="cabecera">
              {negocio.logoUrl && (
                <img src={negocio.logoUrl} alt={negocio.nombre} className="reserva-logo" />
              )}

              {(negocio.mostrarNombre ?? true) && (
                <div className="reserva-tittle-negocio">
                  <h1 className={`reserva-negocio-nombre reserva-negocio-nombre--${negocio.nombreSize ?? "md"}`} style={{ color: negocio.colorNegocio }}>{negocio.nombre}</h1>
                </div>
              )}


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

          <h2 className="reserva-title">{negocio.tituloFormulario || "Reservas"}</h2>

          {/* Aviso cierre temporal */}
          {cerradoHoy && (
            <div className="reserva-cerrado">
              🔴 Hoy no aceptamos reservas. Vuelve mañana o llámanos.
            </div>
          )}

          {/* Barra de progreso 
          <div className="form-progress-wrap">
            <div className="form-progress-info">
              <span>{step === 1 ? "Rellena los datos de tu reserva" : "Revisa y confirma"}</span>
              <span className="form-progress-step">Paso {step} de 2</span>
            </div>
            <div className="form-progress-track">
              <div className="form-progress-fill" style={{ width: step === 1 ? "50%" : "100%" }} />
            </div>
          </div>*/}

          {/* ── Paso 1: formulario completo ── */}
          {step === 1 && (
            <>
              <div className="cont-form-fields">

                <div className="form-fields-grid">
                  <h4 className="form-section-title col-span-2">Tus datos:</h4>
                  {campos.nombre && (
                    <label className={`reserva-label${!campos.apellidos ? " col-span-2" : ""}`}>
                      <span className="reserva-label-row">Nombre* {fieldIcon("nombre", nombreOk)}</span>
                      <input
                        className="reserva-input"
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        placeholder="Tu nombre"
                        autoComplete="given-name"
                        onChange={(e) => handleChange("nombre", e.target.value)}
                        onBlur={() => touch("nombre")}
                      />
                    </label>
                  )}

                  {campos.apellidos && (
                    <label className="reserva-label ">
                      <span className="reserva-label-row">Apellidos*</span>
                      <input
                        className="reserva-input"
                        type="text"
                        name="apellidos"
                        value={form.apellidos}
                        placeholder="Apellidos"
                        autoComplete="family-name"
                        onChange={(e) => handleChange("apellidos", e.target.value)}
                      />
                    </label>
                  )}
                  {emailRequired && (
                    <label className="reserva-label col-span-2">
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
                    <label className={`reserva-label${!campos.personas ? " col-span-2" : ""}`}>
                      <span className="reserva-label-row">Teléfono* {fieldIcon("telefono", telefonoOk)}</span>
                      <input
                        className="reserva-input"
                        type="tel"
                        name="telefono"
                        value={form.telefono}
                        placeholder="+34 688 888 888"
                        maxLength={15}
                        autoComplete="tel"
                        onChange={(e) => handleChange("telefono", e.target.value)}
                        onBlur={() => touch("telefono")}
                      />
                    </label>
                  )}
                  {campos.personas && (
                    <label className={`reserva-label${!campos.telefono ? " col-span-2" : ""}`}>
                      <span className="reserva-label-row">Personas* {fieldIcon("personas", personasOk)}</span>
                      <select
                        className="reserva-input"
                        value={form.personas}
                        onChange={(e) => handleChange("personas", Number(e.target.value))}
                        onBlur={() => touch("personas")}
                      >
                        {Array.from({ length: (negocio.maxPersonas ?? 20) - (negocio.minPersonas ?? 1) + 1 }, (_, i) => i + (negocio.minPersonas ?? 1)).map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  {serviciosDisponibles.length > 1 && (
                    <label className="reserva-label col-span-2">
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
                </div>

                {(campos.fecha || campos.hora) && <div className="form-fields-grid2">
                  <h4 className="form-section-title col-span-2">Fecha:</h4>
                  {campos.fecha && (
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
                  )}

                  {campos.hora && (
                    <div className="reserva-label">
                      <span className="reserva-label2">
                        Hora*
                      </span>

                      {!form.dia || !diaOk ? (
                        <p className="slots-placeholder">Selecciona un día primero</p>
                      ) : slots.length === 0 ? (
                        <p className="slots-placeholder">No hay horario disponible para este día</p>
                      ) : (
                        <div
                          className={`slots-grid ${touched.hora && !horaOk ? "slots-bad" : touched.hora && horaOk ? "slots-ok" : ""}`}
                          onBlur={() => touch("hora")}
                        >
                          {slots.map((slot) => {
                            const ocupado = horasOcupadas.has(slot);
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={ocupado}
                                className={`slot-btn ${form.hora === slot ? "slot-btn--selected" : ""} ${ocupado ? "slot-btn--ocupado" : ""}`}
                                onClick={() => { if (!ocupado) { handleChange("hora", slot); touch("hora"); } }}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>}
              </div>

              <div className="cont-reserva-extra">
                {negocio.tituloPreguntasExtra && negocio.preguntasExtra?.some(p => p.guardado) && (
                  <h4 className="form-section-title">{negocio.tituloPreguntasExtra}</h4>
                )}
                {negocio.preguntasExtra?.filter((p) => p.guardado && p.label.trim()).map((p) => (
                  <label key={p.id} className="reserva-label-extra">
                    <span className="reserva-label2">
                      <span>{p.label}{p.requerida && "*"}</span>
                    </span>


                    {p.tipo === "seleccion" ? (
                      <select
                        className="reserva-input "
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
              </div>

              {campos.mensaje && (
                <label className="reserva-label">
                  <span className="reserva-label2">

                    Mensaje (opcional)
                  </span>

                  <textarea
                    className="reserva-textarea"
                    name="mensaje"
                    value={form.mensaje}
                    placeholder="Cuéntanos algo más (alergias, ocasiones especiales, etc.)"
                    rows={4}
                    onChange={(e) => handleChange("mensaje", e.target.value)}
                  />
                </label>
              )}

              <label className="reserva-privacidad-check">
                <input type="checkbox" checked={aceptaPrivacidad} onChange={e => setAceptaPrivacidad(e.target.checked)} />
                <span>He leído y acepto la <a href={`/${SLUG}/privacidad`} target="_blank" rel="noopener noreferrer">Política de privacidad</a></span>
              </label>

              <div className="reserva-actions">
                <button
                  type="button"
                  className="reserva-btn"
                  onClick={() => {
                    ["nombre", "email", "telefono", "personas", "servicio", "dia", "hora"].forEach(f => touch(f));
                    if (canSend && aceptaPrivacidad) setStep(2);
                  }}
                >
                  Continuar →
                </button>
                <button className="reserva-btn-secondary" type="button" onClick={limpiar}>
                  Limpiar
                </button>
                {(negocio.mostrarTelefono ?? true) && (
                  <div className="reserva-tel">
                    <p>{negocio.textoTelefono || "También puedes reservar por teléfono"}</p>
                    <a href={`tel:${negocio.telefono}`}><PhoneCall className="icon-tel" /></a>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Paso 2: resumen y confirmación ── */}
          {step === 2 && (
            <>
              <p className="form-section-title">Revisa tu reserva</p>
              <div className="reserva-resumen">
                {[
                  campos.nombre && form.nombre && { icon: "👤", valor: [form.nombre, form.apellidos].filter(Boolean).join(" ") },
                  campos.telefono && form.telefono && { icon: "📞", valor: form.telefono },
                  emailRequired && form.email && { icon: "📧", valor: form.email },
                  campos.personas && { icon: "👥", valor: `${form.personas} ${Number(form.personas) === 1 ? "persona" : "personas"}` },
                  form.servicio && { icon: "🛎️", valor: form.servicio },
                  campos.fecha && form.dia && { icon: "📅", valor: form.dia.split("-").reverse().join("/") },
                  campos.hora && form.hora && { icon: "🕐", valor: form.hora },
                  ...(negocio.preguntasExtra?.filter(p => p.guardado && form.extras?.[p.id]).map(p => ({ icon: "📝", valor: `${p.label}: ${form.extras[p.id]}` })) ?? []),
                  form.mensaje && { icon: "💬", valor: form.mensaje },
                ].filter(Boolean).map(({ icon, valor }, i) => (
                  <div key={i} className="reserva-resumen-row">
                    <span className="reserva-resumen-icon">{icon}</span>
                    <span className="reserva-resumen-valor">{valor}</span>
                  </div>
                ))}
              </div>
              <div className="reserva-actions">
                {errorEnvio && <p className="reserva-error">{errorEnvio}</p>}
                <button className="reserva-btn" type="submit" disabled={enviando}>
                  {enviando ? "Enviando..." : (negocio.textoBtnReservar || "Confirmar reserva")}
                  {!enviando && negocio.modoEnvio !== "email" && <img src={icon1} alt="WhatsApp" />}
                </button>
                <button className="reserva-btn-secondary" type="button" onClick={() => setStep(1)}>
                  ← Volver y editar
                </button>
              </div>
            </>
          )}

          <p className="form-footer">🔒 Tu información está segura y no será compartida.</p>

        </form>

      </div>

      {(negocio.mostrarPanelAyuda ?? true) && (
        <button className="reserva-help-fab" type="button" onClick={() => setHelpOpen(true)}>
          ¿Ayuda?
        </button>
      )}

      {(negocio.mostrarPanelAyuda ?? true) && helpOpen && (
        <>
          <div className="reserva-help-overlay" onClick={() => setHelpOpen(false)} />
          <div className="reserva-help-modal">
            <button className="reserva-help-modal-close" type="button" onClick={() => setHelpOpen(false)}>
              <X size={20} />
            </button>
            <HelpCards negocio={negocio} />
          </div>
        </>
      )}
    </section>

    <footer className="reserva-footer">
      <span className="reserva-footer-brand">Powered by <strong>Reservaq</strong></span>
      <nav className="reserva-footer-links">
        <a href={`/${SLUG}/privacidad`} target="_blank" rel="noopener noreferrer">Política de privacidad</a>
        <span className="reserva-footer-sep">·</span>
        <a href={`/${SLUG}/legal`} target="_blank" rel="noopener noreferrer">Aviso legal</a>
      </nav>
    </footer>
    </>
  );
}
