import { MENSAJE_TEMPLATE_DEFAULT } from "../config/negocio";

/**
 * Genera el texto del mensaje usando el template configurado.
 * Placeholders: {negocio} {nombre} {telefono} {personas} {hora} {dia} {mensajeExtra}
 */
export function generarMensaje(form, negocio) {
  const campos = { nombre: true, telefono: true, email: true, personas: true, fechaHora: true, mensaje: true, ...negocio.camposActivos };
  const template = negocio.mensajeTemplate || MENSAJE_TEMPLATE_DEFAULT;

  const extraLines = [];
  if (form.servicio) extraLines.push(`🛎️ Servicio: ${form.servicio}`);
  if (campos.mensaje && form.mensaje?.trim()) extraLines.push(`💬 Mensaje: ${form.mensaje.trim()}`);
  if (negocio.preguntasExtra?.length && form.extras) {
    for (const p of negocio.preguntasExtra) {
      const val = form.extras?.[p.id];
      if (val) extraLines.push(`${p.label}: ${val}`);
    }
  }
  const extra = extraLines.join("\n");

  // Tabla de campos: placeholder → { activo, valor }
  const sustituciones = [
    { ph: "{encabezado}", activo: true,              valor: negocio.encabezadoMensaje || "📋 *Nueva Solicitud*" },
    { ph: "{negocio}",  activo: true,                valor: negocio.nombre || "" },
    { ph: "{nombre}",   activo: campos.nombre,       valor: form.nombre || "-" },
    { ph: "{telefono}", activo: campos.telefono,     valor: form.telefono || "-" },
    { ph: "{email}",    activo: campos.email,        valor: form.email || "-" },
    { ph: "{personas}", activo: campos.personas,     valor: String(form.personas || "-") },
    { ph: "{hora}",     activo: campos.fechaHora,    valor: form.hora || "-" },
    { ph: "{dia}",      activo: campos.fechaHora,    valor: form.dia ? form.dia.split("-").reverse().join("-") : "-" },
    { ph: "{mensajeExtra}", activo: true,            valor: extra },
  ];

  // Procesa línea a línea: si la línea contiene un placeholder inactivo, la elimina
  return template
    .split("\n")
    .map(line => {
      let l = line;
      for (const { ph, activo, valor } of sustituciones) {
        if (l.includes(ph)) {
          if (!activo) return null; // elimina la línea completa
          l = l.replace(ph, valor);
        }
      }
      return l;
    })
    .filter(line => line !== null && line.trim() !== "")
    .join("\n");
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
