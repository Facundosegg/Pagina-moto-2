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

  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: "Falta el usuario a borrar." });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Error inesperado borrando el usuario." });
  }
}
