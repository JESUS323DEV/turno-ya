import { useEffect, useMemo, useState } from "react";
import { getConfig, NEGOCIO_DEFAULT } from "../config/negocio";
import { generarMensaje, generarLink, generarLinkComprobante } from "../utils/whatsapp";
import { generarSlots } from "../utils/slots";

const FORM_INICIAL = {
  nombre: "",
  telefono: "",
  email: "",
  hora: "",
  dia: "",
  mensaje: "",
  personas: 1,
  servicio: "",
  extras: {},
};

const TOUCHED_INICIAL = {
  nombre: false,
  telefono: false,
  email: false,
  hora: false,
  dia: false,
  personas: false,
};

const today = new Date().toISOString().split("T")[0];

function getMaxDate(antelacionMaxDias) {
  const d = new Date();
  d.setDate(d.getDate() + (antelacionMaxDias ?? 30));
  return d.toISOString().split("T")[0];
}

function getDayIndex(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

function isDiaCerrado(dateStr, horarios, fechasBloqueadas) {
  if (!dateStr) return true;
  if (fechasBloqueadas.includes(dateStr)) return true;
  const day = getDayIndex(dateStr);
  return day === null || (horarios[day]?.length ?? 0) === 0;
}

export function useReservaForm(configOverride = null) {
  const negocio = configOverride ? { ...NEGOCIO_DEFAULT, ...configOverride } : getConfig();

  const [form, setForm] = useState(FORM_INICIAL);
  const [touched, setTouched] = useState(TOUCHED_INICIAL);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(negocio.storageKey);
      if (saved) setForm((prev) => ({ ...prev, ...JSON.parse(saved) }));
    } catch {
      // ignorar
    }
  }, [negocio.storageKey]);

  const maxDate = useMemo(() => getMaxDate(negocio.antelacionMaxDias), [negocio.antelacionMaxDias]);

  // Reloj que se actualiza cada minuto para filtrar servicios en tiempo real
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const intervalo = setInterval(() => setAhora(new Date()), 60000);
    return () => clearInterval(intervalo);
  }, []);

  // Servicios cuyo horario no ha terminado aún hoy
  const serviciosDisponibles = useMemo(() => {
    if (!negocio.servicios?.length) return [];
    const currentMin = ahora.getHours() * 60 + ahora.getMinutes();
    return negocio.servicios.filter((s) => {
      if (!s.guardado || !s.nombre.trim()) return false;
      if (!s.horaFin) return true;
      const [h, m] = s.horaFin.split(":").map(Number);
      return currentMin < h * 60 + m;
    });
  }, [negocio.servicios, ahora]);

  // Si el servicio tiene rango propio (horaInicio/horaFin), restringe los horarios a ese rango
  const horariosEfectivos = useMemo(() => {
    if (negocio.servicios?.length > 0 && form.servicio) {
      const s = negocio.servicios.find((s) => s.nombre === form.servicio);
      if (s?.horaInicio && s?.horaFin) {
        const range = [{ start: s.horaInicio, end: s.horaFin }];
        return Object.fromEntries(
          Object.entries(negocio.horarios).map(([day, turnos]) => [day, turnos.length > 0 ? range : []])
        );
      }
    }
    return negocio.horarios;
  }, [negocio.servicios, negocio.horarios, form.servicio]);

  // Slots disponibles para el día seleccionado
  const slots = useMemo(
    () => generarSlots(form.dia, horariosEfectivos, negocio.slotInterval, negocio.antelacionMinHoras, negocio.cierreTemporalFecha),
    [form.dia, horariosEfectivos, negocio.slotInterval, negocio.antelacionMinHoras, negocio.cierreTemporalFecha]
  );

  const campos = { nombre: true, telefono: true, email: true, personas: true, fechaHora: true, ...negocio.camposActivos };

  // Validaciones
  const nombreOk = form.nombre.trim().length >= 2;
  const telefonoOk = /^\d{9,15}$/.test(form.telefono);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const diaOk = form.dia !== "" && !isDiaCerrado(form.dia, negocio.horarios, negocio.fechasBloqueadas ?? []);
  const horaOk = slots.includes(form.hora);
  const personasOk = Number(form.personas) >= (negocio.minPersonas ?? 1) && Number(form.personas) <= negocio.maxPersonas;

  const extrasOk = (negocio.preguntasExtra ?? [])
    .filter((p) => p.requerida)
    .every((p) => !!form.extras?.[p.id]?.trim?.() || !!form.extras?.[p.id]);

  const canSend =
    (!campos.nombre    || nombreOk) &&
    (!campos.telefono  || telefonoOk) &&
    (!campos.email     || emailOk) &&
    (!campos.personas  || personasOk) &&
    (!campos.fechaHora || (diaOk && horaOk)) &&
    extrasOk;

  const whatsappText = useMemo(() => generarMensaje(form, negocio), [form, negocio]);
  const whatsappLink = useMemo(() => generarLink(whatsappText, negocio.whatsapp), [whatsappText, negocio.whatsapp]);
  const comprobanteLink = useMemo(() => generarLinkComprobante(form, negocio), [form, negocio]);

  const touch = (field) => setTouched((p) => ({ ...p, [field]: true }));

  const handleExtra = (id, value) => {
    setForm((prev) => ({ ...prev, extras: { ...prev.extras, [id]: value } }));
  };

  const handleChange = (field, rawValue) => {
    let value = rawValue;

    if (field === "nombre") {
      value = rawValue.replace(/[^A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]/g, "").replace(/\s{2,}/g, " ");
    } else if (field === "telefono") {
      value = rawValue.replace(/[^\d]/g, "");
    }

    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // Si cambia el día o el servicio, recalcular si la hora sigue siendo válida
      if (field === "dia" || field === "servicio") {
        const servicioSeleccionado = field === "servicio"
          ? negocio.servicios?.find((s) => s.nombre === value)
          : negocio.servicios?.find((s) => s.nombre === next.servicio);
        let horariosEfectivosLocal = negocio.horarios;
        if (servicioSeleccionado?.horaInicio && servicioSeleccionado?.horaFin) {
          const range = [{ start: servicioSeleccionado.horaInicio, end: servicioSeleccionado.horaFin }];
          horariosEfectivosLocal = Object.fromEntries(
            Object.entries(negocio.horarios).map(([day, turnos]) => [day, turnos.length > 0 ? range : []])
          );
        }
        const nuevosSlots = generarSlots(next.dia, horariosEfectivosLocal, negocio.slotInterval, negocio.antelacionMinHoras, negocio.cierreTemporalFecha);
        if (!nuevosSlots.includes(next.hora)) {
          next.hora = "";
        }
      }

      return next;
    });
  };

  const limpiar = () => {
    setForm(FORM_INICIAL);
    setTouched(TOUCHED_INICIAL);
    try {
      localStorage.removeItem(negocio.storageKey);
    } catch {
      // ignorar
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setTouched({ nombre: true, telefono: true, hora: true, dia: true, personas: true });
    if (!canSend) return;

    try {
      localStorage.setItem(negocio.storageKey, JSON.stringify(form));
    } catch {
      // ignorar
    }
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
    setEnviado(true);
  };

  const resetEnviado = () => {
    setEnviado(false);
    limpiar();
  };

  const fieldState = (field, isOk) => {
    if (!touched[field]) return "";
    return isOk ? "input-ok" : "input-bad";
  };

  return {
    form,
    touched,
    today,
    canSend,
    diaOk,
    nombreOk,
    telefonoOk,
    emailOk,
    horaOk,
    personasOk,
    slots,
    handleChange,
    touch,
    limpiar,
    onSubmit,
    fieldState,
    negocio,
    enviado,
    comprobanteLink,
    resetEnviado,
    maxDate,
    handleExtra,
    serviciosDisponibles,
    campos,
  };
}
