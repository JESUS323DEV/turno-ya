import { MENSAJE_TEMPLATE_DEFAULT } from "../config/negocio";

/**
 * Genera el texto del mensaje usando el template configurado.
 * Placeholders: {negocio} {nombre} {telefono} {personas} {hora} {dia} {mensajeExtra}
 */
export function generarMensaje(form, negocio) {
  const camposRaw = { nombre: true, apellidos: false, telefono: true, email: true, personas: true, fecha: true, hora: true, mensaje: true, ...negocio.camposActivos };
  const campos = {
    ...camposRaw,
    fecha: camposRaw.fecha ?? camposRaw.fechaHora ?? true,
    hora:  camposRaw.hora  ?? camposRaw.fechaHora ?? true,
  };
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
    { ph: "{nombre}",   activo: campos.nombre,       valor: [form.nombre, campos.apellidos && form.apellidos].filter(Boolean).join(" ") || "-" },
    { ph: "{telefono}", activo: campos.telefono,     valor: form.telefono || "-" },
    { ph: "{email}",    activo: campos.email,        valor: form.email || "-" },
    { ph: "{personas}", activo: campos.personas,     valor: String(form.personas || "-") },
    { ph: "{hora}",     activo: campos.hora,         valor: form.hora || "-" },
    { ph: "{dia}",      activo: campos.fecha,        valor: form.dia ? form.dia.split("-").reverse().join("-") : "-" },
    { ph: "{mensajeExtra}", activo: true,            valor: extra },
    { ph: "{pie}",         activo: true,            valor: negocio.textoPie ?? "✅ ¡Gracias! Reserva hecha." },
  ];

  // Migración: configs viejos tienen el texto hardcodeado, reemplazarlo por {pie}
  const templateNormalizado = template.includes("{pie}")
    ? template
    : template.replace("✅ ¡Gracias! Reserva hecha.", "{pie}");

  // Procesa línea a línea: si la línea contiene un placeholder inactivo, la elimina
  const mensaje = templateNormalizado
    .split("\n")
    .map(line => {
      let l = line;
      for (const { ph, activo, valor } of sustituciones) {
        if (l.includes(ph)) {
          if (!activo) return null;
          l = l.replace(ph, valor);
        }
      }
      return l;
    })
    .filter(line => line !== null && line.trim() !== "")
    .join("\n");

  // Añade link de Google Calendar si está activado y hay fecha y hora
  if (negocio.googleCalendarLink && campos.fecha && campos.hora && form.dia && form.hora) {
    const calLink = generarLinkGoogleCalendar(form, negocio);
    return mensaje + `\n\n${calLink}`;
  }
  return mensaje;
}

/**
 * Genera el link de Google Calendar con los datos de la reserva.
 */
export function generarLinkGoogleCalendar(form, negocio) {
  const [y, m, d] = form.dia.split("-");
  const [h, min] = form.hora.split(":").map(Number);
  const fechaBase = `${y}${m}${d}`;
  const startStr = `${fechaBase}T${String(h).padStart(2, "0")}${String(min).padStart(2, "0")}00`;

  const duracion = negocio.slotInterval ?? 30;
  const totalMin = h * 60 + min + duracion;
  const endH = Math.floor(totalMin / 60) % 24;
  const endMin = totalMin % 60;
  const endStr = `${fechaBase}T${String(endH).padStart(2, "0")}${String(endMin).padStart(2, "0")}00`;

  const title = `${negocio.encabezadoMensaje?.replace(/\*/g, "") || "Reserva"} - ${form.nombre || "Cliente"}`;
  const extrasLines = (negocio.preguntasExtra ?? [])
    .filter((p) => p.guardado && form.extras?.[p.id])
    .map((p) => `${p.label}: ${form.extras[p.id]}`);
  const details = [
    form.telefono && `Tel: ${form.telefono}`,
    (negocio.camposActivos?.personas !== false) && form.personas && `Personas: ${form.personas}`,
    form.servicio && `Servicio: ${form.servicio}`,
    ...extrasLines,
  ].filter(Boolean).join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startStr}/${endStr}`,
    details,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
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
    (negocio.camposActivos?.personas !== false) && `👥 Personas: ${form.personas}`,
    "",
    `📞 Contacto: ${negocio.telefono}`,
    "",
    `_Guarda este mensaje como comprobante._`,
    `_La reserva queda confirmada cuando el negocio te responda._`,
  ];
  return lineas.filter(Boolean).join("\n");
}

export function generarLinkComprobante(form, negocio) {
  return `https://wa.me/?text=${encodeURIComponent(generarComprobante(form, negocio))}`;
}
