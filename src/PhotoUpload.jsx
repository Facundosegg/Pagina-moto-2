import React, { useRef, useState } from "react";
import { ImagePlus, Loader2, X, Star } from "lucide-react";
import { uploadMotoImages } from "./storageApi.js";

// value: array de URLs (la primera es la "portada", la que se ve en el catálogo)
export default function PhotoUpload({ value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const files = e.target.files;
    e.target.value = ""; // permite volver a elegir los mismos archivos si hace falta
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const { urls, failed } = await uploadMotoImages(files);
      if (urls.length > 0) onChange([...value, ...urls]);
      if (failed > 0) {
        setError(
          failed === 1 ? "Una foto no se pudo subir. Probá de nuevo con esa." : `${failed} fotos no se pudieron subir. Probá de nuevo con esas.`
        );
      }
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(index) {
    onChange(value.filter((_, i) => i !== index));
  }

  function makeCover(index) {
    if (index === 0) return;
    const next = [...value];
    const [chosen] = next.splice(index, 1);
    next.unshift(chosen);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Fotos (opcional)</span>

      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((url, i) => (
            <div key={url + i} className="relative w-20 h-20 group">
              <img src={url} alt={`Foto ${i + 1}`} className="w-20 h-20 object-cover border border-[#D8D2C0]" />
              {i === 0 ? (
                <span className="absolute top-0.5 left-0.5 bg-[#F5B700] text-[#15151A] text-[9px] font-mono px-1 py-0.5 flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-current" /> Portada
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(i)}
                  className="absolute inset-x-0 bottom-0 bg-black/60 text-[#F4F0E6] text-[9px] py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Usar como portada"
                >
                  Hacer portada
                </button>
              )}
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute -top-1.5 -right-1.5 bg-[#C1440E] text-[#F4F0E6] rounded-full w-4 h-4 flex items-center justify-center"
                aria-label={`Sacar foto ${i + 1}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center justify-center gap-2 border border-dashed border-[#8B8D8F] text-[#5B5852] text-sm px-4 py-4 hover:border-[#C1440E] hover:text-[#C1440E] transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Subiendo...
          </>
        ) : (
          <>
            <ImagePlus className="w-4 h-4" /> {value.length > 0 ? "Agregar más fotos" : "Tocá para elegir fotos"}
          </>
        )}
      </button>

      {error && <p className="text-xs text-[#C1440E]">{error}</p>}
      <p className="text-xs text-[#8B8D8F]">
        Podés elegir varias a la vez. La primera (marcada "Portada") es la que se ve en el catálogo — tocá "Hacer
        portada" en cualquier otra para cambiarla. Se puede dejar sin fotos.
      </p>
    </div>
  );
}
