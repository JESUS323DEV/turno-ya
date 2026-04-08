import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReservaWhatsApp from "./components/ReservaWhatsApp";
import "./styles/reserva.css";

(function () {
  const el = document.getElementById("turno-ya");
  if (!el) return;

  const raw = el.getAttribute("data-config");
  if (raw) {
    try {
      window.__TURNO_YA_CONFIG__ = JSON.parse(raw);
    } catch {
      console.warn("[TurnoYA] data-config inválido, usando config por defecto.");
    }
  }

  createRoot(el).render(
    <StrictMode>
      <ReservaWhatsApp />
    </StrictMode>
  );
})();
