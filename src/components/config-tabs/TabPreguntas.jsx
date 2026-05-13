import { useState } from "react";
import { FileText, Pencil, Trash2 } from "lucide-react";
import "../../styles/config-tabs/tabPreguntas.css";

export default function TabPreguntas({ draft, setField, addPregunta, removePregunta, setPregunta }) {
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);

  return (
    <div className="acc-body">
      <div className="cfg-card-desktop cfg-card-mobile">

        <div className="cont-header-titles">
          <h2 className="cfg-card-label">Preguntas personalizadas</h2>
          <p className="cfg-card-subtitle">Campos extra que verá el cliente al reservar.</p>
        </div>

        <label className="cfg-label">
          <span>Título de la sección</span>
          <input className="cfg-input" type="text" placeholder="Ej: Información adicional"
            value={draft.tituloPreguntasExtra ?? ""}
            onChange={(e) => setField("tituloPreguntasExtra", e.target.value)} />
        </label>

        <div className="cfg-preguntas-list">
          {draft.preguntasExtra.map((p, i) => (
            p.guardado ? (
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
                {confirmarEliminar === i ? (
                  <div className="cfg-pregunta-actions">
                    <span className="cfg-pregunta-confirmar">¿Eliminar?</span>
                    <button type="button" className="cfg-pregunta-btn cfg-pregunta-btn--danger"
                      onClick={() => { removePregunta(i); setConfirmarEliminar(null); }}>Sí</button>
                    <button type="button" className="cfg-pregunta-btn"
                      onClick={() => setConfirmarEliminar(null)}>No</button>
                  </div>
                ) : (
                  <div className="cfg-pregunta-actions">
                    <button type="button" className="cfg-pregunta-btn"
                      onClick={() => setPregunta(i, "guardado", false)}>
                      <Pencil size={12} />Editar
                    </button>
                    <button type="button" className="cfg-pregunta-btn cfg-pregunta-btn--danger"
                      onClick={() => setConfirmarEliminar(i)}>
                      <Trash2 size={12} />Eliminar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div key={p.id} className="cfg-pregunta">
                <input className="cfg-input" type="text" placeholder="Pregunta (ej: ¿Tienes alergias?)"
                  maxLength={120} value={p.label} onChange={(e) => setPregunta(i, "label", e.target.value)} />
                <div className="cfg-pregunta-row">
                  <select className="cfg-input cfg-input-tipo" value={p.tipo}
                    onChange={(e) => setPregunta(i, "tipo", e.target.value)}>
                    <option value="texto">Texto libre</option>
                    <option value="seleccion">Opciones</option>
                  </select>
                  {p.tipo === "texto" && (
                    <select className="cfg-input cfg-input-tipo" value={p.campoTipo ?? "input"}
                      onChange={(e) => setPregunta(i, "campoTipo", e.target.value)}>
                      <option value="input">Campo corto</option>
                      <option value="textarea">Texto largo</option>
                    </select>
                  )}
                  <label className="cfg-check-label">
                    <input type="checkbox" checked={!!p.requerida}
                      onChange={(e) => setPregunta(i, "requerida", e.target.checked)} />
                    Obligatoria
                  </label>
                </div>
                {p.tipo === "seleccion" && (
                  <input className="cfg-input" type="text"
                    placeholder="Opciones separadas por coma (ej: Interior, Exterior)"
                    key={p.id}
                    defaultValue={p.opciones?.filter(Boolean).join(", ") ?? ""}
                    onBlur={(e) => setPregunta(i, "opciones", e.target.value.split(",").map((o) => o.trim()).filter(Boolean))} />
                )}
                <div className="cfg-pregunta-btns">
                  <button type="button" className="cfg-btn-add-fecha"
                    disabled={!p.label.trim()}
                    onClick={() => setPregunta(i, "guardado", true)}>
                    Guardar pregunta
                  </button>
                  <button type="button" className="cfg-btn-secondary-sm" onClick={() => removePregunta(i)}>
                    Cancelar
                  </button>
                </div>
              </div>
            )
          ))}
          <button type="button" className="cfg-btn-add" onClick={addPregunta}>+ Añadir pregunta</button>
        </div>

      </div>
    </div>
  );
}
