import { useEffect, useState } from "react";
import { getConfig } from "../config/negocio";
import "../styles/privacidadPage.css";

export default function PrivacidadPage() {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    const config = getConfig();
    setTexto(config.textoPoliticaPrivacidad || "");
  }, []);

  return (
    <div className="legal-page">
      <div className="legal-page-content">
        <h1 className="legal-page-title">Política de privacidad</h1>
        <div className="legal-page-body">
          {texto.split("\n").map((linea, i) =>
            linea.trim() === ""
              ? <br key={i} />
              : <p key={i}>{linea}</p>
          )}
        </div>
        <button className="legal-page-back" onClick={() => history.back()}>← Volver</button>
      </div>
    </div>
  );
}
