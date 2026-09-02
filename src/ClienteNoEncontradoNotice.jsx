import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ClienteNoEncontradoNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#15151A] p-6">
      <div className="max-w-sm text-center flex flex-col items-center gap-3">
        <AlertTriangle className="w-10 h-10 text-[#F5B700]" />
        <h1 className="font-display text-2xl uppercase tracking-wide text-[#F4F0E6]">Sitio no configurado</h1>
        <p className="text-sm text-[#B9B6AC]">
          Este dominio todavía no tiene un cliente dado de alta en la base de datos. Si sos el administrador de la
          plataforma, agregá una fila en la tabla <span className="font-mono">clientes</span> con este dominio (ver
          README, sección "Múltiples clientes").
        </p>
      </div>
    </div>
  );
}
