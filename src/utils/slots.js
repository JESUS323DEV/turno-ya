function getDayIndex(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

function timeToMinutes(t) {
  const [h, min] = t.split(":").map(Number);
  return h * 60 + min;
}

function minutesToTime(min) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Genera los slots de hora disponibles para una fecha dada.
 * Filtra slots pasados si la fecha es hoy, aplicando la antelación mínima.
 * Si cierreTemporalFecha coincide con la fecha, devuelve [].
 */
export function generarSlots(dateStr, horarios, slotInterval = 30, antelacionMinHoras = 0, cierreTemporalFecha = "") {
  const day = getDayIndex(dateStr);
  if (day === null) return [];

  const todayStr = new Date().toISOString().split("T")[0];

  // Cierre temporal: si hoy es la fecha de cierre, no hay slots
  if (dateStr === todayStr && cierreTemporalFecha === todayStr) return [];

  const ranges = horarios[day];
  if (!ranges || ranges.length === 0) return [];

  let minMinutos = 0;

  if (dateStr === todayStr) {
    const now = new Date();
    minMinutos = now.getHours() * 60 + now.getMinutes() + antelacionMinHoras * 60;
  }

  const slots = [];

  for (const { start, end } of ranges) {
    let current = timeToMinutes(start);
    let endMin = timeToMinutes(end);
    const isSingleSlot = start === end;

    // Midnight-crossing range (e.g. 20:00–00:00): treat 00:00 as 24*60
    if (endMin <= current && !isSingleSlot) endMin += 24 * 60;

    while (current <= endMin && (isSingleSlot || current + slotInterval <= endMin)) {
      if (current >= minMinutos) {
        slots.push(minutesToTime(current));
      }
      current += slotInterval;
    }
  }

  return slots;
}
