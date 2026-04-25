/**
 * negocio.js
 * Configuración por defecto del negocio.
 * En producción, el negocio la sobreescribe desde el panel /admin.
 */

export const MENSAJE_TEMPLATE_DEFAULT = `{encabezado}

👤 Nombre: {nombre}
📞 Teléfono: {telefono}
👥 Personas: {personas}
🕐 Hora: {hora}
📅 Día: {dia}
{mensajeExtra}
✅ ¡Gracias! Reserva hecha.`;

export const NEGOCIO_DEFAULT = {
  nombre: "Olla Perú",
  descripcion: "",           // texto corto debajo del nombre (ej: "Restaurante peruano en el centro")
  links: ["", ""],          // hasta 2 URLs externas (web, instagram, etc.)
  logoUrl: "",               // URL de la imagen del logo del negocio
  whatsapp: "34695078648",   // sin espacios ni +
  telefono: "+34695078648",  // con prefijo para el enlace tel:
  storageKey: "turno_ya_reserva",
  pinAdmin: "1234",
  minPersonas: 1,
  maxPersonas: 20,
  slotInterval: 30,          // minutos entre slots de hora
  antelacionMinHoras: 2,     // horas mínimas de antelación para reservar
  antelacionMaxDias: 30,     // días máximos hacia adelante que puede reservar el cliente
  aforoPorSlot: 0,           // 0 = sin límite (requiere panel de reservas para funcionar)
  cierreTemporalFecha: "",   // YYYY-MM-DD: si coincide con hoy, el negocio está cerrado ese día

  // Servicios: si hay al menos uno, el cliente elige servicio y la duración del slot cambia
  // Estructura: [{ nombre: "Corte", duracion: 30 }, ...]
  servicios: [],

  // Preguntas extra del formulario definidas por el admin
  // Estructura: [{ id: "alergia", label: "¿Tienes alguna alergia?", tipo: "texto" | "seleccion", opciones: ["Op1","Op2"] }]
  preguntasExtra: [],

  perfil: "reserva",

  // Campos del formulario activos (el dueño puede desactivar los que no necesite)
  camposActivos: {
    nombre: true,
    telefono: true,
    email: true,
    personas: true,
    fecha: true,
    hora: true,
    mensaje: true,
  },

  tituloFormulario: "Reservas", // título visible en el formulario del cliente
  textoBtnReservar: "Reservar",  // texto del botón de envío
  textoTelefono: "También puedes reservar por teléfono",
  mostrarTelefono: true,
  tema: "claro",             // "claro" | "oscuro" | "personalizado"
  colorFondo: "#ffffff",     // solo para tema personalizado
  colorAcento: "#aa3bff",   // solo para tema personalizado
  colorBorde: "#e5e4e7",    // solo para tema personalizado
  temasGuardados: [],       // [{ id, nombre, colorFondo, colorAcento, colorBorde }]
  colorNegocio: "#7c3aed",   // color del nombre del negocio en el formulario

  encabezadoMensaje: "🍽️ *Nueva Reserva*",
  googleCalendarLink: false,
  mensajeTemplate: MENSAJE_TEMPLATE_DEFAULT,

  // Fechas bloqueadas puntualmente (formato YYYY-MM-DD)
  fechasBloqueadas: [],

  // Horarios por día (0=dom ... 6=sáb). Array vacío = cerrado.
  horarios: {
    0: [{ start: "12:00", end: "22:00" }],
    1: [],
    2: [{ start: "12:00", end: "16:00" }],
    3: [{ start: "12:00", end: "16:00" }, { start: "19:00", end: "22:30" }],
    4: [{ start: "12:00", end: "16:00" }, { start: "19:00", end: "22:30" }],
    5: [{ start: "12:00", end: "23:00" }],
    6: [{ start: "12:00", end: "23:00" }],
  },
};

export const CONFIG_KEY = "turno_ya_config";

/** Lee la config en este orden: widget > localStorage > defaults.
 *  La config de Supabase se carga al iniciar la app en main.jsx
 *  y se guarda en localStorage como caché. */
export function getConfig() {
  // 1. Config inyectada por el widget (data-config attribute)
  if (window.__TURNO_YA_CONFIG__) {
    return { ...NEGOCIO_DEFAULT, ...window.__TURNO_YA_CONFIG__ };
  }
  // 2. Config cacheada (viene de Supabase o del admin)
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) return { ...NEGOCIO_DEFAULT, ...JSON.parse(saved) };
  } catch {
    // config corrupta, usa defaults
  }
  return NEGOCIO_DEFAULT;
}
