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
