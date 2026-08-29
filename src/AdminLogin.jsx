import React, { useState } from "react";
import { LogIn, X } from "lucide-react";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

export default function AdminLogin({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#EDE8DC] w-full max-w-sm">
        <div className="bg-[#15151A] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-[#F5B700]" />
            <h3 className="font-display text-xl uppercase tracking-wide text-[#F4F0E6]">Acceso administrador</h3>
          </div>
          <button onClick={onClose} className="text-[#B9B6AC] hover:text-[#F4F0E6]" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <p className="text-sm text-[#5B5852]">Entrá con el usuario que creaste en Supabase para cargar y editar motos.</p>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 focus:outline-none focus:border-[#C1440E]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 focus:outline-none focus:border-[#C1440E]"
            />
          </label>
          {error && <p className="text-sm text-[#C1440E]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-[#F5B700] text-[#15151A] font-medium px-5 py-2.5 hover:bg-[#17171C] hover:text-[#F4F0E6] transition-colors disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" /> {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
