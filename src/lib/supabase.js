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
  return data.datos;
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

/** Lee las reservas del negocio desde Supabase. */
export async function fetchReservas(slug) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reservas")
    .select("*")
    .eq("slug", slug)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

/** Devuelve las horas de reservas confirmadas para una fecha concreta. */
export async function fetchReservasByFecha(slug, fecha) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reservas")
    .select("hora")
    .eq("slug", slug)
    .eq("dia", fecha)
    .eq("estado", "confirmada");
  if (error) return [];
  return data ?? [];
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

/** Envía la reserva por email via Edge Function. */
export async function enviarReserva(form, slug) {
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
      body: JSON.stringify({ form, slug }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al enviar");
  return json;
}
