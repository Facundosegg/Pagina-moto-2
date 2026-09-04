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

  const { email, password, clienteId } = req.body || {};
  if (!email || !password || !clienteId) {
    return res.status(400).json({ error: "Faltan datos (email, contraseña o cliente)." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña tiene que tener al menos 6 caracteres." });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { cliente_id: clienteId },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ id: data.user.id, email: data.user.email });
  } catch (err) {
    return res.status(500).json({ error: "Error inesperado creando el usuario." });
  }
}
