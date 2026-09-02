import React, { useState } from "react";
import { LogIn, X } from "lucide-react";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

export default function AdminLogin({ clienteId, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      setError("Usuario o contraseña incorrectos.");
      return;
    }
    const userClienteId = data.user?.user_metadata?.cliente_id;
    if (clienteId && userClienteId !== clienteId) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Ese usuario no es administrador de este sitio.");
      return;
    }
    setLoading(false);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[var(--c-paper)] w-full max-w-sm">
        <div className="bg-[var(--c-dark)] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-[var(--c-signal)]" />
            <h3 className="font-display text-xl uppercase tracking-wide text-[var(--c-paper2)]">Acceso administrador</h3>
          </div>
          <button onClick={onClose} className="text-[#B9B6AC] hover:text-[var(--c-paper2)]" aria-label="Cerrar">
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
              className="bg-white border border-[#D8D2C0] text-[var(--c-ink)] text-sm px-3 py-2 focus:outline-none focus:border-[var(--c-rust)]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border border-[#D8D2C0] text-[var(--c-ink)] text-sm px-3 py-2 focus:outline-none focus:border-[var(--c-rust)]"
            />
          </label>
          {error && <p className="text-sm text-[var(--c-rust)]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-[var(--c-signal)] text-[var(--c-dark)] font-medium px-5 py-2.5 hover:bg-[var(--c-ink)] hover:text-[var(--c-paper2)] transition-colors disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" /> {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
