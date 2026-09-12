import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

const MAX_SIZE_MB = 8;

async function uploadImageToBucket(file, bucket) {
  if (!isSupabaseConfigured) throw new Error("Supabase no está configurado todavía.");
  if (!file.type.startsWith("image/")) throw new Error("Ese archivo no es una imagen.");
  if (file.size > MAX_SIZE_MB * 1024 * 1024) throw new Error(`La foto pesa demasiado (máximo ${MAX_SIZE_MB}MB).`);

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    if (error.message?.includes("Bucket not found")) {
      throw new Error(`Falta crear el espacio de fotos "${bucket}" en Supabase (ver README).`);
    }
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Sube varias fotos a la vez. Si alguna falla, las demás igual se suben
// y se avisa cuáles no se pudieron subir.
async function uploadImagesToBucket(files, bucket) {
  const results = await Promise.allSettled(Array.from(files).map((f) => uploadImageToBucket(f, bucket)));
  const urls = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  const failed = results.filter((r) => r.status === "rejected").length;
  return { urls, failed };
}

// Fotos del catálogo (las carga el administrador logueado).
export function uploadMotoImage(file) {
  return uploadImageToBucket(file, "motos");
}
export function uploadMotoImages(files) {
  return uploadImagesToBucket(files, "motos");
}
