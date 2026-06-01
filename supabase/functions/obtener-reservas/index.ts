import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { slug, pin } = await req.json();

    if (!slug || !pin) {
      return new Response(JSON.stringify({ error: "Faltan parámetros" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verificar PIN
    const { data: configData, error: configError } = await supabase
      .from("config")
      .select("datos")
      .eq("id", slug)
      .single();

    if (configError || !configData) {
      return new Response(JSON.stringify({ error: "Negocio no encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pinGuardado = configData.datos?.pinAdmin;

    if (!pinGuardado || pin !== pinGuardado) {
      return new Response(JSON.stringify({ error: "PIN incorrecto" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PIN correcto, devolver reservas
    const { data, error } = await supabase
      .from("reservas")
      .select("*")
      .eq("slug", slug)
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: "Error al obtener reservas" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: data ?? [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
