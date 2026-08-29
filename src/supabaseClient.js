import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// true recién cuando cargaste tus datos reales de Supabase (ver README,
// sección "Cargar motos con perfil de administrador"). Hasta entonces el
// sitio funciona igual, pero muestra el catálogo de ejemplo y el botón
// de "Cargar motos" explica qué falta configurar.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
