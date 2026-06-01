import { useState } from "react";
import { getConfig, CONFIG_KEY } from "../config/negocio";
import { saveConfig, verificarPinRemoto, SLUG } from "../lib/supabase";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function horariosToForm(horarios) {
  return Object.fromEntries(
    Object.entries(horarios).map(([day, turnos]) => [
      day,
      {
        abierto: turnos.length > 0,
        turnos: turnos.length > 0 ? turnos : [{ start: "12:00", end: "22:00" }],
      },
    ])
  );
}

function formToHorarios(form) {
  return Object.fromEntries(
    Object.entries(form).map(([day, { abierto, turnos }]) => [
      day,
      abierto ? turnos : [],
    ])
  );
}

export { DIAS, horariosToForm, formToHorarios };

export function useAdminConfig() {
  const config = getConfig();

  const esNuevo = window.__RESERVAQ_NUEVO__ === true;

  const [pin, setPin] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pinConfirmar, setPinConfirmar] = useState("");
  const [crearError, setCrearError] = useState("");

  const [draft, setDraft] = useState({
    nombre: config.nombre,
    tema: config.tema ?? "claro",
    colorFondo: config.colorFondo ?? "#ffffff",
    colorAcento: config.colorAcento ?? "#aa3bff",
    colorBorde: config.colorBorde ?? "#e5e4e7",
    tituloFormulario: config.tituloFormulario ?? "Reservas",
    textoBtnReservar: config.textoBtnReservar ?? "Reservar",
    textoTelefono: config.textoTelefono ?? "También puedes reservar por teléfono",
    mostrarTelefono: config.mostrarTelefono ?? true,
    temasGuardados: config.temasGuardados ?? [],
    temasFavoritos: config.temasFavoritos ?? [],
    descripcion: config.descripcion ?? "",
    links: config.links ?? ["", ""],
    logoUrl: config.logoUrl ?? "",
    mostrarNombre: config.mostrarNombre ?? true,
    mostrarPanelAyuda: config.mostrarPanelAyuda ?? true,
    colorNegocio: config.colorNegocio ?? "#7c3aed",
    nombreSize: config.nombreSize ?? "md",
    whatsapp: config.whatsapp,
    telefono: config.telefono,
    minPersonas: config.minPersonas ?? 1,
    maxPersonas: config.maxPersonas,
    slotInterval: config.slotInterval,
    antelacionMinHoras: config.antelacionMinHoras,
    antelacionMaxDias: config.antelacionMaxDias ?? 30,
    aforoPorSlot: config.aforoPorSlot ?? 0,
    cierreTemporalFecha: config.cierreTemporalFecha ?? "",
    servicios: config.servicios ?? [],
    preguntasExtra: config.preguntasExtra ?? [],
    tituloPreguntasExtra: config.tituloPreguntasExtra ?? "",
    textoPoliticaPrivacidad: config.textoPoliticaPrivacidad ?? "",
    textoAvisoLegal: config.textoAvisoLegal ?? "",
    pinAdmin: config.pinAdmin,
    horarios: horariosToForm(config.horarios),
    fechasBloqueadas: config.fechasBloqueadas ?? [],
    perfil: config.perfil ?? "reserva",
    googleCalendarLink: config.googleCalendarLink ?? false,
    minutosParaHistorial: config.minutosParaHistorial ?? 120,
    modoEnvio: config.modoEnvio ?? "whatsapp",
    perfilEmail: config.perfilEmail ?? "reserva",
    emailNegocio: config.emailNegocio ?? "",
    emailConfirmacion: config.emailConfirmacion ?? false,
    encabezadoMensaje: config.encabezadoMensaje ?? "🍽️ *Nueva Reserva*",
    textoPie: config.textoPie ?? "✅ ¡Gracias! Reserva hecha.",
    camposActivos: config.camposActivos ?? { nombre: true, telefono: true, personas: true, fecha: true, hora: true, mensaje: true },
    mensajeTemplate: config.mensajeTemplate,
  });

  const [nuevaFecha, setNuevaFecha] = useState("");

  const addFechaBloqueada = () => {
    if (!nuevaFecha || draft.fechasBloqueadas.includes(nuevaFecha)) return;
    setDraft((prev) => ({
      ...prev,
      fechasBloqueadas: [...prev.fechasBloqueadas, nuevaFecha].sort(),
    }));
    setNuevaFecha("");
  };

  const removeFechaBloqueada = (fecha) => {
    setDraft((prev) => ({
      ...prev,
      fechasBloqueadas: prev.fechasBloqueadas.filter((f) => f !== fecha),
    }));
  };

  const [guardado, setGuardado] = useState(false);

  const crearPerfil = async (e) => {
    e.preventDefault();
    if (!pin) { setCrearError("Introduce un PIN"); return; }
    if (pin !== pinConfirmar) { setCrearError("Los PINs no coinciden"); return; }
    try {
      const configInicial = { ...getConfigFinal(), pinAdmin: pin };
      await saveConfig(configInicial, pin);
      localStorage.setItem(CONFIG_KEY, JSON.stringify({ data: configInicial, cachedAt: Date.now() }));
      window.__RESERVAQ_NUEVO__ = false;
      setAutenticado(true);
      setCrearError("");
    } catch (err) {
      setCrearError(err.message);
    }
  };

  const verificarPin = async (e) => {
    e.preventDefault();
    try {
      const ok = await verificarPinRemoto(pin, SLUG);
      if (ok) {
        setAutenticado(true);
        setPinError("");
      } else {
        setPinError("PIN incorrecto");
      }
    } catch {
      setPinError("Error al verificar PIN");
    }
  };

  const setField = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const setDia = (day, data) => {
    setDraft((prev) => ({
      ...prev,
      horarios: { ...prev.horarios, [day]: { ...prev.horarios[day], ...data } },
    }));
  };

  const setTurno = (day, index, field, value) => {
    setDraft((prev) => {
      const turnos = [...prev.horarios[day].turnos];
      turnos[index] = { ...turnos[index], [field]: value };
      return {
        ...prev,
        horarios: { ...prev.horarios, [day]: { ...prev.horarios[day], turnos } },
      };
    });
  };

  const addTurno = (day) => {
    setDraft((prev) => {
      const turnos = [...prev.horarios[day].turnos, { start: "12:00", end: "16:00" }];
      return {
        ...prev,
        horarios: { ...prev.horarios, [day]: { ...prev.horarios[day], turnos } },
      };
    });
  };

  const removeTurno = (day, index) => {
    setDraft((prev) => {
      const turnos = prev.horarios[day].turnos.filter((_, i) => i !== index);
      return {
        ...prev,
        horarios: { ...prev.horarios, [day]: { ...prev.horarios[day], turnos } },
      };
    });
  };

  // Servicios
  const addServicio = () => {
    setDraft((prev) => ({
      ...prev,
      servicios: [...prev.servicios, { nombre: "", horaInicio: "09:00", horaFin: "17:00", guardado: false }],
    }));
  };

  const removeServicio = (index) => {
    setDraft((prev) => ({
      ...prev,
      servicios: prev.servicios.filter((_, i) => i !== index),
    }));
  };

  const setServicio = (index, field, value) => {
    setDraft((prev) => {
      const servicios = [...prev.servicios];
      servicios[index] = { ...servicios[index], [field]: value };
      return { ...prev, servicios };
    });
  };

  // Preguntas extra
  const addPregunta = () => {
    setDraft((prev) => ({
      ...prev,
      preguntasExtra: [...prev.preguntasExtra, { id: `p${Date.now()}`, label: "", tipo: "texto", campoTipo: "input", opciones: [], requerida: false, guardado: false }],
    }));
  };

  const removePregunta = (index) => {
    setDraft((prev) => ({
      ...prev,
      preguntasExtra: prev.preguntasExtra.filter((_, i) => i !== index),
    }));
  };

  const setPregunta = (index, field, value) => {
    setDraft((prev) => {
      const preguntasExtra = [...prev.preguntasExtra];
      preguntasExtra[index] = { ...preguntasExtra[index], [field]: value };
      return { ...prev, preguntasExtra };
    });
  };

  const addTemaGuardado = (nombre) => {
    const nuevo = {
      id: `tg_${Date.now()}`,
      nombre,
      colorFondo: draft.colorFondo,
      colorAcento: draft.colorAcento,
      colorBorde: draft.colorBorde,
    };
    setDraft((prev) => ({ ...prev, temasGuardados: [...prev.temasGuardados, nuevo] }));
  };

  const removeTemaGuardado = (id) => {
    setDraft((prev) => ({
      ...prev,
      temasGuardados: prev.temasGuardados.filter((t) => t.id !== id),
    }));
  };

  const toggleFavorito = (id) => {
    setDraft((prev) => {
      const favs = prev.temasFavoritos ?? [];
      return {
        ...prev,
        temasFavoritos: favs.includes(id)
          ? favs.filter((fid) => fid !== id)
          : [...favs, id],
      };
    });
  };

  const getConfigFinal = () => ({
    ...draft,
    horarios: formToHorarios(draft.horarios),
    fechasBloqueadas: draft.fechasBloqueadas,
  });

  const [errorGuardado, setErrorGuardado] = useState("");

  const guardar = async (e) => {
    e.preventDefault();
    const configFinal = getConfigFinal();
    try {
      await saveConfig(configFinal, pin);
      localStorage.setItem(CONFIG_KEY, JSON.stringify({ data: configFinal, cachedAt: Date.now() }));
      window.dispatchEvent(new StorageEvent("storage", { key: CONFIG_KEY }));
      window.dispatchEvent(new CustomEvent("reservaq:tema", { detail: configFinal }));
      setPin(configFinal.pinAdmin);
      setErrorGuardado("");
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } catch (err) {
      setErrorGuardado(err.message);
    }
  };

  const exportarWidget = () => {
    const config = getConfigFinal();
    const { pinAdmin: _, storageKey: __, ...configPublica } = config;
    return JSON.stringify({ ...configPublica, slug: SLUG });
  };

  return {
    pin, setPin,
    autenticado,
    pinError,
    verificarPin,
    esNuevo,
    pinConfirmar, setPinConfirmar,
    crearError,
    crearPerfil,
    draft,
    setField,
    setDia,
    setTurno,
    addTurno,
    removeTurno,
    nuevaFecha, setNuevaFecha,
    addFechaBloqueada,
    removeFechaBloqueada,
    guardar,
    guardado,
    errorGuardado,
    exportarWidget,
    addServicio, removeServicio, setServicio,
    addPregunta, removePregunta, setPregunta,
    addTemaGuardado, removeTemaGuardado, toggleFavorito,
    getConfigFinal,
  };
}
