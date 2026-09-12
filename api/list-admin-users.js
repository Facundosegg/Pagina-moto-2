import { getSupabaseAdmin } from "./_lib/supabaseAdmin.js";
import { verifySuperAdmin } from "./_lib/verifySuperAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const caller = await verifySuperAdmin(req);
  if (!caller) {
    return res.status(403).json({ error: "No autorizado" });
  }

  const { clienteId } = req.body || {};
  if (!clienteId) {
    return res.status(400).json({ error: "Falta el cliente." });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    // Supabase no deja filtrar listUsers por metadata directo, así que
    // traemos la lista (hasta 1000, de sobra para esta plataforma) y
    // filtramos acá los que pertenecen a este cliente.
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const usuarios = data.users
      .filter((u) => u.user_metadata?.cliente_id === clienteId)
      .map((u) => ({ id: u.id, email: u.email, created_at: u.created_at }));

    return res.status(200).json({ usuarios });
  } catch (err) {
    return res.status(500).json({ error: "Error inesperado listando usuarios." });
  }
}
