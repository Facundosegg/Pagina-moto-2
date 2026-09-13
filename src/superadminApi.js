import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

export async function listClientes() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from("clientes").select("*").order("nombre_negocio", { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertCliente(payload) {
  if (!isSupabaseConfigured) throw new Error("Supabase no está configurado todavía.");
  const { data, error } = await supabase.from("clientes").insert([payload]).select();
  if (error) throw error;
  return data[0];
}

export async function updateClienteById(id, payload) {
  if (!isSupabaseConfigured) throw new Error("Supabase no está configurado todavía.");
  const { error } = await supabase.from("clientes").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteClienteById(id) {
  if (!isSupabaseConfigured) throw new Error("Supabase no está configurado todavía.");
  const { error } = await supabase.from("clientes").delete().eq("id", id);
  if (error) throw error;
}

// --- Gestión privada (plata, contacto, notas) — tabla separada,
// nunca la lee el sitio público, solo vos desde el panel. ---

export async function getGestion(clienteId) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from("clientes_gestion").select("*").eq("cliente_id", clienteId).maybeSingle();
  if (error) throw error;
  return data;
}

// Trae la gestión de TODOS los clientes de una, para mostrar
// etiquetas (pausado / atrasado) en la lista sin pedir una por una.
export async function listGestion() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from("clientes_gestion").select("*");
  if (error) throw error;
  return data;
}

export async function upsertGestion(clienteId, payload) {
  if (!isSupabaseConfigured) throw new Error("Supabase no está configurado todavía.");
  const { error } = await supabase.from("clientes_gestion").upsert({ cliente_id: clienteId, ...payload }, { onConflict: "cliente_id" });
  if (error) throw error;
}
