import { useState } from "react";
import { Lock, LayoutGrid, Sun, Moon, Image as ImageIcon, Star, Check } from "lucide-react";
import FormFinal from "../FormFinal";
import { TEMAS } from "../../config/temas";
import "../../styles/config-tabs/tabApariencia.css";

function _hr(hex, a) {
  const h = hex.slice(0, 7);
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function getFormVars(tema, colorFondo, colorAcento, colorBorde) {
  const preset = TEMAS.find(t => t.id === tema);
  if (tema === "personalizado") {
    const bg = colorFondo || "#ffffff";
    const vars = { "--bg": bg };
    if (colorAcento) { vars["--accent"] = colorAcento; vars["--accent-bg"] = _hr(colorAcento, 0.12); vars["--accent-border"] = _hr(colorAcento, 0.5); }
    if (colorBorde) vars["--border-input"] = colorBorde;
    return { dataTema: "claro", vars };
  }
  if (!preset) return { dataTema: "claro", vars: {}, gradient: null, bgImage: null };
  const vars = {};
  if (preset.bg) vars["--bg"] = preset.bg;
  if (preset.border) vars["--border"] = preset.border;
  if (preset.accent) { vars["--accent"] = preset.accent; vars["--accent-bg"] = _hr(preset.accent, 0.12); vars["--accent-border"] = _hr(preset.accent, 0.5); }
  return { dataTema: preset.base, vars, gradient: preset.gradient || null, bgImage: preset.bgImage || null };
}

export default function TabApariencia({ draft, setField, addTemaGuardado, removeTemaGuardado, getConfigFinal }) {
  const [modalCustom, setModalCustom] = useState(false);
  const [nombreTema, setNombreTema] = useState("");
  const [categoriaTema, setCategoriaTema] = useState("todos");
  const [verMasTemas, setVerMasTemas] = useState(false);

  const { dataTema, vars, gradient, bgImage } = getFormVars(draft.tema, draft.colorFondo, draft.colorAcento, draft.colorBorde);

  const renderCard = (tema) => {
    const cardBg = tema.bgImage
      ? { backgroundImage: `url("${tema.bgImage}")`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }
      : tema.gradient
        ? { background: tema.gradient }
        : { background: tema.bg || "#e5e5e5" };
    return (
      <button key={tema.id} type="button"
        className={`cfg-tema-card cfg-tema-card--${tema.base} ${draft.tema === tema.id ? "cfg-tema-card--active" : ""}`}
        style={cardBg}
        onClick={() => {
          setField("tema", tema.id);
          window.dispatchEvent(new CustomEvent("turno-ya:tema", { detail: { tema: tema.id, colorFondo: draft.colorFondo, colorAcento: draft.colorAcento, colorBorde: draft.colorBorde } }));
        }}>
        <div className="cfg-tema-card-overlay" />
        <span className="cfg-tema-card-nombre">{tema.label}</span>
        {draft.tema === tema.id && <span className="cfg-tema-card-check"><Check size={11} /></span>}
      </button>
    );
  };

  const renderGrid = () => {
    const todos = TEMAS.filter(t => t.id !== "personalizado");

    if (categoriaTema === "todos") {
      const selected = todos.find(t => t.id === draft.tema);
      const rest = todos.filter(t => t.id !== draft.tema);
      const visible = verMasTemas ? todos : [selected, ...rest.slice(0, 3)].filter(Boolean);
      const remaining = todos.length - visible.length;
      return (
        <>
          <div className="cfg-tema-grid">{visible.map(renderCard)}</div>
          {(verMasTemas || todos.length > 4) && (
            <button type="button" className="cfg-tema-vermás-btn"
              onClick={() => setVerMasTemas(p => !p)}>
              {verMasTemas ? "Ver menos ↑" : `Ver todos · ${remaining} más ↓`}
            </button>
          )}
        </>
      );
    }

    if (categoriaTema === "fondo") {
      const fondosClaros = todos.filter(t => t.bgImage && t.base === "claro");
      const fondosOscuros = todos.filter(t => t.bgImage && t.base === "oscuro");
      return (
        <>
          {fondosClaros.length > 0 && (
            <>
              <span className="cfg-tema-grupo-label">Fondos claros</span>
              <div className="cfg-tema-grid">{fondosClaros.map(renderCard)}</div>
            </>
          )}
          {fondosOscuros.length > 0 && (
            <>
              <span className="cfg-tema-grupo-label">Fondos oscuros</span>
              <div className="cfg-tema-grid">{fondosOscuros.map(renderCard)}</div>
            </>
          )}
        </>
      );
    }

    if (categoriaTema === "favoritos") {
      const favIds = new Set(draft.temasGuardados.map(t => t.id));
      const favs = todos.filter(t => favIds.has(t.id));
      return favs.length > 0
        ? <div className="cfg-tema-grid">{favs.map(renderCard)}</div>
        : <p className="cfg-rsv-hint">Aún no tienes favoritos guardados.</p>;
    }

    const temasFiltrados = todos.filter(t => t.base === categoriaTema);
    const solidos = temasFiltrados.filter(t => !t.bgImage);
    const artisticos = temasFiltrados.filter(t => t.bgImage);
    return (
      <>
        {solidos.length > 0 && (
          <>
            <span className="cfg-tema-grupo-label">Colores sólidos</span>
            <div className="cfg-tema-grid">{solidos.map(renderCard)}</div>
          </>
        )}
        {artisticos.length > 0 && (
          <>
            <span className="cfg-tema-grupo-label">Fondos artísticos</span>
            <div className="cfg-tema-grid">{artisticos.map(renderCard)}</div>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <div className="acc-body">
        <div className="cfg-card-desktop cfg-card-mobile">
          <div className="cont-header-titles">
            <h2 className="cfg-card-label">Tema del formulario</h2>
            <p className="cfg-card-subtitle">Elige el estilo visual de tu formulario.</p>
          </div>

          <div className="cfg-card">
            <div className="cfg-card-desktop cfg-card-mobile">
              <div className="cfg-tema-cats">
                {[
                  { id: "todos", label: "Todos", icon: <LayoutGrid size={13} /> },
                  { id: "claro", label: "Claros", icon: <Sun size={13} /> },
                  { id: "oscuro", label: "Oscuros", icon: <Moon size={13} /> },
                  { id: "fondo", label: "Artísticos", icon: <ImageIcon size={13} /> },
                  { id: "favoritos", label: "Favoritos", icon: <Star size={13} /> },
                ].map(({ id, label, icon }) => (
                  <button key={id} type="button"
                    className={`cfg-tema-cat-btn ${categoriaTema === id ? "cfg-tema-cat-btn--active" : ""}`}
                    onClick={() => { setCategoriaTema(id); setVerMasTemas(false); }}>
                    {icon}{label}
                  </button>
                ))}
              </div>

              {renderGrid()}

              <button type="button"
                className={`cfg-tema-custom-btn ${draft.tema === "personalizado" ? "cfg-tema-custom-btn--active" : ""}`}
                onClick={() => setModalCustom(true)}>
                <Lock size={13} />Custom
              </button>
            </div>
          </div>

          <div className="cfg-tema-preview-wrap" data-tema={dataTema} style={bgImage
            ? { ...vars, backgroundColor: "var(--bg)", backgroundImage: `url("${bgImage}")`, backgroundSize: "cover", backgroundPosition: "center" }
            : { ...vars, background: gradient || "var(--bg)" }}>
            <FormFinal configOverride={getConfigFinal()} />
          </div>
        </div>
      </div>

      {/* ── Modal tema personalizado ── */}
      {modalCustom && (
        <div className="cfg-modal-overlay" onClick={() => setModalCustom(false)}>
          <div className="cfg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cfg-modal-header">
              <span className="cfg-modal-title">Tema personalizado</span>
              <button type="button" className="cfg-modal-close" onClick={() => setModalCustom(false)}>✕</button>
            </div>
            <div className="cfg-modal-body">
              {draft.temasGuardados.length > 0 && (
                <div className="cfg-favoritos">
                  <span className="cfg-favoritos-label">Favoritos</span>
                  {draft.temasGuardados.map((t) => (
                    <div key={t.id} className="cfg-favorito-item">
                      <button type="button" className="cfg-favorito-btn" onClick={() => {
                        setField("colorFondo", t.colorFondo);
                        setField("colorAcento", t.colorAcento);
                        setField("colorBorde", t.colorBorde);
                        setField("tema", "personalizado");
                        window.dispatchEvent(new CustomEvent("turno-ya:tema", { detail: { tema: "personalizado", colorFondo: t.colorFondo, colorAcento: t.colorAcento, colorBorde: t.colorBorde } }));
                      }}>
                        <span className="cfg-favorito-dots">
                          <span style={{ background: t.colorFondo, border: `2px solid ${t.colorBorde}` }} />
                          <span style={{ background: t.colorAcento }} />
                        </span>
                        <span className="cfg-favorito-nombre">{t.nombre}</span>
                      </button>
                      <button type="button" className="cfg-btn-remove" onClick={() => removeTemaGuardado(t.id)}>✕</button>
                    </div>
                  ))}
                  <hr className="cfg-modal-sep" />
                </div>
              )}
              <label className="cfg-label">
                <span>Color de fondo</span>
                <div className="cfg-color-row">
                  <input type="color" className="cfg-input-color" value={draft.colorFondo}
                    onChange={(e) => {
                      setField("colorFondo", e.target.value);
                      setField("tema", "personalizado");
                      window.dispatchEvent(new CustomEvent("turno-ya:tema", { detail: { tema: "personalizado", colorFondo: e.target.value, colorAcento: draft.colorAcento, colorBorde: draft.colorBorde } }));
                    }} />
                  <span className="cfg-color-hex">{draft.colorFondo}</span>
                </div>
              </label>
              <label className="cfg-label">
                <span>Color principal</span>
                <div className="cfg-color-row">
                  <input type="color" className="cfg-input-color" value={draft.colorAcento}
                    onChange={(e) => {
                      setField("colorAcento", e.target.value);
                      setField("tema", "personalizado");
                      window.dispatchEvent(new CustomEvent("turno-ya:tema", { detail: { tema: "personalizado", colorFondo: draft.colorFondo, colorAcento: e.target.value, colorBorde: draft.colorBorde } }));
                    }} />
                  <span className="cfg-color-hex">{draft.colorAcento}</span>
                </div>
              </label>
              <label className="cfg-label">
                <span>Color de bordes</span>
                <div className="cfg-color-row">
                  <input type="color" className="cfg-input-color" value={draft.colorBorde}
                    onChange={(e) => {
                      setField("colorBorde", e.target.value);
                      setField("tema", "personalizado");
                      window.dispatchEvent(new CustomEvent("turno-ya:tema", { detail: { tema: "personalizado", colorFondo: draft.colorFondo, colorAcento: draft.colorAcento, colorBorde: e.target.value } }));
                    }} />
                  <span className="cfg-color-hex">{draft.colorBorde}</span>
                </div>
              </label>
              <div className="cfg-favorito-save">
                <input className="cfg-input" type="text" placeholder="Nombre del favorito"
                  maxLength={30} value={nombreTema} onChange={(e) => setNombreTema(e.target.value)} />
                <button type="button" className="cfg-btn-add-fecha" disabled={!nombreTema.trim()}
                  onClick={() => { addTemaGuardado(nombreTema.trim()); setNombreTema(""); }}>
                  Guardar
                </button>
              </div>
            </div>
            <button type="button" className="cfg-btn-primary" onClick={() => {
              setField("tema", "personalizado");
              setModalCustom(false);
            }}>Aplicar</button>
          </div>
        </div>
      )}
    </>
  );
}
