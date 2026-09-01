import React, { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadMotoImage } from "./storageApi.js";

export default function PhotoUpload({ value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo si hace falta
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadMotoImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message || "No se pudo subir la foto. Probá de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Foto (opcional)</span>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {value ? (
        <div className="flex items-center gap-3">
          <img src={value} alt="Foto de la moto" className="w-20 h-20 object-cover border border-[#D8D2C0]" />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 bg-[#17171C] text-[#F4F0E6] text-xs px-3 py-2 hover:bg-[#C1440E] transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
              Cambiar foto
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1.5 text-[#8B8D8F] text-xs hover:text-[#C1440E]"
            >
              <X className="w-3.5 h-3.5" /> Sacar foto
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 border border-dashed border-[#8B8D8F] text-[#5B5852] text-sm px-4 py-6 hover:border-[#C1440E] hover:text-[#C1440E] transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Subiendo...
            </>
          ) : (
            <>
              <ImagePlus className="w-4 h-4" /> Tocá para elegir una foto
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-[#C1440E]">{error}</p>}
      <p className="text-xs text-[#8B8D8F]">Se puede dejar sin foto — se muestra una ficha con ícono en su lugar.</p>
    </div>
  );
}
