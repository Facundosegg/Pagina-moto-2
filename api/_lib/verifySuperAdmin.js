import { createClient } from "@supabase/supabase-js";

// Usa la URL y la clave anon (públicas, no son secreto) solo para validar
// el token que manda el navegador — no para operaciones privilegiadas.
export async function verifySuperAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  if (data.user.user_metadata?.is_superadmin !== true) return null;
  return data.user;
}
