import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/** Lee la config del negocio desde Supabase. */
export async function fetchConfig() {
  const { data, error } = await supabase
    .from("config")
    .select("datos")
    .eq("id", "negocio")
    .single();

  if (error || !data) return null;
  return data.datos;
}

/** Guarda la config via Edge Function (verifica el PIN en el servidor). */
export async function saveConfig(datos, pin) {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guardar-config`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ config: datos, pin }),
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al guardar");
  return json;
}
