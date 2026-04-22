export const PERFILES = [
  {
    id: "reserva",
    label: "🍽️ Reserva",
    camposActivos: { nombre: true, telefono: true, email: true, personas: true, fechaHora: true, mensaje: true },
    mensajeTemplate: `🍽️ *Nueva Reserva*\n\n👤 Nombre: {nombre}\n📞 Teléfono: {telefono}\n📧 Email: {email}\n👥 Personas: {personas}\n📅 Día: {dia}\n🕐 Hora: {hora}\n{mensajeExtra}\n✅ ¡Gracias!`,
  },
  {
    id: "cita",
    label: "📅 Cita",
    camposActivos: { nombre: true, telefono: true, email: true, personas: false, fechaHora: true, mensaje: true },
    mensajeTemplate: `📅 *Nueva Cita*\n\n👤 Nombre: {nombre}\n📞 Teléfono: {telefono}\n📧 Email: {email}\n📅 Día: {dia}\n🕐 Hora: {hora}\n{mensajeExtra}`,
  },
  {
    id: "consulta",
    label: "💬 Consulta",
    camposActivos: { nombre: true, telefono: false, email: true, personas: false, fechaHora: false, mensaje: true },
    mensajeTemplate: `💬 *Nueva Consulta*\n\n👤 Nombre: {nombre}\n📧 Email: {email}\n{mensajeExtra}`,
  },
  {
    id: "personalizado",
    label: "⚙️ Personalizado",
    camposActivos: null,
    mensajeTemplate: null,
  },
];
