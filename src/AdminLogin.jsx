import React, { useState } from "react";
import { LogIn, X, KeyRound, Mail } from "lucide-react";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { RESET_PASSWORD_URL } from "./data.js";

export default function AdminLogin({ clienteId, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [recuperarEmail, setRecuperarEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [recuperarError, setRecuperarError] = useState("");

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

  async function handleRecuperar(e) {
    e.preventDefault();
    if (!isSupabaseConfigured || !recuperarEmail.trim()) return;
    setEnviando(true);
    setRecuperarError("");
    const { error } = await supabase.auth.resetPasswordForEmail(recuperarEmail.trim(), {
      redirectTo: RESET_PASSWORD_URL,
    });
    setEnviando(false);
    if (error) {
      setRecuperarError("No se pudo enviar el mail. Probá de nuevo en un rato.");
      return;
    }
    setEnviado(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[var(--c-paper)] w-full max-w-sm">
        <div className="bg-[var(--c-dark)] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {modoRecuperar ? <KeyRound className="w-5 h-5 text-[var(--c-signal)]" /> : <LogIn className="w-5 h-5 text-[var(--c-signal)]" />}
            <h3 className="font-display text-xl uppercase tracking-wide text-[var(--c-paper2)]">
              {modoRecuperar ? "Recuperar contraseña" : "Acceso administrador"}
            </h3>
          </div>
          <button onClick={onClose} className="text-[#B9B6AC] hover:text-[var(--c-paper2)]" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!modoRecuperar ? (
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            <p className="text-sm text-[#5B5852]">Entrá con el usuario que te dieron para cargar y editar motos.</p>
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
            <button
              type="button"
              onClick={() => {
                setModoRecuperar(true);
                setRecuperarEmail(email);
                setEnviado(false);
                setRecuperarError("");
              }}
              className="text-xs text-[#8B8D8F] hover:text-[var(--c-ink)] self-center"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        ) : (
          <form onSubmit={handleRecuperar} className="p-5 flex flex-col gap-4">
            {enviado ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[var(--c-ink)] inline-flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0 text-[var(--c-signal)]" />
                  Si ese email tiene una cuenta, te llega un mensaje con un link para elegir una contraseña nueva.
                  Revisá también la carpeta de spam.
                </p>
                <button
                  type="button"
                  onClick={() => setModoRecuperar(false)}
                  className="self-start text-sm text-[#8B8D8F] hover:text-[var(--c-ink)]"
                >
                  Volver a iniciar sesión
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#5B5852]">Te mandamos un link a tu email para elegir una contraseña nueva.</p>
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Email</span>
                  <input
                    type="email"
                    required
                    value={recuperarEmail}
                    onChange={(e) => setRecuperarEmail(e.target.value)}
                    className="bg-white border border-[#D8D2C0] text-[var(--c-ink)] text-sm px-3 py-2 focus:outline-none focus:border-[var(--c-rust)]"
                  />
                </label>
                {recuperarError && <p className="text-sm text-[var(--c-rust)]">{recuperarError}</p>}
                <button
                  type="submit"
                  disabled={enviando}
                  className="inline-flex items-center justify-center gap-2 bg-[var(--c-signal)] text-[var(--c-dark)] font-medium px-5 py-2.5 hover:bg-[var(--c-ink)] hover:text-[var(--c-paper2)] transition-colors disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" /> {enviando ? "Enviando..." : "Enviar link"}
                </button>
                <button
                  type="button"
                  onClick={() => setModoRecuperar(false)}
                  className="text-xs text-[#8B8D8F] hover:text-[var(--c-ink)] self-center"
                >
                  Volver a iniciar sesión
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
