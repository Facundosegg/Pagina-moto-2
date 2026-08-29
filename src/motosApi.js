import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { DEFAULT_MOTOS } from "./data.js";

export async function fetchMotos() {
  if (!isSupabaseConfigured) return DEFAULT_MOTOS;
  const { data, error } = await supabase.from("motos").select("*").order("id", { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertMoto(payload) {
  if (!isSupabaseConfigured) throw new Error("Supabase no está configurado todavía.");
  const { data, error } = await supabase.from("motos").insert([payload]).select();
  if (error) throw error;
  return data[0];
}

export async function updateMotoById(id, payload) {
  if (!isSupabaseConfigured) throw new Error("Supabase no está configurado todavía.");
  const { error } = await supabase.from("motos").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteMotoById(id) {
  if (!isSupabaseConfigured) throw new Error("Supabase no está configurado todavía.");
  const { error } = await supabase.from("motos").delete().eq("id", id);
  if (error) throw error;
}

// Escucha cambios en la tabla "motos" en tiempo real (para que si alguien
// más carga una moto, se actualice sola en las pantallas de otros
// visitantes sin que tengan que refrescar). Requiere haber habilitado
// Realtime para la tabla en Supabase (ver README).
export function subscribeToMotos(onChange) {
  if (!isSupabaseConfigured) return () => {};
  const channel = supabase
    .channel("motos-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "motos" }, onChange)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
