import { Clock, Users, SlidersHorizontal } from "lucide-react";
import "../../styles/config-tabs/tabConfigReservas.css";

export default function TabConfigReservas({ draft, setField }) {
  return (
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
  );
}
