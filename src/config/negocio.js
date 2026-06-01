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
{pie}`;

export const NEGOCIO_DEFAULT = {
  nombre: "Olla Perú",
  descripcion: "",           // texto corto debajo del nombre (ej: "Restaurante peruano en el centro")
  links: ["", ""],          // hasta 2 URLs externas (web, instagram, etc.)
  logoUrl: "",               // URL de la imagen del logo del negocio
  mostrarNombre: true,       // mostrar nombre del negocio en el formulario público
  mostrarPanelAyuda: true,   // mostrar columna/btn de ayuda en el formulario
  whatsapp: "34695078648",   // sin espacios ni +
  telefono: "+34695078648",  // con prefijo para el enlace tel:
  storageKey: "reservaq_reserva",
  pinAdmin: "",
  mostrarLogo: true,
  mostrarLegal: true,
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
    apellidos: false,
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
  temasFavoritos: [],       // [id, ...]
  colorNegocio: "#7c3aed",   // color del nombre del negocio en el formulario
  nombreSize: "md",          // tamaño del nombre: "xs" | "sm" | "md"

  encabezadoMensaje: "🍽️ *Nueva Reserva*",
  textoPie: "✅ ¡Gracias! Reserva hecha.",
  googleCalendarLink: false,
  modoEnvio: "whatsapp",   // "whatsapp" | "email"
  emailNegocio: "",         // email del dueño para recibir reservas en modo email
  mensajeTemplate: MENSAJE_TEMPLATE_DEFAULT,

  // Fechas bloqueadas puntualmente (formato YYYY-MM-DD)
  fechasBloqueadas: [],

  textoPoliticaPrivacidad: `Política de Privacidad

Responsable del tratamiento: [Nombre o razón social], con NIF [NIF], y dirección en [Dirección].

Finalidad: Los datos personales recogidos a través de este formulario (nombre, teléfono, email) se utilizan exclusivamente para gestionar su reserva y contactar con usted al respecto.

Legitimación: Ejecución de un contrato o solicitud precontractual (art. 6.1.b RGPD).

Conservación: Los datos se conservarán durante el tiempo necesario para gestionar la reserva y el período legal exigible.

Destinatarios: No se cederán datos a terceros salvo obligación legal.

Derechos: Puede ejercer sus derechos de acceso, rectificación, supresión, limitación y portabilidad enviando un correo a [email de contacto].`,

  textoAvisoLegal: `Aviso Legal

Titular del sitio web: [Nombre o razón social]
NIF: [NIF]
Domicilio: [Dirección completa]
Email de contacto: [email]

El acceso y uso de este sitio web implica la aceptación de las presentes condiciones. El titular se reserva el derecho de modificar los contenidos sin previo aviso.

Este sitio web ha sido desarrollado con la plataforma Reservaq (www.reservaq.com).`,

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

export const CONFIG_KEY = "reservaq_config";
const CONFIG_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Lee la config en este orden: widget > localStorage > defaults.
 *  La config de Supabase se carga al iniciar la app en main.jsx
 *  y se guarda en localStorage como caché. */
export function getConfig() {
  // 1. Config inyectada por el widget (data-config attribute)
  if (window.__RESERVAQ_CONFIG__) {
    return { ...NEGOCIO_DEFAULT, ...window.__RESERVAQ_CONFIG__ };
  }
  // 2. Config cacheada (viene de Supabase o del admin)
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const data = parsed.cachedAt ? parsed.data : parsed;
      const cachedAt = parsed.cachedAt ?? 0;
      if (Date.now() - cachedAt < CONFIG_TTL_MS) {
        return { ...NEGOCIO_DEFAULT, ...data };
      }
      localStorage.removeItem(CONFIG_KEY);
    }
  } catch {
    // config corrupta, usa defaults
  }
  return NEGOCIO_DEFAULT;
}
