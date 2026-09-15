import React, { useEffect, useState } from "react";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

export default function ResetPasswordView() {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setChecking(false);
      return;
    }
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setHasSession(Boolean(data.session));
        setChecking(false);
      }
    });

    // Supabase manda el evento PASSWORD_RECOVERY apenas procesa el link
    // del mail — a veces llega justo después del primer chequeo de arriba.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
        setChecking(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      setError("La contraseña tiene que tener al menos 6 caracteres.");
      return;
    }
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError("No se pudo actualizar. Pedí un link nuevo e intentá de nuevo.");
      return;
    }
    setDone(true);
    await supabase.auth.signOut();
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#15151A] p-6 text-center">
        <p className="text-[#F4F0E6] text-sm max-w-xs">Supabase no está configurado.</p>
      </div>
    );
  }

  if (checking) {
    return <div className="min-h-screen bg-[#15151A]" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#15151A] p-4">
      <div className="bg-[#EDE8DC] w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#F5B700]" />
          <h1 className="font-display text-xl uppercase tracking-wide text-[#17171C]">Nueva contraseña</h1>
        </div>

        {!hasSession ? (
          <p className="text-sm text-[#5B5852]">
            Este link no es válido o ya venció. Volvé a la pantalla de inicio de sesión de tu sitio y pedí uno
            nuevo con "¿Olvidaste tu contraseña?".
          </p>
        ) : done ? (
          <p className="text-sm text-[#17171C] inline-flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />
            Listo, tu contraseña se actualizó. Ya podés cerrar esta pestaña y volver a entrar a tu sitio con la
            contraseña nueva.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-sm text-[#5B5852]">Elegí tu nueva contraseña.</p>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Contraseña nueva</span>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 font-mono focus:outline-none focus:border-[#C1440E]"
              />
            </label>
            {error && <p className="text-sm text-[#C1440E]">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-[#F5B700] text-[#15151A] font-medium px-5 py-2.5 hover:bg-[#17171C] hover:text-white transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
