import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAdminConfig, DIAS } from "../hooks/useAdminConfig";
import ReservaWhatsApp from "./ReservaWhatsApp";
import { TEMAS } from "../config/temas";
import "../styles/admin.css";

export default function AdminPanel() {
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
    addServicio, removeServicio, setServicio,
    addPregunta, removePregunta, setPregunta,
    addTemaGuardado, removeTemaGuardado,
    getConfigFinal,
  } = useAdminConfig();

  const [copiado, setCopiado] = useState(false);
  const [tab, setTab] = useState("negocio");
  const [modalCustom, setModalCustom] = useState(false);
  const [nombreTema, setNombreTema] = useState("");
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [confirmarEliminarPregunta, setConfirmarEliminarPregunta] = useState(null);

  const TABS = { negocio: "Negocio", horarios: "Horarios", reservas: "Reservas", servicios: "Servicios", ajustes: "Ajustes", preview: "Vista previa" };

  const copiarWidget = () => {
    const json = exportarWidget();
    const snippet = `<div id="turno-ya" data-config='${json}'></div>\n<link rel="stylesheet" href="https://tudominio.com/turno-ya.css">\n<script src="https://tudominio.com/turno-ya.js"></script>`;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  if (!autenticado) {
    return (
      <section className="admin-section">
        <form className="admin-pin-form" onSubmit={verificarPin}>
          <h2 className="admin-title">Panel de configuración</h2>
          <p className="admin-subtitle">Ingresá el PIN para continuar</p>
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

  const hoy = new Date().toISOString().split("T")[0];

  return (
    <section className="admin-section">
      <form className="admin-form" onSubmit={guardar}>
        <div className="admin-header">
          <h2 className="admin-title">Configuración</h2>
        </div>

        {/* Pestañas */}
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

        {/* NEGOCIO */}
        {tab === "negocio" && (
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Datos del negocio</legend>

            <label className="admin-label">
              <span>Nombre del negocio</span>
              <input className="admin-input" type="text" value={draft.nombre}
                maxLength={40}
                onChange={(e) => setField("nombre", e.target.value)} />
              <span className="admin-counter">{draft.nombre.length} / 40</span>
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
                maxLength={150} value={draft.descripcion}
                rows={3}
                onChange={(e) => setField("descripcion", e.target.value)} />
              <span className="admin-counter">{draft.descripcion.length} / 150</span>
            </label>

            <label className="admin-label">
              <span>Título del formulario</span>
              <input className="admin-input" type="text" maxLength={20}
                value={draft.tituloFormulario}
                onChange={(e) => setField("tituloFormulario", e.target.value)} />
              <span className="admin-counter">{draft.tituloFormulario.length} / 20</span>
            </label>

            <label className="admin-label">
              <span>Logo (URL de imagen)</span>
              <input className="admin-input" type="url"
                placeholder="https://... (jpg, png, webp)"
                value={draft.logoUrl}
                onChange={(e) => setField("logoUrl", e.target.value)} />
              {draft.logoUrl && <img src={draft.logoUrl} alt="Logo preview" className="admin-logo-preview" />}
            </label>

            <label className="admin-label">
              <span>WhatsApp (sin + ni espacios)</span>
              <input className="admin-input" type="tel" placeholder="34600000000"
                maxLength={15} value={draft.whatsapp}
                onChange={(e) => setField("whatsapp", e.target.value.replace(/[^\d]/g, ""))} />
              <span className="admin-counter">{draft.whatsapp.length} / 15</span>
            </label>

            <label className="admin-label">
              <span>Teléfono de contacto</span>
              <input className="admin-input" type="tel" placeholder="+34600000000"
                maxLength={16} value={draft.telefono}
                onChange={(e) => setField("telefono", e.target.value)} />
              <span className="admin-counter">{draft.telefono.length} / 16</span>
            </label>

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

            {/* Modal tema personalizado */}
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


        )}


        {/* HORARIOS */}
        {tab === "horarios" && (<>
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

        {/* RESERVAS */}
        {tab === "reservas" && (
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
          </fieldset>
        )}

        {/* SERVICIOS */}
        {tab === "servicios" && (<>
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Servicios</legend>
            <p className="admin-hint">Si defines servicios, el cliente elige uno y los slots se muestran dentro de su horario.</p>
            {draft.servicios.map((srv, i) => (
              srv.guardado ? (
                <div key={i} className="admin-servicio-card">
                  <div className="admin-servicio-info">
                    <span className="admin-servicio-nombre">{srv.nombre}</span>
                    <span className="admin-servicio-horario">{srv.horaInicio} — {srv.horaFin}</span>
                  </div>
                  <div className="admin-servicio-card-actions">
                    <span className="admin-servicio-activo" title="Activo">●</span>
                    {confirmarEliminar === i ? (
                      <>
                        <span className="admin-servicio-confirmar">¿Eliminar?</span>
                        <button type="button" className="admin-btn-remove" onClick={() => { removeServicio(i); setConfirmarEliminar(null); }}>Sí</button>
                        <button type="button" className="admin-btn-add-fecha" onClick={() => setConfirmarEliminar(null)}>No</button>
                      </>
                    ) : (
                      <button type="button" className="admin-btn-secondary-sm" onClick={() => setConfirmarEliminar(i)}>Cancelar</button>
                    )}
                  </div>
                </div>
              ) : (
                <div key={i} className="admin-servicio">
                  <input className="admin-input" type="text" placeholder="Nombre del servicio"
                    value={srv.nombre} onChange={(e) => setServicio(i, "nombre", e.target.value)} />
                  <div className="admin-servicio-rango">
                    <input className="admin-input admin-input-time" type="time"
                      value={srv.horaInicio ?? "09:00"}
                      onChange={(e) => setServicio(i, "horaInicio", e.target.value)} />
                    <span className="admin-turno-sep">—</span>
                    <input className="admin-input admin-input-time" type="time"
                      value={srv.horaFin ?? "17:00"}
                      onChange={(e) => setServicio(i, "horaFin", e.target.value)} />
                  </div>
                  <div className="admin-servicio-rango">
                    <button type="button" className="admin-btn-add-fecha"
                      disabled={!srv.nombre.trim()}
                      onClick={() => setServicio(i, "guardado", true)}>
                      Guardar servicio
                    </button>
                    <button type="button" className="admin-btn-remove" onClick={() => removeServicio(i)}>✕</button>
                  </div>
                </div>
              )
            ))}
            <button type="button" className="admin-btn-add" onClick={addServicio}>+ Añadir servicio</button>
          </fieldset>

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
                      <button type="button" className="admin-btn-secondary-sm" onClick={() => setConfirmarEliminarPregunta(i)}>Cancelar</button>
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

        {/* AJUSTES */}
        {tab === "ajustes" && (<>
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

          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Widget</legend>
            <button className="admin-btn-export" type="button" onClick={copiarWidget}>
              {copiado ? "✓ Copiado" : "Copiar código del widget"}
            </button>
          </fieldset>

          <fieldset className="admin-fieldset">
            <legend className="admin-legend">Caché</legend>
            <p className="admin-hint">Si la app no refleja los últimos cambios, límpia la caché.</p>
            <button className="admin-btn-secondary" type="button"
              onClick={() => { localStorage.clear(); window.location.reload(); }}>
              Limpiar caché
            </button>
          </fieldset>
        </>)}

        {/* VISTA PREVIA */}
        {tab === "preview" && (
          <div className="admin-preview-wrapper">
            <p className="admin-hint">Así ve el cliente el formulario en su móvil.</p>
            <div className="admin-preview-phone">
              <ReservaWhatsApp configOverride={getConfigFinal()} />
            </div>
          </div>
        )}

        {tab !== "preview" && (<>
          <button className="admin-btn-primary" type="submit">
            {guardado ? "✓ Guardado" : "Guardar cambios"}
          </button>
          {errorGuardado && <p className="admin-error">{errorGuardado}</p>}
        </>)}
      </form>
    </section>
  );
}
