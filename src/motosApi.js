import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { DEFAULT_MOTOS } from "./data.js";

// clienteId: en modo demo (sin cliente resuelto) se ignora y se muestra
// el catálogo de ejemplo. Con un cliente real, siempre se filtra por su
// id, así cada dominio ve solo sus propias motos.
export async function fetchMotos(clienteId) {
  if (!isSupabaseConfigured || !clienteId) return DEFAULT_MOTOS;
  const { data, error } = await supabase
    .from("motos")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("id", { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertMoto(payload, clienteId) {
  if (!isSupabaseConfigured) throw new Error("Supabase no está configurado todavía.");
  const { data, error } = await supabase
    .from("motos")
    .insert([{ ...payload, cliente_id: clienteId }])
    .select();
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

// Escucha cambios en la tabla "motos" en tiempo real, filtrado a las
// motos de ESTE cliente (para que un cambio en el sitio de otro cliente
// no dispare recargas acá). Requiere haber habilitado Realtime para la
// tabla en Supabase (ver README).
export function subscribeToMotos(clienteId, onChange) {
  if (!isSupabaseConfigured || !clienteId) return () => {};
  const channel = supabase
    .channel(`motos-changes-${clienteId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "motos", filter: `cliente_id=eq.${clienteId}` }, onChange)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
