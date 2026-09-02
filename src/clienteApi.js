import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

// Mapea cada columna de color de la tabla "clientes" a la variable CSS
// que controla ese color en todo el sitio (ver src/index.css).
const THEME_VARS = {
  color_signal: "--c-signal",
  color_dark: "--c-dark",
  color_paper: "--c-paper",
  color_rust: "--c-rust",
  color_paper2: "--c-paper2",
  color_ink: "--c-ink",
};

export function applyTheme(cliente) {
  if (!cliente) return;
  for (const [field, cssVar] of Object.entries(THEME_VARS)) {
    if (cliente[field]) document.documentElement.style.setProperty(cssVar, cliente[field]);
  }
}

// Busca en la tabla "clientes" cuál corresponde a este sitio.
// - Normalmente, por el dominio desde el que se está entrando.
// - Si la URL tiene ?cliente=algún-slug, prioriza eso (para probar en
//   localhost o en una preview de Vercel, donde el dominio no coincide
//   con ninguno real).
// Devuelve null si Supabase no está configurado, o si no hay ningún
// cliente dado de alta para este dominio.
export async function fetchClienteActual() {
  if (!isSupabaseConfigured) return null;

  const params = new URLSearchParams(window.location.search);
  const slugOverride = params.get("cliente");

  let query = supabase.from("clientes").select("*");
  query = slugOverride ? query.eq("slug", slugOverride) : query.eq("dominio", window.location.hostname);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}
