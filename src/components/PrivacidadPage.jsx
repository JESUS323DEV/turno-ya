import { useEffect, useState } from "react";
import { getConfig } from "../config/negocio";
import "../styles/privacidadPage.css";

export default function PrivacidadPage({ tipo = "privacidad" }) {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    const config = getConfig();
    setTexto(tipo === "privacidad" ? config.textoPoliticaPrivacidad : config.textoAvisoLegal);
  }, [tipo]);

  return (
    <div className="legal-page">
      <div className="legal-page-content">
        <h1 className="legal-page-title">
          {tipo === "privacidad" ? "Política de privacidad" : "Aviso legal"}
        </h1>
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
