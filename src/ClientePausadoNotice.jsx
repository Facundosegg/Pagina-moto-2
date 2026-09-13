import React from "react";
import { PauseCircle } from "lucide-react";

export default function ClientePausadoNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#15151A] p-6">
      <div className="max-w-sm text-center flex flex-col items-center gap-3">
        <PauseCircle className="w-10 h-10 text-[#F5B700]" />
        <h1 className="font-display text-2xl uppercase tracking-wide text-[#F4F0E6]">Sitio pausado</h1>
        <p className="text-sm text-[#B9B6AC]">
          Este sitio está temporalmente pausado. Si sos el dueño de este negocio, contactá a quien administra la
          plataforma para reactivarlo.
        </p>
      </div>
    </div>
  );
}
