import { MENSAJE_TEMPLATE_DEFAULT } from "../config/negocio";

/**
 * Genera el texto del mensaje usando el template configurado.
 * Placeholders: {negocio} {nombre} {telefono} {personas} {hora} {dia} {mensajeExtra}
 */
export function generarMensaje(form, negocio) {
  const template = negocio.mensajeTemplate || MENSAJE_TEMPLATE_DEFAULT;

  const extraLines = [];
  if (form.servicio) extraLines.push(`🛎️ Servicio: ${form.servicio}`);
  if (form.mensaje?.trim()) extraLines.push(`💬 Mensaje: ${form.mensaje.trim()}`);
  if (negocio.preguntasExtra?.length && form.extras) {
    for (const p of negocio.preguntasExtra) {
      const val = form.extras?.[p.id];
      if (val) extraLines.push(`${p.label}: ${val}`);
    }
  }
  const extra = extraLines.join("\n");

  return template
    .replace("{negocio}", negocio.nombre || "")
    .replace("{nombre}", form.nombre || "-")
    .replace("{telefono}", form.telefono || "-")
    .replace("{personas}", form.personas || "-")
    .replace("{hora}", form.hora || "-")
    .replace("{dia}", form.dia || "-")
    .replace("{mensajeExtra}", extra);
}

/**
 * Genera el enlace de WhatsApp con el mensaje prellenado.
 */
export function generarLink(mensaje, numero) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Genera el mensaje de comprobante para el cliente.
 */
export function generarComprobante(form, negocio) {
  const lineas = [
    `✅ *Solicitud de reserva enviada*`,
    `📍 ${negocio.nombre}`,
    "",
    `📅 Día: ${form.dia}`,
    `🕐 Hora: ${form.hora}`,
    `👥 Personas: ${form.personas}`,
    "",
    `📞 Contacto: ${negocio.telefono}`,
    "",
    `_Guarda este mensaje como comprobante._`,
    `_La reserva queda confirmada cuando el negocio te responda._`,
  ];
  return lineas.join("\n");
}

export function generarLinkComprobante(form, negocio) {
  return `https://wa.me/?text=${encodeURIComponent(generarComprobante(form, negocio))}`;
}
