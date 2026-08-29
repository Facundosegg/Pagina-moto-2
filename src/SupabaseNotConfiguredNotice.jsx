import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function SupabaseNotConfiguredNotice({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#EDE8DC] w-full max-w-sm">
        <div className="bg-[#15151A] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#F5B700]" />
            <h3 className="font-display text-xl uppercase tracking-wide text-[#F4F0E6]">Falta un paso</h3>
          </div>
          <button onClick={onClose} className="text-[#B9B6AC] hover:text-[#F4F0E6]" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <p className="text-sm text-[#17171C]">
            Para cargar motos desde acá primero hay que conectar la base de datos (es gratis y se hace una sola vez).
          </p>
          <p className="text-sm text-[#5B5852]">
            Seguí la sección <span className="font-mono">"Cargar motos con perfil de administrador"</span> del
            README.md que viene con el proyecto. Mientras tanto, el sitio muestra un catálogo de ejemplo.
          </p>
          <button onClick={onClose} className="self-start bg-[#17171C] text-[#F4F0E6] px-4 py-2 text-sm hover:bg-[#C1440E] transition-colors">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
