import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

export function useAdminSession(clienteId) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setChecking(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  }

  const belongsToThisCliente = !clienteId || session?.user?.user_metadata?.cliente_id === clienteId;

  return { session, isAdmin: Boolean(session) && belongsToThisCliente, checking, logout };
}
