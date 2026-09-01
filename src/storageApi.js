import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

const BUCKET = "motos";
const MAX_SIZE_MB = 8;

export async function uploadMotoImage(file) {
  if (!isSupabaseConfigured) throw new Error("Supabase no está configurado todavía.");
  if (!file.type.startsWith("image/")) throw new Error("Ese archivo no es una imagen.");
  if (file.size > MAX_SIZE_MB * 1024 * 1024) throw new Error(`La foto pesa demasiado (máximo ${MAX_SIZE_MB}MB).`);

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    if (error.message?.includes("Bucket not found")) {
      throw new Error('Falta crear el espacio de fotos "motos" en Supabase (ver README).');
    }
    throw error;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
