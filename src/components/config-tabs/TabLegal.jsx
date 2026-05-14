import "../../styles/config-tabs/tabLegal.css";

export default function TabLegal({ draft, setField }) {
  return (
    <div className="cfg-legal-page">
      <div className="cfg-card">
        <h2 className="cfg-card-title">Textos legales</h2>
        <p className="cfg-card-subtitle">Estos textos aparecen en las páginas de privacidad y aviso legal de tu formulario.</p>
      </div>

      <label className="cfg-label">
        <span>Política de privacidad</span>
        <textarea
          className="cfg-textarea"
          rows={12}
          placeholder="Escribe aquí tu política de privacidad..."
          value={draft.textoPoliticaPrivacidad ?? ""}
          onChange={(e) => setField("textoPoliticaPrivacidad", e.target.value)}
        />
      </label>

      <label className="cfg-label">
        <span>Aviso legal</span>
        <textarea
          className="cfg-textarea"
          rows={10}
          placeholder="Escribe aquí tu aviso legal..."
          value={draft.textoAvisoLegal ?? ""}
          onChange={(e) => setField("textoAvisoLegal", e.target.value)}
        />
      </label>
    </div>
  );
}
