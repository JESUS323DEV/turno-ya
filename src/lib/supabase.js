import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = (url && key) ? createClient(url, key) : null;

function getSlug() {
  const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
  return path || import.meta.env.VITE_NEGOCIO_SLUG || "negocio";
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
