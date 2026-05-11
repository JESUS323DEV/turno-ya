import { Calendar, CalendarX, Lock, Trash2 } from "lucide-react";
import { DIAS } from "../../hooks/useAdminConfig";
import "../../styles/config-tabs/tabHorarios.css";

export default function TabHorarios({ draft, setField, setDia, setTurno, addTurno, removeTurno, nuevaFecha, setNuevaFecha, addFechaBloqueada, removeFechaBloqueada }) {
  const hoy = new Date().toISOString().split("T")[0];

  return (
    <div className="acc-body">
      <div className="cfg-card-desktop cfg-card-mobile">

        <div className="cont-header-titles">
          <h2 className="cfg-card-label">Horarios de atención</h2>
          <p className="cfg-card-subtitle">Configura los días y turnos disponibles.</p>
        </div>

        {/* ── Días de la semana ── */}
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
  );
}
