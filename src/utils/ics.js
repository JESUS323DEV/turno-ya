/**
 * Genera y descarga un archivo .ics (calendario) para una reserva.
 */

function pad(n) {
  return String(n).padStart(2, "0");
}

function toIcsDate(dateStr, timeStr) {
  // dateStr: "YYYY-MM-DD", timeStr: "HH:MM"
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  return `${y}${pad(m)}${pad(d)}T${pad(h)}${pad(min)}00`;
}

function addMinutes(dateStr, timeStr, minutes) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  const total = h * 60 + min + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newMin = total % 60;
  return `${y}${pad(m)}${pad(d)}T${pad(newH)}${pad(newMin)}00`;
}

export function descargarIcs(form, negocio) {
  const duracion = negocio.slotInterval ?? 30;
  const dtStart = toIcsDate(form.dia, form.hora);
  const dtEnd = addMinutes(form.dia, form.hora, duracion);
  const uid = `turno-ya-${Date.now()}@turno-ya`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TurnoYA//ES",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Reserva en ${negocio.nombre}`,
    `DESCRIPTION:${form.personas} persona(s) · ${negocio.telefono}`,
    `LOCATION:${negocio.nombre}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reserva.ics";
  a.click();
  URL.revokeObjectURL(url);
}
