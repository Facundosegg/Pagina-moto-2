import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

// Registra un evento (no bloquea la interfaz ni rompe nada si falla —
// es solo estadística, no algo crítico para el visitante).
export function logEvento(clienteId, motoId, tipo) {
  if (!isSupabaseConfigured || !clienteId || !motoId) return;
  supabase
    .from("moto_eventos")
    .insert([{ cliente_id: clienteId, moto_id: motoId, tipo }])
    .then(
      () => {},
      () => {}
    );
}

// Trae y resume las estadísticas de un cliente: { [moto_id]: { vistas, consultas } }
export async function fetchStatsForCliente(clienteId) {
  if (!isSupabaseConfigured || !clienteId) return {};
  const { data, error } = await supabase.from("moto_eventos").select("moto_id, tipo").eq("cliente_id", clienteId);
  if (error) throw error;

  const stats = {};
  for (const row of data) {
    if (!stats[row.moto_id]) stats[row.moto_id] = { vistas: 0, consultas: 0 };
    if (row.tipo === "vista") stats[row.moto_id].vistas += 1;
    else if (row.tipo === "consulta") stats[row.moto_id].consultas += 1;
  }
  return stats;
}
