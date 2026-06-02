import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = (url && key) ? createClient(url, key) : null;

function getSlug() {
  try {
    const widgetEl = document.getElementById("reservaq");
    if (widgetEl) {
      const cfg = JSON.parse(widgetEl.getAttribute("data-config") || "{}");
      if (cfg.slug) return cfg.slug.toLowerCase();
    }
  } catch {}
  const segments = window.location.pathname.replace(/^\//, "").replace(/\/$/, "").toLowerCase().split("/");
  return segments[0] || import.meta.env.VITE_NEGOCIO_SLUG || "negocio";
}

export function getSubpage() {
  const segments = window.location.pathname.replace(/^\//, "").replace(/\/$/, "").toLowerCase().split("/");
  return segments[1] || null;
}

export const SLUG = getSlug();

/** Lee la config del negocio desde Supabase. */
export async function fetchConfig() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("config")
    .select("datos")
    .eq("id", SLUG)
    .single();

  if (error || !data) return null;
  const { pinAdmin, ...datosSeguros } = data.datos ?? {};
  return { ...datosSeguros, _hasPinAdmin: !!(pinAdmin) };
}

/** Guarda la config via Edge Function (verifica el PIN en el servidor).
 *  Sin Supabase, no hace nada — localStorage lo gestiona useAdminConfig. */
export async function saveConfig(datos, pin) {
  if (!supabase) return;
  const res = await fetch(
    `${url}/functions/v1/guardar-config`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": key,
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({ config: datos, pin, slug: SLUG }),
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al guardar");
  return json;
}

/** Lee las reservas del negocio via Edge Function (requiere PIN). */
export async function fetchReservas(slug, pin) {
  if (!url || !key) return [];
  const res = await fetch(`${url}/functions/v1/obtener-reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": key, "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ slug, pin }),
  });
  const json = await res.json();
  if (!res.ok) return [];
  return json.data ?? [];
}

/** Devuelve las horas ocupadas para una fecha concreta (sin datos personales). */
export async function fetchReservasByFecha(slug, fecha) {
  if (!url || !key) return [];
  const res = await fetch(`${url}/functions/v1/obtener-slots-ocupados`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": key, "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ slug, fecha }),
  });
  const json = await res.json();
  if (!res.ok) return [];
  return json.data ?? [];
}

/** Confirma, cancela o elimina una reserva via Edge Function (verifica PIN). */
export async function accionReserva(id, accion, pin, slug) {
  if (!url || !key) throw new Error("Supabase no configurado");
  const res = await fetch(`${url}/functions/v1/confirmar-reserva`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": key, "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ id, accion, pin, slug }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error");
  return json;
}

/** Verifica el PIN del admin en el servidor. Nunca compara en el cliente. */
export async function verificarPinRemoto(pin, slug) {
  if (!url || !key) throw new Error("Supabase no configurado");
  const res = await fetch(`${url}/functions/v1/verificar-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": key, "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ pin, slug }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al verificar PIN");
  return json.ok === true;
}

/** Lee la config pública de un negocio sin PIN (para el widget embebido). */
export async function fetchConfigPublica(slug) {
  if (!url || !key) return null;
  const res = await fetch(`${url}/functions/v1/config-publica`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": key, "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ slug }),
  });
  const json = await res.json();
  if (!res.ok) return null;
  return json.config ?? null;
}

/** Envía la reserva por email via Edge Function. */
export async function enviarReserva(form, slug, perfil = "reserva") {
  if (!url || !key) throw new Error("Supabase no configurado");
  const res = await fetch(
    `${url}/functions/v1/enviar-reserva`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": key,
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({ form, slug, perfil }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al enviar");
  return json;
}
