import React, { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadMotoImage } from "./storageApi.js";

export default function SingleImageUpload({ label, value, onChange, hint }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadMotoImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message || "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">{label}</span>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      {value && (
        <img src={value} alt={label} className="h-16 w-auto max-w-[220px] object-contain border border-[#D8D2C0] bg-white p-1" />
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 bg-[#17171C] text-white text-xs px-3 py-2 hover:bg-[#C1440E] transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
          {value ? "Cambiar" : "Subir imagen"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="inline-flex items-center gap-1 text-xs text-[#8B8D8F] hover:text-[#C1440E]">
            <X className="w-3 h-3" /> Sacar
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-[#8B8D8F]">{hint}</p>}
      {error && <p className="text-xs text-[#C1440E]">{error}</p>}
    </div>
  );
}
